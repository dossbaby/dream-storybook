# 타로 결과 전면 개편 v2

> 작성일: 2025-12-06
> 상태: 계획 수립 완료, 구현 대기

---

## 1. 현재 문제점

### UI 문제
- 카드 이름 텍스트가 카드 이미지 위에 overlay 되어 있음
- 상세 풀이에서 카드 이미지들이 갤러리로 먼저 나오고, 텍스트 해석이 따로 나옴 (일관성 없음)
- 꿈 상세 풀이에는 예쁜 섹션 헤더 UI가 있는데 (`🌙 이 꿈을 처음 봤을 때`), 타로에는 없음

### UX 문제
- "운명의 비밀 열어보기" 버튼 = one more click barrier
- 사람들은 바로 상세 결과를 보고 싶어함
- 클릭 barrier가 이탈을 유발함

### 컨텐츠 문제
- 템플릿 냄새나는 해석 ("첫 번째 카드가~", "마지막 카드에~")
- 애매둥실한 결론 (definitive answer 없음)
- 개인화 부족, 그 사람의 질문에서 나오는 Hook이 아님

---

## 2. 핵심 변경 사항

### 구조적 변경
- [ ] 모달 제거 → TarotResultView에 직접 통합
- [ ] "운명의 비밀 열어보기" 버튼 제거
- [ ] `showFullReading` 분기 제거 → 항상 full reading 표시
- [ ] `onRevealSecret` prop 제거
- [ ] DetailedReadingModal에서 타로 관련 코드 제거 (꿈만 남김)

### UI 변경
- [ ] 꿈 상세 풀이 스타일 (`reading-modal.css`) → `tarot.css`로 이식
  - 섹션 헤더 스타일 (왼쪽 금색 바 + 그라데이션 배경)
  - 페르소나 4/5 스타일 (border, glow, 대각선 패턴)
- [ ] 카드 + 해석 쌍 레이아웃 (이미지 → 섹션 헤더 → 해석 순서)
- [ ] 텍스트 overlay 문제 CSS 수정

---

## 3. Jenny Philosophy 기반 컨텐츠 구조

### 전체 흐름 (전체 리딩에 Jenny 적용, 카드마다 X)

```
[Hook]
- 그 사람의 질문/상황에서 나오는 아이러니/갈등
- 템플릿 X, 자연스러운 반응
- 예: "어... 잠깐, 새로운 사람 얘기가 아니네요? 카드가 자꾸 '이미 아는 사람' 쪽을 가리켜요"

[Foreshadow]
- 끝까지 보게 만드는 기대
- 구조 노출 X ("마지막 카드에~" 금지)
- 예: "근데 이 사람 누군지 힌트가 나와요... 같이 보면 '아 그 사람?' 할 수도 있어요"

[Pacing Transition]
- 숨 쉴 틈 주되 끊기지 않게
- 예: "일단 왜 이런 얘기가 나왔는지부터..."

[카드1, 2, 3 - But-Therefore 스토리]
- 변화와 전환이 있는 스토리 ("~했는데, 근데~, 그래서~")
- 자연스러운 반응 ("아 여기 나오네요", "근데 이게 좀 걸리는데...")
- Hook/Foreshadow를 뒷받침하며 빌드업
- 카드3에서 긴장감 최고조 → 카드4로 연결

[카드4: 운명의 선물 - Definitive Answer + Twist]
- 명확한 답: "된다" 또는 "안 된다" (애매둥실 X)
- Twist: 예상과 다른 방식으로
- Foreshadow 회수
- 도파민 주는 확신 + 구체적 힌트
- 예: "된다. 근데 새로운 사람이 아니라, 이미 밥 같이 먹어본 사람이에요"

[Hidden Insight]
- 보너스 느낌의 탭 인터랙션
- 이미지 생성 포함
- 예: "이 사람, 당신한테 이미 신호 보낸 적 있어요. 근데 그때 못 알아챈 거예요"
```

### 톤 & 스타일
- 진짜 타로 리더가 지금 보면서 말해주는 느낌
- "어... 잠깐", "근데 이게 좀 걸리는데...", "아 여기 나오네요"
- 템플릿 냄새 제거

---

## 4. UI 인터랙션 아이디어

### 카드 뒤집기 인터랙션
- 결과 페이지 진입 시 카드들이 뒷면으로 보임
- 사용자가 탭하면 뒤집히면서 해석 펼쳐짐
- 순서대로만 열 수 있음 (스토리 흐름 유지)
- "내 운명을 내가 열어보는" 느낌

### 타이핑 효과
- Hook, Foreshadow, 해석이 타이핑되듯 나타남
- 진짜 누군가가 지금 나한테 말해주는 느낌
- 스크롤해서 스킵 가능

### 카드별 반응 버튼
```
[😮 헐] [😢 슬프다] [🤔 진짜?] [💕 좋아]
```
- 반응 데이터 축적 → 소셜 증거
- "이 카드에 87%가 '헐' 반응을 남겼어요"

### 나만의 타로 일기장
- "이 리딩에 메모 남기기"
- "6개월 뒤에 다시 알림 받기"
- 재방문 + 예언 검증

### 비슷한 질문 통계
```
비슷한 질문을 한 23명 중:
- 15명이 "된다"를 받았어요
- 당신은 소수의 "된다" 그룹이에요 ✨
```
- 희귀도 강조 (Jenny의 rarity)
- 공유 욕구 자극

### 봉인된 Hidden Insight
```
[🔮 봉인된 메시지]
"카드가 마지막으로 속삭이는 게 있어요"
[봉인 해제하기]
```
- 봉인 깨지는 애니메이션
- 이미지 + 텍스트
- "이건 당신만 볼 수 있어요"

---

