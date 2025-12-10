# AI 프롬프트 스트리밍 & Progressive Loading 전략

> 2-3분 대기 → 체감 10초로 개선하기

---

## 현재 구조 분석

### 파일 구조
```
src/
├── hooks/
│   ├── useReading.js          # 메인 리딩 생성 (타로/꿈/사주)
│   └── useImageGeneration.js  # Gemini 이미지 생성
└── utils/
    ├── aiConfig.js            # AI 모델 설정, ANIME_STYLES
    └── promptCache.js         # 시스템 프롬프트, 캐싱 로직
```

### 현재 플로우 (문제점)
```
[리딩 시작]
    ↓
[Claude API 호출] ←── 전체 JSON 응답 대기 (60-90초)
    ↓
[Gemini 이미지 생성 x5] ←── 순차 생성 (60-90초)
    ↓
[결과 화면 표시]

총 대기 시간: 2-3분 (유저는 빈 화면만 봄)
```

### 기술적 현황
| 항목 | 현재 상태 | 비고 |
|------|----------|------|
| Claude API 호출 | `messages.create()` (비스트리밍) | 전체 응답 대기 |
| 프롬프트 캐싱 | ✅ 구현됨 | `cache_control: ephemeral` |
| 이미지 생성 | 순차 처리 | `await` 체인 |
| UI 피드백 | 도파민 메시지 | 랜덤, 맞춤형 아님 |

---

## 스트리밍 vs 캐싱 (개념 정리)

### 스트리밍 (Streaming)
- **목적**: 응답 속도 체감 개선
- **원리**: AI가 글자 만드는 족족 바로바로 보내줌
- **효과**: ChatGPT처럼 타이핑되는 느낌, 체감 속도 대폭 개선
- **비용**: 동일 (응답 토큰 수는 같음)

### 캐싱 (Caching)
- **목적**: API 비용 절감
- **원리**: 반복되는 시스템 프롬프트를 저장해서 재사용
- **효과**: 입력 토큰 비용 90% 절감
- **속도**: 직접적 영향 없음

---

## 개선 전략: 방식 1 - 병렬 API 호출 + Progressive Loading

### 왜 방식 1인가?
| 방식 | 장점 | 단점 | 추천 |
|------|------|------|------|
| **1. 병렬 호출** | 구현 직관적, 섹션별 독립 관리 | API 호출 수 증가 (비용 약간↑) | ✅ 현 단계 추천 |
| 2. 스트리밍 파싱 | 비용 효율적 (1회 호출) | 파싱 복잡, 프롬프트 구조 변경 필요 | 나중에 최적화 |

### 비용 분석
```
시스템 프롬프트: ~2,000 토큰
Claude Sonnet: $3/1M 입력 토큰

방식 1 (5회 호출): 2,000 x 5 = 10,000 토큰 = $0.03
방식 2 (1회 호출): 2,000 x 1 = 2,000 토큰 = $0.006

차이: 리딩당 ~30원 추가

캐싱 적용 시: 차이 ~3원으로 감소 (90% 절감)

결론: 비용 차이 무시 가능, UX 개선 가치가 훨씬 큼
```

---

## 구현 계획

### Phase 1: 타로 리딩 Progressive Loading

#### 새로운 플로우
```
[카드 선택 완료]
    ↓
[동시에 5개 API 호출 시작] ←── Promise.all 아님! 개별 Promise
    │
    ├── Card 1 분석 ────→ [완료] → 즉시 표시
    ├── Card 2 분석 ────→ [완료] → 즉시 표시
    ├── Card 3 분석 ────→ [완료] → 즉시 표시
    ├── 결론 카드 분석 ──→ [Card 1,2,3 완료 후] → 표시
    └── Hidden Insight ──→ [결론 완료 후] → 표시

[이미지 생성] ←── 각 카드 분석 완료 시 병렬로 시작
```

#### 유저 경험
```
0초: 카드 선택 완료
3초: Card 1 분석 도착 → "첫 번째 카드를 볼까요?" 버튼 활성화
5초: Card 1 이미지 생성 완료
     유저가 Card 1 읽는 동안...
     (백그라운드에서 Card 2, 3, 결론 생성 중)
30초: 유저가 Card 2로 넘어감 → 이미 준비됨! 즉시 표시
60초: 모든 카드 + 결론 + Hidden Insight 완료

체감 시간: 3-5초 (첫 결과 표시까지)
```

### Phase 2: 프롬프트 분리

#### 현재 프롬프트 (단일 거대 JSON)
```javascript
// promptCache.js - getTarotSystemPrompt()
// 모든 카드 분석을 한 번에 요청
{
  "card1Analysis": "...",
  "card2Analysis": "...",
  "card3Analysis": "...",
  "conclusionCard": {...},
  "hiddenInsight": "..."
}
```

