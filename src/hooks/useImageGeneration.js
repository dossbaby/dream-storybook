import { GoogleGenAI } from '@google/genai';
import { AI_MODELS, ANIME_STYLES } from '../utils/aiConfig';

// 이미지 생성 훅 - 모든 모드에서 공통으로 사용
export const useImageGeneration = (tier = 'free') => {
    const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY;

    // 티어별 이미지 모델 선택
    const imageModelName = AI_MODELS.image[tier] || AI_MODELS.image.free;

    // 리딩 타입별 기본 분위기 (스타일이 없을 때 fallback) - 색상 고정 제거
    const TYPE_ATMOSPHERE = {
        dream: 'dreamy atmosphere, soft lighting, ethereal glow',
        tarot: 'mystical tarot atmosphere, ethereal glow, cinematic composition',
        fortune: 'celestial fortune atmosphere, cosmic energy, mystical lighting'
    };

    /**
     * 단일 이미지 생성
     * @param {string} prompt - 장면 묘사 (Claude가 생성한 프롬프트)
     * @param {string} styleKey - 애니메 스타일 키 (Claude가 선택, 예: 'kyoani', 'mappa_dark')
     * @param {string} characterDesc - 캐릭터 설명 (일관성용)
     * @param {string} readingType - 리딩 타입 ('dream', 'tarot', 'fortune') - fallback용
     */
    const generateSingleImage = async (prompt, styleKey = 'shinkai', characterDesc = '', readingType = 'tarot') => {
        if (!geminiApiKey) return null;

        // 스타일 prefix 결정: ANIME_STYLES에서 가져오거나, 기본 분위기 사용
        const stylePrefix = ANIME_STYLES[styleKey] || ANIME_STYLES.shinkai;
        const atmosphere = TYPE_ATMOSPHERE[readingType] || TYPE_ATMOSPHERE.tarot;

        // 디버깅: 실제 사용되는 모델과 스타일 확인
        console.log(`🎨 Image Generation - Tier: ${tier}, Model: ${imageModelName}, Style: ${styleKey}`);

        try {
            const ai = new GoogleGenAI({ apiKey: geminiApiKey });

            // 프롬프트 구성: 스타일 + 분위기 + 장면 + 캐릭터
            let fullPrompt = `${stylePrefix}. ${atmosphere}. ${prompt}`;
            if (characterDesc) {
                fullPrompt += ` SAME CHARACTER: ${characterDesc}.`;
            }
            fullPrompt += ' No text, no watermark.';

            // Gemini 3 Pro Image vs Gemini 2.5 Flash Image
            const isGemini3Pro = imageModelName.includes('gemini-3');

            let response;
            if (isGemini3Pro) {
                // Gemini 3 Pro Image (프리미엄/울트라) - 16:9
                response = await ai.models.generateContent({
                    model: imageModelName,
                    contents: fullPrompt,
                    config: {
                        imageConfig: {
                            aspectRatio: '16:9'
                        }
                    }
                });
            } else {
                // Gemini 2.5 Flash Image (무료) - 기본 설정
                response = await ai.models.generateContent({
                    model: imageModelName,
                    contents: fullPrompt
                });
            }

            // 응답에서 이미지 추출
            if (response.candidates?.[0]?.content?.parts) {
                for (const part of response.candidates[0].content.parts) {
                    if (part.inlineData) {
                        const { data: imgData, mimeType } = part.inlineData;
                        const byteArray = Uint8Array.from(atob(imgData), c => c.charCodeAt(0));
                        return URL.createObjectURL(new Blob([byteArray], { type: mimeType }));
                    }
                }
            }
        } catch (e) {
            console.error('Image generation error:', e);
        }
        return null;
    };

    /**
     * 여러 이미지 순차 생성 (진행 콜백 포함)
     * @param {string[]} prompts - 장면 묘사 배열
     * @param {string} styleKey - 애니메 스타일 키
     * @param {string} characterDesc - 캐릭터 설명
     * @param {string} readingType - 리딩 타입
     * @param {Function} onProgress - 진행 콜백
     */
    const generateImages = async (prompts, styleKey = 'shinkai', characterDesc = '', readingType = 'tarot', onProgress = null) => {
        const images = [];
        for (let i = 0; i < prompts.length; i++) {
            if (onProgress) onProgress(i, prompts.length);
            const image = await generateSingleImage(prompts[i], styleKey, characterDesc, readingType);
            images.push(image);
            // 이미지 생성 간 딜레이
            if (i < prompts.length - 1) {
                await new Promise(r => setTimeout(r, 500));
            }
        }
        return images;
    };

    /**
     * 소셜 공유용 이미지 생성 (9:16 세로 비율)
     * @param {string} prompt - 장면 묘사
     * @param {string} styleKey - 애니메 스타일 키
     * @param {string} characterDesc - 캐릭터 설명
     * @param {string} readingType - 리딩 타입
     */
    const generateShareImage = async (prompt, styleKey = 'shinkai', characterDesc = '', readingType = 'tarot') => {
        if (!geminiApiKey) return null;

        const stylePrefix = ANIME_STYLES[styleKey] || ANIME_STYLES.shinkai;
        const atmosphere = TYPE_ATMOSPHERE[readingType] || TYPE_ATMOSPHERE.tarot;

        console.log(`📱 Share Image Generation - Tier: ${tier}, Model: ${imageModelName}, Style: ${styleKey}, Ratio: 9:16`);

        try {
            const ai = new GoogleGenAI({ apiKey: geminiApiKey });

            // 소셜 공유용 프롬프트 (세로 구도에 최적화)
            let fullPrompt = `${stylePrefix}. ${atmosphere}. ${prompt} Vertical composition, portrait orientation, social media optimized.`;
            if (characterDesc) {
                fullPrompt += ` SAME CHARACTER: ${characterDesc}.`;
            }
            fullPrompt += ' No text, no watermark.';

            const isGemini3Pro = imageModelName.includes('gemini-3');

            let response;
            if (isGemini3Pro) {
                // Gemini 3 Pro - 9:16 세로 비율
                response = await ai.models.generateContent({
                    model: imageModelName,
                    contents: fullPrompt,
                    config: {
                        imageConfig: {
                            aspectRatio: '9:16'
                        }
                    }
                });
            } else {
                // Gemini 2.5 Flash - 기본 설정 (9:16 미지원 시 fallback)
                response = await ai.models.generateContent({
                    model: imageModelName,
                    contents: fullPrompt
                });
            }

            if (response.candidates?.[0]?.content?.parts) {
                for (const part of response.candidates[0].content.parts) {
                    if (part.inlineData) {
                        const { data: imgData, mimeType } = part.inlineData;
                        const byteArray = Uint8Array.from(atob(imgData), c => c.charCodeAt(0));
                        return URL.createObjectURL(new Blob([byteArray], { type: mimeType }));
                    }
                }
            }
        } catch (e) {
            console.error('Share image generation error:', e);
        }
        return null;
    };

    return { generateSingleImage, generateImages, generateShareImage };
};

// 이미지 압축 유틸리티
export const compressImage = async (blobUrl, maxWidth = 800, quality = 0.85) => {
    if (!blobUrl) return null;
    try {
        const response = await fetch(blobUrl);
        const blob = await response.blob();

        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }
                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                const compressed = canvas.toDataURL('image/jpeg', quality);
                resolve(compressed);
            };
            img.onerror = () => resolve(null);
            img.src = URL.createObjectURL(blob);
        });
    } catch (err) {
        return null;
    }
};
