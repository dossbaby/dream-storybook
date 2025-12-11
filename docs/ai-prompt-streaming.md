# AI 프롬프트 스트리밍 & Progressive Loading 전략

> 2-3분 대기 → 체감 10초로 개선하기

---

## ⚠️ 중요: 기존 Prompt 보존 원칙

> **기존에 설정된 prompt는 절대 수정하지 않는다.**
>
> `useReading.js`, `useImageGeneration.js`, `promptCache.js` 등에 있는 prompt들은
> 오랜 시간 공들여 작업한 것이므로 내용 변경 금지.
>
> 이 문서의 목표: **스트리밍 메커니즘**으로 로딩 시간 단축
>
> - prompt 내용 변경 ❌
> - API 호출 방식만 변경 ✅
>
> 만약 prompt 수정이 효율성에 필요하다면, 반드시 먼저 논의 후 결정.

---

## 현재 구조 분석

### 파일 구조

```
src/
├── hooks/
│   ├── useReading.js          # 메인 리딩 생성 (타로/꿈/사주)
│   ├── useImageGeneration.js  # Gemini 이미지 생성
│   └── useDopamineMessages.js # 도파민 메시지 생성 (현재 Haiku)
└── utils/
    ├── aiConfig.js            # AI 모델 설정, ANIME_STYLES
    └── promptCache.js         # 시스템 프롬프트, 캐싱 로직
```

### 현재 플로우 (문제점)

```
[리딩 시작]
    ↓
[Haiku 도파민 메시지 생성] ←── 별도 호출 (Sonnet 결과 모름 = 불일치 가능)
    ↓
[Claude Sonnet API 호출] ←── 전체 JSON 응답 대기 (60-90초)
    ↓
[Gemini 이미지 생성 x5] ←── 순차 생성 (60-90초)
    ↓
[결과 화면 표시]

총 대기 시간: 2-3분 (유저는 빈 화면만 봄)
```

### 기술적 현황

| 항목            | 현재 상태                                  | 문제점                    |
| --------------- | ------------------------------------------ | ------------------------- |
| Claude API 호출 | `messages.create()` (비스트리밍)           | 전체 응답 대기            |
| 도파민 메시지   | Haiku 별도 호출 (`useDopamineMessages.js`) | Sonnet 결과와 불일치 가능 |
| 프롬프트 캐싱   | ✅ 구현됨 (`cache_control: ephemeral`)     | -                         |
| 이미지 생성     | 순차 처리 (`await` 체인)                   | 5개 직렬 = 60초+          |
| UI 피드백       | 도파민 메시지                              | 로봇 같을 수 있음         |

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

## 개선 전략: 스트리밍 + Progressive Loading

### 핵심 변경사항

| 항목        | Before              | After                         |
| ----------- | ------------------- | ----------------------------- |
| API 호출    | `messages.create()` | `messages.stream()`           |
| 도파민      | Haiku 별도 호출     | **Sonnet에 통합** (일관성 ✅) |
| 이미지 생성 | 텍스트 완료 후 순차 | **섹션 완료 시 즉시 시작**    |
| UI 업데이트 | 전체 완료 후        | **섹션별 Progressive**        |

---

## 도파민 메시지 전략 (핵심!)

### 도파민의 본질

> **hook/foreshadow가 나오기 전에 기대감 유지**

Mr. Beast/Jenny 원칙을 대기 화면에도 적용:

- 유저가 질문 후 기다리는 동안 "내 질문을 꼼꼼히 보고 있구나" 느낌
- hook을 spoil하지 않으면서 기대감 유지
- **질문 키워드 반영** 필수!

### 현재 문제 (삭제 완료)

```
❌ 하드코딩 DOPAMINE_HINTS (constants.js) - 삭제됨
❌ 랜덤 "연애운이 감지되고 있어요..." - 질문과 무관, 로봇 같음
```

### 목표: Sonnet 통합 도파민

