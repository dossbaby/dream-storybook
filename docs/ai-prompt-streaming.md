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

#### 새로운 플로우 (수정됨)
```
[질문 입력 + 카드 선택 완료]
    ↓
[오버레이 이미지 생성] ←── 대기 화면용 Hero 이미지 (즉시 시작)
    ↓
[Card 1 분석] → [Card 1 분석 완료] → [Card 1 이미지 생성] → 표시
    ↓
[Card 2 분석] → [Card 2 분석 완료] → [Card 2 이미지 생성] → 표시
    ↓
[Card 3 분석] → [Card 3 분석 완료] → [Card 3 이미지 생성] → 표시
    ↓
[결론 카드] → [결론 분석 완료] → [결론 이미지 생성] → 표시
    ↓
[Hidden Insight] → 표시
```

**핵심: 분석과 이미지가 1:1로 연결!**
- 유저가 Card 1 보러 갈 때 → Card 1 텍스트 + 이미지 둘 다 준비됨
- 각 카드별로 독립적으로 완성

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

---

## 현재 코드 분석 결과 & 발견된 문제점

### 🚨 치명적 발견: 이중 ResultView 구조

현재 **두 개의 결과 뷰**가 존재함:

| 컴포넌트 | 사용 조건 | 상태 |
|----------|----------|------|
| `ResultView.jsx` (구버전) | `view === 'result'` | 레거시 - "프리미엄으로 타로의 비밀 보기" 버튼 있음 |
| `TarotResultView.jsx` (신버전) | `view === 'tarot-result'` | 현재 주력 디자인 |

**문제:**
- 새 리딩 생성 시 → `view === 'result'` → **구버전 ResultView 호출됨**
- "내 리딩 다시 보기" → **구버전으로 연결되는 경우 있음**
- 구버전에서 추가 API 호출이 발생할 수 있음 (심층 분석 등)

**해결 방안:**
1. `ResultView.jsx` 완전 제거 또는 deprecated 처리
2. 모든 타로 결과를 `TarotResultView.jsx`로 통일
3. App.jsx에서 `view === 'result'` 분기를 `view === 'tarot-result'`로 변경

---

## 발견된 버그 & 개선 필요 사항

### 1. 도파민 메시지 개선 (긴급)
**현재 문제:**
- 로봇 같은 형식적 텍스트
- 랜덤 메시지가 질문과 무관
- 진행률(1-100%) 반영 안됨

**개선 방향:**
- 단계별로 뭐 하고 있는지 솔직하게 명시
- 귀엽고 유머있게: "원래 이 부분이 좀 걸려요. 조금만 기다려주세요..!"
- "최신 AI 기술로 더 정확히 읽고 있어요. 그만큼 시간이 약간 소요돼요.."
- 진행률에 맞춰 메시지 분배

### 2. 이미지 안 뜨는 버그
**현재 문제:**
- Hero 이미지, Card 1 이미지가 랜덤하게 안 뜸
- 이미지 생성은 됐는데 표시가 안 되는 경우

**확인 필요:**
- `heroImage`, `card1Image` 상태 바인딩 확인
- 이미지 URL 생성 후 컴포넌트 렌더링 타이밍 확인

### 3. 카드 재선택 버그
**현재 문제:**
- 카드 재선택 시 기존 카드가 덱에서 선택 상태 유지됨
- 플레이스홀더에서는 사라지지만 덱에서는 여전히 선택됨

### 4. 스크롤바 숨기기
- 해석 부분에서 스크롤바 강제 숨기기 필요
- `scrollbar-width: none` 또는 `::-webkit-scrollbar { display: none }`

### 5. 모바일 스티키 위치
**현재 문제:**
- 스크롤해서 메뉴 사라지면 리딩 결과 스티키도 그만큼 위로 이동해야 함

### 6. Hidden Insight 문구 개선
**현재 문제:**
- "평행우주가 보낸 신호" → 너무 고정적
- "이건 비밀인데요" 등 반복적인 도입

**개선 방향:**
- "보내는 신호" 또는 "강조" 느낌으로
- 기존 Hook/Foreshadow 응용한 다양한 도입
- 결론 카드/네 장의 메시지를 보완하거나 다른 식으로 강조
- (선택) 시너지 카드 하나 더 뽑기?

### 7. 나이 언급 금지 강화
**현재 프롬프트에 있지만 더 강화 필요:**
- "38년을 살면서" 이런 표현도 금지
- 나이는 오로지 분석에만 사용

### 8. Desktop 레이아웃 (1920px+)
- 1920px width 이상에서만 결과 리딩 오른쪽에 댓글 기능
- 그 미만은 댓글창 아래로
- `.chapter-hero` height: 350px → 480px로 변경

### 9. 피드 개선
- 리딩 참여 안 했으면: "같은 질문에 참여하고 무료 리딩을 받아보세요" 문구
- 리딩 수 많아지면 로딩 전략 필요 (무한 스크롤 or 페이지네이션)
- 검색 기능 추가 검토

### 10. 기타 UI
- 프로필 설정 모달: 생년월일 / 태어난 시간 50/50 split
- 우측 jeomai 로고 클릭 → 메인페이지 새로고침 + 태그라인 추가
- 로고 클릭 시 새로고침

---

## API 호출 시간 분석

### 현재 구조 (useReading.js)
```javascript
// 타로 리딩
const tarotPrompt = `...약 8000자 프롬프트...`;
const data = await callClaudeApi(null, tarotPrompt, 8000);  // max_tokens: 8000
```

### 문제점
1. **스트리밍 미사용**: `messages.create()` 비스트리밍 호출
2. **거대한 단일 프롬프트**: 타로 전체(hook, cards, conclusion, hidden 등)를 한 번에 요청
3. **순차 이미지 생성**: 5개 이미지를 순차적으로 생성 (각각 await)
4. **캐싱 미적용**: `callClaudeApi(null, ...)` - 첫 번째 인자가 null이면 캐싱 안 됨

### 개선 방안
1. 프롬프트 분리 → 병렬 호출
2. max_tokens 최적화 (섹션별로 적절한 값)
3. 이미지 생성 병렬화
4. 시스템 프롬프트 캐싱 적용

---

## 수익화 & 제한 전략 (검토 필요)

### 질문
- 리딩 중간 광고?
- 광고 없이 쓰려면 요금제?
- 참여는 무료인데 제한?
- 맞춤 질문은 무료에서 제한 두기?

### 현재 설정 (aiConfig.js)
```javascript
// 커뮤니티 우선 전략 - 모든 사용자 무제한
TIER_LIMITS = {
    free: { concurrent: 1 },  // 동시 분석 1개
    premium: { concurrent: 3 }  // 동시 분석 3개
};
```

---

## 확인 필요 사항

1. [ ] 구버전 `ResultView.jsx` 삭제 안전한지 확인
2. [ ] 구버전에서 추가 API 호출 있는지 확인 (`generateDetailedReading` 등)
3. [ ] 타로 리딩 시 꿈/사주 프롬프트도 같이 로드되는지 확인
4. [ ] 현재 max_tokens 8000이 적절한지 (출력 토큰 분석)
5. [ ] 이미지 생성 실패 시 fallback 처리 확인
