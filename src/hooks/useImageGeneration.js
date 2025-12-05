import { GoogleGenerativeAI } from '@google/generative-ai';

// 이미지 생성 훅 - 모든 모드에서 공통으로 사용
export const useImageGeneration = () => {
    const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY;

    // 기본 스타일 상수 - 16:9 가로 비율
    const BASE_STYLES = {
        dream: 'Beautiful anime illustration, Makoto Shinkai style. Soft lighting, dreamy atmosphere, pastel and deep blue palette, horizontal 16:9 widescreen aspect ratio, no text.',
        tarot: 'Beautiful anime illustration, Makoto Shinkai style. Mystical tarot atmosphere. Soft lighting, dreamy atmosphere, purple and gold palette, horizontal 16:9 widescreen aspect ratio, no text.',
        fortune: 'Beautiful anime illustration, Makoto Shinkai style. Celestial fortune atmosphere. Soft lighting, dreamy atmosphere, blue and gold palette, horizontal 16:9 widescreen aspect ratio, no text.'
    };

    // 단일 이미지 생성
    const generateSingleImage = async (prompt, styleType = 'dream', characterDesc = '') => {
        if (!geminiApiKey) return null;

        try {
            const genAI = new GoogleGenerativeAI(geminiApiKey);
            const imageModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

            let baseStyle = BASE_STYLES[styleType] || BASE_STYLES.dream;
            if (characterDesc) {
                baseStyle = `${baseStyle} SAME CHARACTER: ${characterDesc}.`;
            }

            const result = await imageModel.generateContent({
                contents: [{ role: 'user', parts: [{ text: `Generate image: ${baseStyle} Scene: ${prompt}` }] }],
                generationConfig: { responseModalities: ['image', 'text'] }
            });

            const response = result.response;
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

    // 여러 이미지 순차 생성 (진행 콜백 포함)
    const generateImages = async (prompts, styleType = 'dream', characterDesc = '', onProgress = null) => {
        const images = [];
        for (let i = 0; i < prompts.length; i++) {
            if (onProgress) onProgress(i, prompts.length);
            const image = await generateSingleImage(prompts[i], styleType, characterDesc);
            images.push(image);
            // 이미지 생성 간 딜레이
            if (i < prompts.length - 1) {
                await new Promise(r => setTimeout(r, 500));
            }
        }
        return images;
    };

    return { generateSingleImage, generateImages };
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