```
질문: "남자친구가 요즘 연락이 뜸해졌어요"

✅ "연인과의 관계에서 뭔가 보이고 있어요..."
✅ "상대방의 마음이 궁금하시죠... 카드가 말해주고 있어요"
✅ "이 관계에서 중요한 게 있는 것 같아요..."

→ 질문 키워드 반영 (연인, 관계, 마음)
→ "아 내 질문을 진짜 보고 있구나" 느낌
→ hook/foreshadow spoil 안 함
```

### 도파민 범위 (중요!)

| 구간                  | 도파민 필요? | 이유                                 |
| --------------------- | ------------ | ------------------------------------ |
| 분석 페이지 (hook 전) | ✅ 필요      | 빈 화면, 기대감 유지                 |
| 결과 페이지 (hook 후) | ❌ 불필요    | 이미 hook 콘텐츠 있음                |
| 카드 준비 중          | ❌ 불필요    | 무지개 이펙트만, 유저는 hook 읽는 중 |
| 카드 1 오픈 후        | ❌ 불필요    | 실제 콘텐츠 읽는 중                  |

**핵심: hook이 나오면 도파민 끝!** (5-7개면 충분)

### 현재 Haiku 도파민 (`useDopamineMessages.js`)

이미 질문 기반 25개 메시지 생성 중:

```javascript
// 핵심 미션
사용자 질문에서 키워드를 추출해서 메시지에 자연스럽게 녹여!
"이 AI가 진짜 내 질문을 분석하고 있구나!" 느낌을 줘야 해.

// 예시: "그 사람이 나를 좋아할까?"
✓ "음... '좋아한다'는 게 어떤 의미인지 카드에서 찾고 있어요..."
✓ "그 사람의 마음속... 뭔가 복잡한 게 있네요..."
```

### 개선: Haiku → Sonnet 통합

**왜?**

- Haiku는 Sonnet 결과를 모름 → 불일치 가능
- Sonnet에서 도파민 생성하면 실제 리딩과 일관성 보장
- API 호출 1회 감소 = 비용 절감

**구현 방향:**

```javascript
// Sonnet JSON 출력에 dopamineMessages 추가
{
  "dopamineMessages": [
    "연인과의 관계에서 뭔가 보이고 있어요...",
    "상대방의 마음이 궁금하시죠...",
    "카드가 말해주고 있어요..."
  ],
  "jenny": {
    "hook": "...",      // 기존 그대로
    "foreshadow": "..." // 기존 그대로
  },
  ...
}
```

> ⚠️ 이 부분은 prompt 출력 형식 확장 필요 - 기존 내용 수정 아님

---

## 새로운 플로우

### 스트리밍 + Progressive Loading

```
[카드 선택 완료]
    ↓
[Sonnet 스트리밍 시작] ←── 단일 호출 (도파민 포함)
    ↓
[dopamineMessages 완료] → 분석 페이지에서 즉시 표시 (타이핑 효과)
    ↓
[hook + foreshadow 완료] → 결과 페이지 전환 + Hero 이미지 시작
    ↓
[card1Analysis 완료] → Card 1 이미지 시작
    ↓
[Card 1 텍스트 + 이미지 둘 다 완료] → "카드 1 열기" 활성화
    ↓
(유저가 카드 1 읽는 동안 백그라운드에서 계속...)
    ↓
[card2Analysis 완료] → Card 2 이미지 시작
    ↓
[Card 2 완료] → "카드 2 열기" 활성화
    ↓
... (card3, conclusion, hiddenInsight)
```

### 유저 경험 타임라인