## 5. pSEO 고려사항

### 공개 페이지 (검색 유입용)
- Hook, 카드 이미지들, 일부 해석 (티저)
- "전체 해석 보기" → 로그인 유도

### 비공개 (나만 보이는 것)
- 내 메모
- 내 반응
- Hidden Insight (?)

### 전환 포인트
- pSEO로 유입 → "나도 해보고 싶다" → 질문 입력 → 전환

---

## 6. 구현 순서

### Phase 1: 프론트엔드 구조 변경
1. [ ] TarotResultView에서 `showFullReading` 분기 제거
2. [ ] "운명의 비밀 열어보기" 버튼 삭제
3. [ ] `onRevealSecret` prop 제거

### Phase 2: UI 스타일 이식
4. [ ] `reading-modal.css` 핵심 스타일 → `tarot.css`로 복사
5. [ ] 섹션 헤더 스타일 적용 (꿈처럼 예쁘게)
6. [ ] 카드 + 해석 쌍 레이아웃 구현
7. [ ] 텍스트 overlay CSS 수정

### Phase 3: 인터랙션 추가
8. [ ] 카드 뒤집기 인터랙션
9. [ ] 스크롤 기반 fade-in (Intersection Observer)
10. [ ] Hidden Insight 봉인 해제 인터랙션 + 이미지

### Phase 4: 소셜 기능
11. [ ] 카드별 반응 버튼
12. [ ] 메모 기능
13. [ ] 비슷한 질문 통계

### Phase 5: 정리
14. [ ] DetailedReadingModal에서 타로 코드 제거
15. [ ] 불필요한 prop 정리

### Phase 6: 백엔드 (AI 프롬프트)
16. [ ] Jenny 구조로 응답하도록 프롬프트 수정
17. [ ] Hidden Insight 이미지 생성 추가

---

## 7. 예시: 완성된 컨텐츠

**질문: "내가 이번 12월달에 연애 할 수 있을까?"**

```
[Hook]
"어... 잠깐, 새로운 사람 얘기가 아니네요?
카드가 자꾸 '이미 아는 사람' 쪽을 가리켜요"

[Foreshadow]
"근데 이 사람 누군지 힌트가 나와요...
같이 보면 아마 '아 그 사람?' 할 수도 있어요"

[카드1]
"주변을 보래요. 근데 왜 이 사람을 연애 상대로 안 봤는지...
아 여기 나오네요, 잠깐..."

[카드2]
"상처받기 싫었던 거예요.
그래서 일부러 새로운 사람만 찾고 있었던 거고요.
어... 근데 이게 좀 걸리는데..."

[카드3]
"12월 중순에 뭔가 계기가 생겨요, 이 사람이랑.
근데 '네가 먼저 열어야 된다'고 하네요.
기다리면 그냥 지나간대요.
자 그럼 답이 뭐냐면..."

[카드4: Definitive + Twist]
"된다.

근데 이게 좀 웃긴 게,
당신이 상상한 '운명적 만남' 이런 거 아니에요.
이미 밥 같이 먹어본 사람이에요.

12월 셋째 주쯤, 평소랑 다른 대화가 생기는데
거기서 '어? 이 사람이었나?' 하게 될 거예요.

된다. 근데 새로 찾지 말고, 이미 있는 사람 다시 보세요."

[Hidden Insight - 탭하여 확인]
"아 그리고 이거 말할까 말까 했는데...
이 사람, 당신한테 이미 신호 보낸 적 있어요.
근데 그때 못 알아챈 거예요."
```

---

## 8. 카드 선택 UI 개선 (2025-12-11)

### 완료된 작업

#### Rainbow Effects (3장 선택 시)
- [x] `.rainbow-ready` 클래스 - guide-text에 rainbow gradient 텍스트
- [x] `.rainbow-btn` 클래스 - 버튼에 rainbow border 효과
- [x] `.all-ready` 클래스 - intro-text fade out, table-stars rainbow twinkle, slot-card sparkle

#### Progressive Gradient System (선택 순서별 색상)
- [x] 0장 선택 → hover: purple→mint
- [x] 1장 선택 → hover: mint→cyan
- [x] 2장 선택 → hover: cyan→blue
- [x] `selected-${count}` 클래스로 card-spread에 적용
- [x] `selected-order-${index}` 클래스로 개별 카드 gradient 적용

#### Selection Number Circle (번호 동그라미)
- [x] 1번: purple→blue 투톤 gradient
- [x] 2번: mint→cyan gradient
- [x] 3번: cyan→blue gradient (blue 강조)
- [x] 각각 subtle glow animation

#### Slot Card 개선
- [x] Conic-gradient rainbow border (purple→mint→cyan→blue)
- [x] Box-shadow glow subtle하게 조정
- [x] hue-rotate animation으로 rainbow 회전 효과

#### 기타 UI 조정
- [x] 데스크탑 deck 위치 조정 (margin-left: -6.5%)
- [x] Guide text 크기 intro-line과 동기화 (1.4rem)
- [x] Font-weight 보정 (gradient text에 -webkit-text-stroke 추가)
- [x] Table-footer gap 조정 (vertical centering)
- [x] 버튼 텍스트: "🔮 이야기 펼치기"
- [x] Guide text: "카드가 당신에게 하고 싶은 말이 있어요"

### 관련 파일
- `src/components/tarot/TarotInput.jsx` - 클래스 추가
- `src/styles/views/tarot.css` - 모든 CSS 효과

---

## 9. 참고 자료

- Jenny Hoyos YouTube 전략: Hook → Foreshadow → But-Therefore → Twist → Ending
- 페르소나 4/5 UI 스타일
- 현재 꿈 상세 풀이 모달 (`reading-modal.css`)
