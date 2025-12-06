import { useState } from 'react';
import Anthropic from '@anthropic-ai/sdk';
import { AI_MODELS } from '../utils/aiConfig';

/**
 * AI 꿈 패턴 리포트 생성 훅
 */
export const useAiReport = (myDreams, dreamTypes, openModal, closeModal) => {
    const [aiReport, setAiReport] = useState(null);
    const [loading, setLoading] = useState(false);

    const generateAiReport = async () => {
        if (myDreams.length < 3) {
            alert('리포트를 생성하려면 최소 3개 이상의 꿈이 필요해요');
            return;
        }
        setLoading(true);
        openModal('report');

        try {
            const claudeApiKey = import.meta.env.VITE_CLAUDE_API_KEY;
            const anthropic = new Anthropic({ apiKey: claudeApiKey, dangerouslyAllowBrowser: true });

            const dreamSummaries = myDreams.slice(0, 20).map(d => ({
                title: d.title,
                type: dreamTypes[d.dreamType]?.name || d.dreamType,
                keywords: d.keywords?.map(k => k.word).join(', '),
                date: d.dreamDate
            }));

            const reportPrompt = `너는 꿈 분석 전문가야. 아래는 한 사용자의 최근 꿈 기록이야.
이 꿈들을 분석해서 패턴 리포트를 작성해줘.

꿈 기록:
${JSON.stringify(dreamSummaries, null, 2)}

다음 형식으로 JSON만 반환해:
{
  "overall": "전반적인 분석 (100자)",
  "patterns": ["패턴1 (40자)", "패턴2 (40자)", "패턴3 (40자)"],
  "emotionalState": "현재 감정 상태 추측 (60자)",
  "advice": "조언 (80자)",
  "luckySymbol": {"emoji": "이모지", "name": "행운의 상징", "reason": "이유 (30자)"}
}`;

            const result = await anthropic.messages.create({
                model: AI_MODELS.text,  // Sonnet 4.5
                max_tokens: 800,
                messages: [{ role: "user", content: reportPrompt }]
            });

            let cleanText = result.content[0].text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
            const reportData = JSON.parse(cleanText);
            setAiReport(reportData);
        } catch (e) {
            console.error(e);
            alert('리포트 생성 실패');
            closeModal('report');
        } finally {
            setLoading(false);
        }
    };

    return {
        aiReport,
        setAiReport,
        reportLoading: loading,
        generateAiReport
    };
};