```
0초:   스트리밍 시작
2초:   dopamineMessages 도착 → 분석 페이지에서 표시 시작
       "연인과의 관계에서 뭔가 보이고 있어요..."
5초:   "상대방의 마음이 궁금하시죠..."
8초:   "카드가 말해주고 있어요..."
10초:  hook 완료 → 결과 페이지 전환 + Hero 이미지 시작
       (도파민 메시지 종료 - hook이 있으니까!)
15초:  card1 완료 → Card 1 이미지 시작
18초:  Hero 이미지 완료 → 오버레이 표시
20초:  Card 1 이미지 완료 → "카드 1 열기" 활성화
       (유저가 카드 1 읽는 동안...)
28초:  card2 + Card 2 이미지 완료 → "카드 2 열기" 활성화
       ...
60초:  전체 완료

체감 시간: 2초 (첫 도파민 메시지)
결과 페이지 전환: 10초
실제 인터랙션 가능: 20초 (카드 1 오픈)
```

---

## 콘솔 로깅 (진행 상황 추적)

### 구현

```javascript
// useReading.js 스트리밍 처리
const stream = await anthropic.messages.stream({...});

let buffer = '';
console.log('🚀 Sonnet 스트리밍 시작...');

for await (const chunk of stream) {
  buffer += chunk.delta?.text || '';

  // Dopamine 완료 감지
  if (isDopamineComplete(buffer) && !dopamineParsed) {
    console.log('💬 도파민 메시지 완료 → 표시 시작');
    setDopamineMessages(parseDopamine(buffer));
    dopamineParsed = true;
  }

  // Hook 완료 감지
  if (isHookComplete(buffer) && !hookParsed) {
    console.log('✅ Hook 완료 → 결과 페이지 전환');
    console.log('🖼️ Hero 이미지 생성 시작...');
    setHook(parseHook(buffer));
    startHeroImage();
    hookParsed = true;
  }

  // Card 1 완료 감지
  if (isCard1Complete(buffer) && !card1Parsed) {
    console.log('✅ Card 1 분석 완료 → Card 1 이미지 시작');
    setCard1Text(parseCard1(buffer));
    startCard1Image();
    card1Parsed = true;
  }

  // ... card2, card3, conclusion, hiddenInsight
}

console.log('🎉 Sonnet 스트리밍 완료');
```

### 콘솔 출력 예시

```
🚀 Sonnet 스트리밍 시작...
💬 도파민 메시지 완료 → 표시 시작
✅ Hook 완료 → 결과 페이지 전환
🖼️ Hero 이미지 생성 시작...
✅ Card 1 분석 완료 → Card 1 이미지 시작
🖼️ Hero 이미지 완료
✅ Card 2 분석 완료 → Card 2 이미지 시작
🖼️ Card 1 이미지 완료 → 카드 1 열기 활성화
✅ Card 3 분석 완료 → Card 3 이미지 시작
🖼️ Card 2 이미지 완료 → 카드 2 열기 활성화
✅ Conclusion 완료 → Conclusion 이미지 시작
🖼️ Card 3 이미지 완료 → 카드 3 열기 활성화
✅ Hidden Insight 완료
🖼️ Conclusion 이미지 완료
🎉 전체 리딩 완료!
```

---

## UI 상태 관리

### 섹션별 상태

```javascript
// TarotResultView.jsx 또는 상위 컴포넌트
const [readingState, setReadingState] = useState({
  dopamine: { ready: false, data: null },
  hook: { ready: false, data: null },
  heroImage: { ready: false, url: null },
  card1: { textReady: false, imageReady: false, data: null, image: null },
  card2: { textReady: false, imageReady: false, data: null, image: null },
  card3: { textReady: false, imageReady: false, data: null, image: null },
  conclusion: { textReady: false, imageReady: false, data: null, image: null },
  hiddenInsight: { ready: false, data: null },
});

// 카드 오픈 가능 여부
const canOpenCard1 =
  readingState.card1.textReady && readingState.card1.imageReady;
const canOpenCard2 =
  readingState.card2.textReady && readingState.card2.imageReady;
// ...
```

### 버튼 활성화 로직

```jsx
<Button disabled={!canOpenCard1} onClick={() => openCard(1)}>
  {canOpenCard1 ? "카드 1 열기" : "카드 1 준비 중..."}
</Button>
```

### 카드 준비 중 UI

