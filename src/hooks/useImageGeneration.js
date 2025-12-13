import { GoogleGenAI } from '@google/genai';
import { AI_MODELS, combineStyles } from '../utils/aiConfig';

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
     * 단일 이미지 생성 (스튜디오 스타일 기반)
     * @param {string} prompt - 장면 묘사 (Claude가 생성한 프롬프트)
     * @param {string} studioStyle - 스튜디오 스타일 키 (shinkai, ghibli, random 등)
     * @param {string} characterDesc - 캐릭터 설명 (일관성용) - 레거시
     * @param {string} readingType - 리딩 타입 ('dream', 'tarot', 'fortune') - fallback용
     * @param {string} colorPalette - 감정 기반 색상 팔레트
     */
    const generateSingleImage = async (prompt, studioStyle = 'random', characterDesc = '', readingType = 'tarot', colorPalette = '') => {
        if (!geminiApiKey) return null;

        // 스튜디오 스타일 조합
        const stylePrefix = combineStyles(studioStyle);

        const atmosphere = TYPE_ATMOSPHERE[readingType] || TYPE_ATMOSPHERE.tarot;

        // 동적 색상 팔레트 (Claude가 질문 감정에서 추출)
        const colorScheme = colorPalette ? `Color palette: ${colorPalette}.` : '';

        // 디버깅: 실제 사용되는 모델과 스타일 확인
        console.log(`🎨 Image Generation - Tier: ${tier}, Model: ${imageModelName}, Studio: ${studioStyle}, Colors: ${colorPalette || 'default'}`);

        try {
            const ai = new GoogleGenAI({ apiKey: geminiApiKey });

            // 프롬프트 구성: 스타일 + 색상 + 분위기 + 장면 + 캐릭터
            let fullPrompt = `${stylePrefix}. ${colorScheme} ${atmosphere}. ${prompt}`;
            if (characterDesc) {
                fullPrompt += ` SAME CHARACTER: ${characterDesc}.`;
            }
            fullPrompt += ' No text, no watermark.';

            // Gemini 3 Pro Image vs Gemini 2.5 Flash Image
            const isGemini3Pro = imageModelName.includes('gemini-3');

            let response;
            if (isGemini3Pro) {
                // Gemini 3 Pro: config 지원
                response = await ai.models.generateContent({
                    model: imageModelName,
                    contents: fullPrompt,
                    config: {
                        responseModalities: ['image', 'text'],
                        imageConfig: {
                            aspectRatio: '16:9',
                            imageSize: '1K'
                        }
                    }
                });
            } else {
                // Gemini 2.5 Flash: 단순 호출
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
     * @param {string} studioStyle - 스튜디오 스타일 키
     * @param {string} characterDesc - 캐릭터 설명 (레거시)
     * @param {string} readingType - 리딩 타입
     * @param {Function} onProgress - 진행 콜백
     * @param {string} colorPalette - 감정 기반 색상 팔레트
     */
    const generateImages = async (prompts, studioStyle = 'random', characterDesc = '', readingType = 'tarot', onProgress = null, colorPalette = '') => {
        const images = [];
        for (let i = 0; i < prompts.length; i++) {
            if (onProgress) onProgress(i, prompts.length);
            const image = await generateSingleImage(prompts[i], studioStyle, characterDesc, readingType, colorPalette);
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
     * @param {string} studioStyle - 스튜디오 스타일 키
     * @param {string} characterDesc - 캐릭터 설명 (레거시)
     * @param {string} readingType - 리딩 타입
     * @param {string} colorPalette - 감정 기반 색상 팔레트
     */
    const generateShareImage = async (prompt, studioStyle = 'random', characterDesc = '', readingType = 'tarot', colorPalette = '') => {
        if (!geminiApiKey) return null;

        // 스튜디오 스타일 조합
        const stylePrefix = combineStyles(studioStyle);

        const atmosphere = TYPE_ATMOSPHERE[readingType] || TYPE_ATMOSPHERE.tarot;
        const colorScheme = colorPalette ? `Color palette: ${colorPalette}.` : '';

        console.log(`📱 Share Image Generation - Tier: ${tier}, Model: ${imageModelName}, Studio: ${studioStyle}, Colors: ${colorPalette || 'default'}, Ratio: 9:16`);

        try {
            const ai = new GoogleGenAI({ apiKey: geminiApiKey });

            // 소셜 공유용 프롬프트 (세로 구도에 최적화)
            let fullPrompt = `${stylePrefix}. ${colorScheme} ${atmosphere}. ${prompt} Vertical composition, portrait orientation, social media optimized.`;
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
export const compressImage = async (blobUrl, maxWidth = 800, quality = 0.9) => {
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