#### 개선된 프롬프트 (섹션별 분리)
```javascript
// 새로 만들 파일: src/utils/streamingPrompts.js

// 1. 카드 개별 분석 프롬프트
export const getCardAnalysisPrompt = (cardNumber) => `
너는 타로 마스터다. 이 카드 하나만 깊게 분석해줘.

${cardNumber}번 카드 분석:
- 상황/배경 (2문장)
- 감정 흐름 (2문장)
- 숨은 맥락 (2문장)
- 미처 몰랐던 것 (2문장)
- 반전/디테일 (2문장)

JSON 반환:
{
  "analysis": "700자 이상 분석",
  "transition": "다음 카드 궁금증 유발 문장",
  "imagePrompt": "영어 40단어 이미지 묘사"
}`;

// 2. 결론 카드 프롬프트 (Card 1,2,3 결과 포함)
export const getConclusionPrompt = (card1Result, card2Result, card3Result) => `
앞선 3장의 카드 분석:
${card1Result}
${card2Result}
${card3Result}

이제 4번째 결론 카드로 최종 답을 내려줘.
모든 것을 뒤집는 반전과 함께.
`;

// 3. Hidden Insight 프롬프트 (모든 결과 포함)
export const getHiddenInsightPrompt = (fullAnalysis) => `
전체 리딩 결과를 바탕으로 "봉인 해제" 메시지를 작성해줘.
질문자만 알 수 있는 구체적인 디테일로.
`;
```

### Phase 3: useReading.js 리팩토링

#### 새로운 훅 구조
```javascript
// src/hooks/useProgressiveReading.js

export const useProgressiveReading = () => {
  // 각 섹션별 상태 관리
  const [card1, setCard1] = useState({ loading: true, data: null, image: null });
  const [card2, setCard2] = useState({ loading: true, data: null, image: null });
  const [card3, setCard3] = useState({ loading: true, data: null, image: null });
  const [conclusion, setConclusion] = useState({ loading: true, data: null, image: null });
  const [hiddenInsight, setHiddenInsight] = useState({ loading: true, data: null });

  // 병렬 실행
  const generateTarotReading = async (question, cards) => {
    // Card 1, 2, 3 동시 시작
    const card1Promise = generateCardAnalysis(1, cards[0], question)
      .then(data => {
        setCard1(prev => ({ ...prev, loading: false, data }));
        // 이미지도 바로 시작
        return generateImage(data.imagePrompt).then(img =>
          setCard1(prev => ({ ...prev, image: img }))
        );
      });

    const card2Promise = generateCardAnalysis(2, cards[1], question)
      .then(data => {
        setCard2(prev => ({ ...prev, loading: false, data }));
        return generateImage(data.imagePrompt).then(img =>
          setCard2(prev => ({ ...prev, image: img }))
        );
      });

    const card3Promise = generateCardAnalysis(3, cards[2], question)
      .then(data => {
        setCard3(prev => ({ ...prev, loading: false, data }));
        return generateImage(data.imagePrompt).then(img =>
          setCard3(prev => ({ ...prev, image: img }))
        );
      });

    // Card 1,2,3 완료 후 결론 생성
    Promise.all([card1Promise, card2Promise, card3Promise]).then(() => {
      generateConclusion(card1.data, card2.data, card3.data)
        .then(data => {
          setConclusion(prev => ({ ...prev, loading: false, data }));
          // Hidden Insight는 결론 후
          generateHiddenInsight(/* all data */)
            .then(data => setHiddenInsight(prev => ({ ...prev, loading: false, data })));
        });
    });
  };

  return {
    card1, card2, card3, conclusion, hiddenInsight,
    generateTarotReading,
    // 편의 함수
    isCard1Ready: !card1.loading,
    isAllReady: !hiddenInsight.loading
  };
};
```

### Phase 4: UI 컴포넌트 연동

#### TarotResultView 개선
```jsx
// src/components/tarot/TarotResultView.jsx

const TarotResultView = ({ readingId }) => {
  const { card1, card2, card3, conclusion, hiddenInsight } = useProgressiveReading();
  const [currentCard, setCurrentCard] = useState(0);

  // Card 1이 준비되면 자동으로 첫 화면 표시
  useEffect(() => {
    if (card1.data && currentCard === 0) {
      // 자연스러운 전환 애니메이션
    }
  }, [card1.data]);

  return (
    <div>
      {/* 현재 보고 있는 카드 */}
      {currentCard === 0 && (
        card1.loading ? <CardSkeleton /> : <CardView data={card1} />
      )}

      {/* 다음 버튼 - 다음 카드가 준비됐을 때만 활성화 */}
      <Button
        disabled={currentCard === 1 && card2.loading}
        onClick={() => setCurrentCard(prev => prev + 1)}
      >
        다음 카드 보기
      </Button>

      {/* 진행 상태 표시 */}
      <ProgressIndicator
        card1Ready={!card1.loading}
        card2Ready={!card2.loading}
        card3Ready={!card3.loading}
        conclusionReady={!conclusion.loading}
      />
    </div>
  );
};
```