- 무지개 로딩 이펙트 (기존 bottom nav 근처 효과 재사용)
- "준비 중..." 텍스트
- 도파민 메시지 없음 (유저가 hook 읽는 중)

---

## 구현 순서

### Phase 1: 스트리밍 기본 구현

- [ ] `messages.create()` → `messages.stream()` 변경
- [ ] 스트리밍 버퍼 파싱 로직 구현
- [ ] 콘솔 로깅 추가

### Phase 2: 이미지 병렬화

- [ ] 텍스트 섹션 완료 시 해당 이미지 즉시 시작
- [ ] 이미지 완료 콜백으로 상태 업데이트

### Phase 3: UI Progressive 업데이트

- [ ] 섹션별 ready 상태 관리
- [ ] 카드별 오픈 버튼 활성화
- [ ] 결과 페이지 조기 전환 (hook 완료 시)

### Phase 4: 도파민 Sonnet 통합

- [ ] Haiku 별도 호출 제거 (`useDopamineMessages.js` 수정)
- [ ] Sonnet prompt에 dopamineMessages 출력 추가
- [ ] 도파민 → hook → cards 순서로 스트리밍
- [ ] 분석 페이지에서만 도파민 표시, hook 후 종료

---

## 파일 변경 목록

| 파일                     | 변경 내용                      | Prompt 수정              |
| ------------------------ | ------------------------------ | ------------------------ |
| `useReading.js`          | `create` → `stream`, 파싱 로직 | ❌ (호출 방식만)         |
| `useReading.js`          | 도파민 출력 형식 추가          | ⚠️ 최소 추가 (출력 형식) |
| `useDopamineMessages.js` | Haiku 호출 제거, Sonnet 연동   | -                        |
| `useImageGeneration.js`  | 변경 없음                      | ❌                       |
| `promptCache.js`         | 변경 없음                      | ❌                       |
| `TarotResultView.jsx`    | 섹션별 상태 관리               | -                        |
| `aiConfig.js`            | dopamine 모델 설정 제거 가능   | -                        |

### 삭제 완료 (레거시 정리)

- `constants.js`: `DOPAMINE_HINTS` 배열 삭제
- `useReading.js`: `showRandomDopamine` 함수 및 interval 삭제
- `analysisHelpers.js`: `DOPAMINE_HINTS` import 및 사용 삭제
- `useAnalysisAnimation.js`: 하드코딩 `DOPAMINE_HINTS` 삭제

---

## 예상 결과

| 지표               | Before         | After                   |
| ------------------ | -------------- | ----------------------- |
| 첫 피드백 (도파민) | Haiku ~1초     | **Sonnet 스트리밍 2초** |
| 결과 페이지 전환   | 2-3분          | **10초**                |
| 첫 카드 오픈 가능  | 2-3분          | **20초**                |
| 전체 완료          | 2-3분          | **60초**                |
| API 비용           | Haiku + Sonnet | **Sonnet만** (절감)     |
| 도파민 일관성      | ❌ 불일치 가능 | ✅ 리딩 결과와 매칭     |

---

## 🚨 발견된 버그 & 개선 필요 사항

### 치명적: 이중 ResultView 구조

| 컴포넌트              | 사용 조건                 | 상태                        |
| --------------------- | ------------------------- | --------------------------- |
| `ResultView.jsx`      | `view === 'result'`       | 구버전 (프리미엄 버튼 있음) |
| `TarotResultView.jsx` | `view === 'tarot-result'` | 신버전                      |

**이게 올드 디자인 뜨는 원인!**

- 새 리딩 생성 → `view === 'result'` → 구버전 호출됨
- 해결: `ResultView.jsx` 제거 또는 통합 필요

### 스트리밍 이후 세팅 목록

---

#### 1. 분석 단계 스크롤바 강제 숨기기 (모바일)

