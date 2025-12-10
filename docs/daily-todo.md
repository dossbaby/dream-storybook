# 점AI Daily Todo

> implementation-strategy.md의 실행 기록
> 매일 작업 내용과 다음 단계를 기록

---

## Phase 현황 요약

### 완료된 Phase (✅)
| Phase | 이름 | 완료일 |
|-------|------|--------|
| 0 | AI Tier System | - |
| 1 | 기반 작업 | - |
| 2 | 통합 공개 설정 | - |
| 3 | 태그 시스템 | - |
| 4 | pSEO 강화 | - |
| 5 | 결제 시스템 | - |
| 6 | 데이터 마이그레이션 | - |
| 7 | 티어 고도화 | - |
| 7.5 | 리브랜딩 (jeom.ai) | - |
| 8 | 그로스 | - |
| 9 | 프롬프트 캐싱 | - |
| 10 | 모바일 최적화 | - |
| 11 | 피드백 시스템 | - |
| 12 | 타로 카드 선택 UX | - |
| 13 | 네비게이션 및 FAB 개선 | - |
| 14 | Firebase 비용 최적화 | - |
| 16 | 온보딩 플로우 | - |
| 17 | UX 폴리싱 | - |
| 18 | 에러 처리 및 빈 상태 UX | - |
| 19 | 이미지 생성 고도화 | - |
| 24.2 | 하단 네비게이션 개편 | 2025-12-11 |
| 25 | UI/UX 폴리싱 & 브랜딩 | - |

### 진행 중 (🔄)
| Phase | 이름 | 진행률 | 남은 작업 |
|-------|------|--------|----------|
| 15 | SEO 콘텐츠 전략 | 40% | Headless WP 세팅, 롱테일 콘텐츠 |
| 21 | 도파민 메시지 시스템 | 20% | AnalysisOverlay 개편, 타이핑 효과 |
| 24 | 커뮤니티 피드 시스템 | 30% | 24.3~24.7 남음 |

### 대기 중 (⏳)
| Phase | 이름 | 우선순위 | 비고 |
|-------|------|----------|------|
| 20 | 글로벌 Localization | 중 | 일본/중국 확장 |
| 22 | 브랜드 컬러 리브랜딩 | 중 | 전체 UI 색상 개편 |
| 23 | UX 개선 및 피드 구조 개편 | 높음 | 공개설정, 피드 구조 |
| 24.1 | 기반 정리 | 높음 | unlisted 제거, visibility 정리 |
| 24.3 | Visibility 간소화 | 높음 | public/private만 유지 |
| 24.4 | 참여 시스템 (타로) | 높음 | "나도 같은 질문으로" |
| 24.5 | 인기 탭 구현 | 중 | engagement 기반 정렬 |
| 24.6 | 꿈/사주 모드 대응 | 중 | 모드별 참여 방식 |
| 24.7 | 추가 기능 | 낮음 | 알림, 익명 옵션 |

---

## 2025-12-11 (수)

### 완료한 작업
- [x] PWA 설치 프롬프트 (InstallPrompt) 삭제
- [x] FortuneInput 로그인 플로우 추가 (비로그인 시 로그인 모달)
- [x] Feed empty state 스크롤 방지 적용
- [x] **Phase 24.2 완료: 하단 네비게이션 개편**
  - 커뮤니티 (모드별 🔮🌙☀️)
  - 인기 리딩 (🔥)
  - 시작 (모드별 🔮🌙☀️)
  - 내 리딩 (💜)
  - 프로필 (👤)
- [x] implementation-strategy.md Phase 24.2 업데이트

### 변경된 파일
- `src/App.jsx` - InstallPrompt 제거, FortuneInput props 추가
- `src/components/common/InstallPrompt.jsx` - 삭제됨
- `src/components/fortune/FortuneInput.jsx` - 로그인 플로우 추가
- `src/components/layout/BottomNav.jsx` - 라벨/이모지 전면 개편
- `src/styles/base/reset.css` - feed empty state 스크롤 방지
- `src/styles/components/feed.css` - empty state 스타일
- `docs/implementation-strategy.md` - Phase 24.2 완료 반영

### Git 커밋
- `37e15ca` - feat: Phase 24.2 하단 네비게이션 개편 완료

---

## 다음 작업 추천 (우선순위순)

### 1순위: Phase 24.3 - Visibility 간소화 (추천!)
> 커뮤니티 피드 활성화의 핵심

**해야 할 것:**
- [ ] unlisted 옵션 제거 (public / private만)
- [ ] 비공개 시 보이는 영역 정의 (hero + question + hook + foreshadow)
- [ ] 비공개 시 숨기는 영역 정의 (persona card 이하)
- [ ] TarotResultView 조건부 렌더링
- [ ] 공개 토글 위치 변경 (engagement 댓글 위로)

**파일:**
- `src/hooks/useFirebaseSave.js`
- `src/components/tarot/TarotResultView.jsx`
- `src/components/common/VisibilitySelector.jsx`

### 2순위: Phase 24.1 - 기반 정리 (일부 남음)
- [ ] MyPage "무료 리딩" 섹션 삭제
- [ ] 기본 visibility = public 설정

### 3순위: Phase 24.4 - 참여 시스템 (타로)
> 커뮤니티 참여 유도의 핵심 기능

- [ ] "나도 같은 질문으로 타로보기" floating CTA
- [ ] 질문 스킵 → 바로 카드 선택 플로우
- [ ] Firebase 스키마 추가 (isParticipation, originalReadingId, participationCount)

### 4순위: Phase 21 - 도파민 메시지 시스템
> 분석 대기 경험 개선

- [ ] AnalysisOverlay.jsx 풀스크린 개편
- [ ] 타이핑 효과 구현
- [ ] Haiku 도파민 메시지 선생성

### 5순위: Phase 23 관련 - UX 개선
- [ ] 공개 설정 실시간 반영
- [ ] 공개 설정 버튼 active 스타일
- [ ] 익명성 안내 문구 추가

---

## 메모/결정 사항

### 2025-12-11
- 타로 질문 헤딩: "뭘" vs "무엇을" → "뭘"이 더 캐주얼하고 앱 톤에 맞음
- PWA 설치 프롬프트 완전 제거 (모바일 브라우저 자체 프롬프트로 대체)
- 내 리딩 아이콘: 🌀 → 💜 (보라색 하트가 "내 것" 느낌 강함)

### 확인 필요 사항 (Phase 24 관련)
1. 참여 리딩 visibility: 기본 공개? 선택 가능?
2. 꿈해몽 참여 방식: "비슷한 꿈 꿨어요" 적절한지?
3. 사주 참여 방식: 참여 제외하고 피드백만?
4. 원본 삭제 시 참여 리딩: 유지? 같이 삭제?
5. 인기 탭 정렬 가중치: 좋아요:참여:댓글 비율?

---

## 작업 규칙

1. **작업 시작 전**: daily-todo.md에 오늘 할 작업 체크리스트 작성
2. **작업 완료 후**:
   - daily-todo.md에 완료 표시 및 변경 파일 기록
   - implementation-strategy.md 상태 업데이트
3. **커밋 시**: Git 커밋 해시와 메시지 기록
4. **다음 날**: "다음 작업 추천" 섹션 참고하여 우선순위 결정