---

## 도파민 메시지 개선 (Phase 21 연계)

### 현재 문제
- 랜덤 메시지 → 질문과 무관
- 로봇 같은 느낌

### 개선 방향
```
[카드 선택 직후]
    ↓
[Haiku 4.5로 도파민 메시지 선생성] ←── 0.5-1초
    ↓
[Card 1 분석 대기 중...]
    ↓
[도파민 메시지 순차 표시 (타이핑 효과)]
"연애 관련 질문이시네요..."
"첫 번째 카드에서 뭔가 보여요..."
"이건 예상 밖인데..."
    ↓
[Card 1 준비됨!]
```

### 구현
```javascript
// Haiku로 질문 맞춤 도파민 메시지 생성
const generateDopamineMessages = async (question) => {
  const haiku = new Anthropic({ model: 'claude-haiku-4-5' });

  const result = await haiku.messages.create({
    messages: [{
      role: 'user',
      content: `질문: "${question}"

이 질문에 맞는 도파민 메시지 10개 생성.
각 메시지는 15-30자, 호기심 유발, 구체적 힌트.

JSON: { "messages": ["...", "..."] }`
    }]
  });

  return JSON.parse(result.content[0].text).messages;
};
```

---

## 구현 우선순위

### 1단계 (즉시 효과)
- [ ] `useProgressiveReading.js` 훅 생성
- [ ] 타로 카드 개별 프롬프트 분리 (`streamingPrompts.js`)
- [ ] Card 1 먼저 표시하는 UI 로직

### 2단계 (UX 개선)
- [ ] Haiku 도파민 메시지 연동
- [ ] 로딩 중 타이핑 효과 애니메이션
- [ ] 카드 전환 애니메이션

### 3단계 (최적화)
- [ ] 꿈 해몽 적용
- [ ] 사주 적용
- [ ] 캐싱 최적화 (섹션별 프롬프트 캐싱)

### 4단계 (고급)
- [ ] 스트리밍 방식으로 전환 (비용 최적화)
- [ ] WebSocket 기반 실시간 업데이트

---

## 파일 변경 목록

| 파일 | 변경 내용 |
|------|----------|
| `src/hooks/useProgressiveReading.js` | 새로 생성 - 병렬 API 호출 훅 |
| `src/utils/streamingPrompts.js` | 새로 생성 - 섹션별 프롬프트 |
| `src/hooks/useReading.js` | Progressive 훅 연동 |
| `src/components/tarot/TarotResultView.jsx` | 점진적 로딩 UI |
| `src/components/tarot/CardView.jsx` | 개별 카드 컴포넌트 |
| `src/utils/promptCache.js` | 섹션별 캐싱 함수 추가 |

---

## 예상 결과

| 지표 | Before | After |
|------|--------|-------|
| 첫 결과 표시 | 2-3분 | 3-5초 |
| 전체 완료 | 2-3분 | 60-90초 |
| 이탈률 | 높음 (빈 화면) | 낮음 (콘텐츠 제공) |
| 비용 | 1x | 1.1x (캐싱 시 1.01x) |

---

## 참고: 스트리밍 방식 (Phase 4용)

나중에 비용 최적화가 필요하면 단일 API 호출 + 스트리밍 파싱으로 전환 가능:

```javascript
// 스트리밍 방식 예시
const stream = await anthropic.messages.stream({
  model: 'claude-sonnet-4-5',
  max_tokens: 6000,
  messages: [{ role: 'user', content: prompt }]
});

let buffer = '';
for await (const chunk of stream) {
  buffer += chunk.delta?.text || '';

  // Card 1 섹션 완료 감지
  if (buffer.includes('"card1Analysis":') && !card1Parsed) {
    const card1Data = parseCard1Section(buffer);
    setCard1({ loading: false, data: card1Data });
    card1Parsed = true;
  }
  // ... 다른 섹션들
}
```

이 방식은 프롬프트 구조를 파싱하기 쉽게 변경해야 하고 복잡도가 높아서, 먼저 병렬 방식으로 시작하고 나중에 전환하는 것을 추천.