**위치**: 타로/꿈/사주 해석 - 질문 prompt 이후 나오는 분석 단계 화면
**문제**: 모바일에서 스크롤바가 노출되어 UI가 지저분함
**해결**: CSS로 해당 구간에서 스크롤바 강제 숨기기 (`overflow: hidden` 또는 `::-webkit-scrollbar { display: none }`)
타로, 꿈, 사주 empty feed에 어떻게 세팅 됬는지 확인하고 동일하게 적용. (기존에 해결했던 솔루션)

---

#### 2. 모바일 Sticky Persona Card 위치 버그

**위치**: 타로 결과 페이지 - Persona Card sticky 메뉴
**문제**: 스크롤 시 상단 top mobile nav가 숨겨지는데, sticky 메뉴는 그대로 있어서 사이에 여백 발생
**해결**: top nav 숨김 상태 감지하여 sticky의 `top` 값을 동적으로 조정 (nav 높이만큼 위로 이동)

---

#### 3. Hidden Insight (차원의 틈) 대폭 개선

**현재 문제들**:

- "평행우주가 보낸 신호" → "보내는 신호" 또는 더 감성적인 단어로 변경
- 시작 문구가 매번 "앞에 이건 비밀인데요", "원래 안말할라 그랬는데요" 동일 → 형식적이고 지루함
- 내용이 결론카드/네장의 메시지와 동일한 반복 느낌 → 특별함 없음
- "ㅇ"나 "ㅎ"이 들어간 사람 예측 패턴이 모든 리딩에 등장 → 템플릿화되어 전혀 매력 없음

**해결 방향**:

- 시작 방식 다양화: 고정 프레임 제거, 여러 변형 패턴 사용
- **BONUS EXCEED 원칙 적용**: 잘 쓴, 읽고 싶은 essay의 conclusion처럼 기존 hook/foreshadow를 exceed하는 디벨롭된 보너스 느낌
  - 기존 내용 단순 반복 ❌
  - 내용 보완/다른 시각 강조 ✅
  - 시너지 카드 추가 뽑기? (고민 필요)
- "ㅇ/ㅎ 사람" 패턴: 모든 리딩에서 제거, 정말 어쩌다 한번만 사용
- **핵심**: 예측 불가능하고 매번 새로운 느낌이어야 함

---

#### 4. 카드 재선택 시 덱 상태 버그

**위치**: 타로 카드 선택 화면
**문제**: 카드를 다시 선택할 때 기존 카드가 선택 placeholder에서는 사라지지만 (아래 카드 3장), 덱 스프레드에서는 여전히 선택된 상태로 표시됨 예) 카드를 선택 했다가 선택 해제하려고 다시 같은 카드를 클릭했을 경우 deselect 되어야 하는데, 아직도 select 되어 있는 현상. 하지만 아래 placeholder에서는 비어있음
**해결**: 카드 재선택 시 덱의 선택 상태도 함께 리셋

---

#### 5. 도파민 메시지 시간 제한 체크 (Streaming 관련)

**확인 필요**: 기존 `useDopamineMessages.js`에서 ±50%~150% 시간 제한을 안전빵으로 두었는지 확인
**배경**: 기존에는 1-100% progress가 seamless하게 보이도록 어떤 limit을 두었을 수 있음
**해결**: 새로운 streaming 세팅 시 해당 제한 로직 제거 필요할 수도 있음

---

#### 6. 나이 언급 금지 강화 (Prompt 수정)

**현재**: prompt에 "나이 언급 금지" 설정됨 (분석에만 참고, 결과에는 "38살이니까..." 금지)
**문제**: "38년을 살면서..." 같은 우회 표현이 여전히 출력됨
**해결**: prompt에서 나이 우회 표현도 명시적으로 금지 추가

```
❌ "38살이니까..."
❌ "38년을 살면서..."
❌ "30대 후반의 나이에..."
✅ 나이는 오로지 분석에만 사용, 결과 텍스트에 절대 노출 금지
```

---

#### 7. 피드/인기 리딩 CTA 추가

