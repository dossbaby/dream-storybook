import { useState, useEffect } from 'react';
import Anthropic from '@anthropic-ai/sdk';
import { getApiKeys } from '../../utils/analysisHelpers';
import './QuestionSuggestionModal.css';

// 카테고리 정의
const CATEGORIES = [
    { id: 'love', emoji: '💕', label: '연애' },
    { id: 'career', emoji: '💼', label: '직장' },
    { id: 'money', emoji: '💰', label: '재물' },
    { id: 'decision', emoji: '🤔', label: '결정' },
    { id: 'relationship', emoji: '👥', label: '관계' },
    { id: 'future', emoji: '🔮', label: '미래' },
];

// 현재 시간 정보 생성
const getTimeContext = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const weekOfMonth = Math.ceil(now.getDate() / 7);

    // 10월~12월이면 "내년"에 대한 관심이 높음
    const isNearYearEnd = month >= 10;
    const nextYear = year + 1;

    return {
        year,
        month,
        weekOfMonth,
        monthName: `${month}월`,
        weekName: `${weekOfMonth}주차`,
        isNearYearEnd,
        nextYear,
    };
};

const QuestionSuggestionModal = ({ isOpen, onClose, onSelectQuestion }) => {
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // 모달 열릴 때 초기화
    useEffect(() => {
        if (isOpen) {
            setSelectedCategory(null);
            setQuestions([]);
            setError(null);
        }
    }, [isOpen]);

    // 카테고리 선택 시 Haiku로 질문 생성
    const handleCategorySelect = async (category) => {
        setSelectedCategory(category.id);
        setQuestions([]);
        setLoading(true);
        setError(null);

        const timeContext = getTimeContext();
        const apiKeys = getApiKeys();

        if (!apiKeys?.claudeApiKey) {
            setError('API 키가 설정되지 않았어요');
            setLoading(false);
            return;
        }

        try {
            const anthropic = new Anthropic({
                apiKey: apiKeys.claudeApiKey,
                dangerouslyAllowBrowser: true
            });

            const response = await anthropic.messages.create({
                model: 'claude-3-5-haiku-latest',
                max_tokens: 500,
                messages: [{
                    role: 'user',
                    content: `타로 질문 추천 시스템이야. "${category.label}" 카테고리에 맞는 도파민 자극하는 질문 7개 생성해줘.

시간 컨텍스트:
- 현재: ${timeContext.year}년 ${timeContext.monthName} ${timeContext.weekName}
- 가능하면 "이번 주", "이번 달", "최근", "${timeContext.year}년", "올해 안에", "언제" 등 시기를 포함
${timeContext.isNearYearEnd ? `- 연말 시즌! "${timeContext.nextYear}년", "내년", "새해" 관련 질문도 1-2개 포함하면 좋음 (사람들이 내년에 대해 궁금해하는 시기)` : ''}

도파민 질문 원칙:
- 사람들이 정말 궁금해서 클릭하고 싶은 질문
- 구체적이고 현실적인 상황 (막연하지 않게)
- 긍정/부정 양면의 호기심 자극
- 20-40대 한국인이 공감할 수 있는 내용

카테고리별 예시 톤:
- 연애: 그 사람 진심인지, 연락 올지, 재회 가능한지
- 직장/이직: 합격할지, 이직 타이밍, 상사와의 관계
- 재물: 투자 시기, 목돈 들어올지, 지출 조심할 때
- 결정: 지금 결정해도 될지, 선택의 결과
- 사람 관계(연애 제외): 친구/가족/동료와의 갈등, 관계 정리할 때인지, 그 사람 진심인지
- 미래: 올해 운세, 터닝포인트 시기${timeContext.isNearYearEnd ? `, 내년 운세` : ''}

출력 형식 (JSON 배열만, 설명 없이):
["질문1", "질문2", "질문3", "질문4", "질문5", "질문6", "질문7"]`
                }]
            });

            const content = response.content[0].text;
            // JSON 파싱
            const jsonMatch = content.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                setQuestions(parsed);
            } else {
                throw new Error('질문 생성 실패');
            }
        } catch (err) {
            console.error('Question generation error:', err);
            setError('질문을 불러오는 중 문제가 발생했어요');
        } finally {
            setLoading(false);
        }
    };

    // 질문 선택
    const handleQuestionSelect = (question) => {
        onSelectQuestion(question);
        onClose();
    };

    // 모달 외부 클릭 시 닫기
    const handleBackdropClick = (e) => {
        if (e.target.classList.contains('question-modal-backdrop')) {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="question-modal-backdrop" onClick={handleBackdropClick}>
            <div className="question-modal">
                {/* 헤더 */}
                <div className="question-modal-header">
                    <h3>✨ 질문 추천</h3>
                    <button className="modal-close-btn" onClick={onClose}>×</button>
                </div>

                {/* 카테고리 탭 */}
                <div className="category-tabs">
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat.id}
                            className={`category-tab ${selectedCategory === cat.id ? 'active' : ''}`}
                            onClick={() => handleCategorySelect(cat)}
                        >
                            <span className="cat-emoji">{cat.emoji}</span>
                            <span className="cat-label">{cat.label}</span>
                        </button>
                    ))}
                </div>

                {/* 질문 리스트 */}
                <div className="question-list">
                    {!selectedCategory && (
                        <p className="question-placeholder">카테고리를 선택하면 질문을 추천해드릴게요</p>
                    )}

                    {loading && (
                        <div className="question-loading">
                            <span className="loading-spinner">🔮</span>
                            <p>질문을 준비하고 있어요...</p>
                        </div>
                    )}

                    {error && (
                        <p className="question-error">{error}</p>
                    )}

                    {!loading && questions.length > 0 && (
                        <ul className="questions">
                            {questions.map((q, idx) => (
                                <li key={idx} onClick={() => handleQuestionSelect(q)}>
                                    {q}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

export default QuestionSuggestionModal;