**위치**: 커뮤니티 피드 또는 인기 리딩 탭 - 제목 아래 description 영역
**조건**: 본인 리딩이 아닐 경우
**추가할 CTA**: "같은 질문에 참여하여 리딩을 받아보세요" 같은 심플한 문구
**목적**: "나는 뭐라고 나올까?" 호기심 자극 → 참여 유도 문구로 CTA 개선 필요

---

#### 8. 구버전 ResultView 삭제 검토

**증상**: "내 리딩 다시 보기" → 시작 → 올드 디자인 (프리미엄으로 타로의 비밀 보기 버튼 있는 버전) 계속 뜸
**원인**: `ResultView.jsx` (구버전) vs `TarotResultView.jsx` (신버전) 이중 구조
**확인 필요**:

- 구버전 ResultView 삭제해도 안전한지?
- 이것 때문에 API 호출이 추가로 발생하고 있는지?
  **해결**: 안전 확인 후 `ResultView.jsx` 완전 삭제 또는 `TarotResultView.jsx`로 통합

---

#### 9. 프로필 설정 모달 레이아웃 개선

**위치**: 프로필 설정 모달 - 생년월일/태어난 시간 입력 영역
**현재**: 약 7:3 비율로 배치되어 모바일 UI가 안 예쁨
**해결**: 50/50 split으로 균등 배치

---

#### 10. 로고 클릭 동작 + 태그라인 추가

**위치**: 플랫폼 왼쪽 위 jeomai 로고 & 텍스트
**현재**: 클릭해도 아무 동작 없음
**해결**:

- 클릭 시 메인페이지로 새로고침
- 태그라인 텍스트 추가 로고 텍스트 옆에 예쁘게 추가 디자인 고려해서 추가

---

#### 11. 피드 로딩 전략 & 검색 기능

**현재 문제**: 주제/키워드 필터 시 모든 리딩이 제한 없이 로딩됨
**앞으로**: 유저 리딩이 많아지면 성능 이슈 예상
**해결 방향**:

- 무한 스크롤 페이지네이션 (YouTube 스타일)
- 검색 기능 추가
- 효율적인 로딩 알고리즘 설계

---

#### 12. Desktop 레이아웃 기준 정립

**기준**: width 1920px 이상 = Desktop
**1920px 이상**:

- 결과 리딩 오른쪽에 댓글창 배치 (사이드바 형태)
  **1920px 미만**:
- 댓글창 아래로 이동 (모바일처럼)
  **원칙**: 모든 Desktop CSS는 `@media (min-width: 1920px)` 기준으로 분리

---

#### 13. 리딩 이미지 Height 조정

**위치**: 모든 리딩 결과 페이지 이미지 (overlay, card 1/2/3, 결론 이미지)
**현재**: `.chapter-hero` height가 350px → Desktop에서 16:9 비율이 아니라 zoom-in된 상태
**해결**: height 350px → **480px**로 변경하여 16:9 비율 제대로 보이도록. 나머지 viewport에서도 16:9 비율로 잘 보이는지 확인 필요. (정확히 100% 16:9아니더라도 얼추 비슷해야함)

---

#### 14. 이미지 안 뜨는 버그

**증상**: Hero/Card 이미지가 랜덤하게 누락됨
**원인 파악 필요**: Gemini API 응답 실패? 이미지 URL 만료? 렌더링 타이밍? 이건 내가 모바일로 테스트 해봤을때 크롬 탭에서 분석중일때, 앱에서 다른 앱을 사용 했을 때 (예 유튜브 등, 하다가 다시 크롬을 왔을때 뭔가 멈춘 것 같았음 확실하지 않음. 다음에는 그냥 분석중동안 계속 켜놨는데 그때는 됐음)

---

## 확인 필요 사항

- [ ] 구버전 `ResultView.jsx` 삭제 안전한지 확인
- [ ] 스트리밍 파싱 시 JSON 구조 호환성 확인
- [ ] Gemini 이미지 API 동시 호출 제한 확인
- [ ] 모바일에서 스트리밍 성능 확인
- [ ] `useDopamineMessages.js` Haiku 코드 Sonnet으로 전환 시점 결정
