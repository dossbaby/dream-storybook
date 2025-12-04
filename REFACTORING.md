# Dream Storybook 리팩토링 계획

> 최종 업데이트: 2024-12-04

## 현재 상태

| 항목 | 시작 | 현재 | 목표 |
|------|------|------|------|
| App.jsx | 3,865줄 | **496줄** ✅ | < 500줄 |
| App.css | 6,841줄 | **5,978줄** (모듈 12개 분리) | < 2,000줄 |
| useState | 92개 | **22개** | < 20개 (그룹화) |
| 컴포넌트 | 1개 | **22개** ✅ | 20개+ |
| 커스텀 훅 | 0개 | **22개** | - |

**진척률**: 3,369줄 감소 (-87.2%), useState 70개 감소 (-76.1%), 컴포넌트 22개 추출, 훅 22개 추가

---

## Phase 1: Quick Wins (중복 코드 제거) ✅ 완료

### 1.1 중복 함수 제거 ✅
- [x] `autoSaveTarot()` 삭제 → `useFirebaseSave` 훅 사용
- [x] `autoSaveFortune()` 삭제 → `useFirebaseSave` 훅 사용
- [x] `autoSaveDream()` 삭제 → `useFirebaseSave` 훅 사용
- [x] `compressImage()` 중복 제거 → 훅에서 import

### 1.2 이미지 생성 통합 ✅
- [x] `generateReading()` 내 `generateImage` → `generateSingleImage` 훅 사용
- [x] `generateTarotReading()` 내 `generateImage` → `generateSingleImage` 훅 사용
- [x] `generateFortuneReading()` 내 `generateImage` → `generateSingleImage` 훅 사용
- [x] `GoogleGenerativeAI` import 제거 (불필요)

### 1.3 CSS 정리
- [x] cards.css 중복 스타일 제거
- [ ] themes.css 중복 확인 및 정리

---

## Phase 2: 상태 그룹화 ✅ 완료

### 2.1 관련 상태 객체화

#### 완료된 그룹화 ✅
- [x] **모달 상태** (4개 → 1개)
  ```javascript
  const [modals, setModals] = useState({
    nickname: false, share: false, report: false, points: false
  });
  ```

- [x] **로딩 상태** (5개 → 1개)
  ```javascript
  const [loading, setLoading] = useState({
    auth: true, feed: true, generating: false, report: false, detailedReading: false
  });
  ```

- [x] **토스트 상태** (4개 → 1개)
  ```javascript
  const [toasts, setToasts] = useState({
    live: null, newType: null, badge: null, tarotReveal: null
  });
  ```

- [x] **댓글 편집 상태** (2개 → 1개)
  ```javascript
  const [commentEdit, setCommentEdit] = useState({
    id: null, text: ''
  });
  ```

- [x] **캘린더 상태** (2개 → 1개)
  ```javascript
  const [calendar, setCalendar] = useState({
    view: false, month: new Date()
  });
  ```

- [x] **타로 상태** (9개 → 1개)
  ```javascript
  const [tarot, setTarot] = useState({
    question: '', selectedCards: [], deck: [], result: null,
    phase: 'question', readings: [], finalCard: null, images: [], revealingIndex: -1
  });
  ```

- [x] **운세 상태** (3개 → 1개)
  ```javascript
  const [fortune, setFortune] = useState({
    type: 'today', result: null, birthdate: ''
  });
  ```

#### 남은 그룹화 (선택적)
- [ ] 입력 관련 상태 그룹화 (많은 참조로 복잡도 높음)
- [ ] UI 상태 그룹화 (많은 참조로 복잡도 높음)

### 2.2 Context 도입
- [ ] `AppContext.jsx` 생성
- [ ] `useApp` 커스텀 훅 생성

---

## Phase 3: 컴포넌트 분리 ✅ 완료

### 3.0 모달 컴포넌트 ✅
- [x] `components/modals/NicknameModal.jsx` - 닉네임 설정 모달
- [x] `components/modals/ShareModal.jsx` - 공유 모달
- [x] `components/modals/ReportModal.jsx` - AI 리포트 모달
- [x] `components/modals/PointsModal.jsx` - 포인트 충전 모달
- [x] `components/modals/DetailedReadingModal.jsx` - 상세 풀이 모달
- [x] `components/modals/SymbolShortsModal.jsx` - 상징 쇼츠 모달

### 3.1 공통 컴포넌트
- [x] `components/common/LoadingOverlay.jsx` - 분석 중 화면
- [x] `components/common/ToastNotifications.jsx` - 토스트 알림들
- [ ] `components/common/Card.jsx` - 통합 카드 UI
- [ ] `components/common/CardStack.jsx` - 3장 스와이프
- [ ] `components/common/Modal.jsx` - 공통 모달 베이스

### 3.2 레이아웃 ✅
- [x] `components/layout/NavBar.jsx` - 상단 네비게이션
- [x] `components/layout/LeftSidebar.jsx` - 실시간 정보/유형 필터
- [x] `components/layout/RightSidebar.jsx` - 실시간 피드
- [ ] `components/layout/MainLayout.jsx` - 메인 레이아웃 래퍼

### 3.3 모드별 컴포넌트 ✅
- [x] `components/dream/DreamInput.jsx` - 꿈 입력 폼
- [x] `components/tarot/TarotInput.jsx` - 타로 질문/카드선택
- [x] `components/tarot/TarotResultView.jsx` - 타로 결과 뷰
- [x] `components/fortune/FortuneInput.jsx` - 운세 입력 폼
- [x] `components/fortune/FortuneResultView.jsx` - 운세 결과 뷰
- [x] `components/result/ResultView.jsx` - 통합 결과 뷰
- [x] `components/detail/DreamDetailView.jsx` - 꿈 상세 뷰 (댓글/해석)
- [x] `components/my/MyPage.jsx` - 마이페이지 (통계/캘린더/목록)

### 3.4 피드 컴포넌트
- [x] `components/feed/FeedView.jsx` - 모드별 피드 뷰
- [ ] `components/feed/FeedList.jsx`
- [ ] `components/feed/FeedCard.jsx`
- [ ] `components/feed/FeedFilters.jsx`

---

## Phase 4: 훅 강화 ✅ 완료

### 4.1 기존 훅 개선
- [x] `useImageGeneration.js` - 진행 상태 추가
- [x] `useFirebaseSave.js` - 에러 핸들링 강화

### 4.2 새 훅 추가 (22개 완료)
- [x] `hooks/useAuth.js` - 인증/사용자 데이터/myDreams/myStats/dreamTypes
- [x] `hooks/useSwipe.js` - 터치 스와이프 로직
- [x] `hooks/useCardNavigation.js` - 카드 네비게이션 + 스와이프
- [x] `hooks/usePoints.js` - 포인트/무료 사용 관리
- [x] `hooks/useBadges.js` - 뱃지 체크/획득
- [x] `hooks/useComments.js` - 댓글/해석 CRUD
- [x] `hooks/usePresence.js` - 실시간 시청자/좋아요 추적
- [x] `hooks/useReading.js` - 통합 리딩 생성 (꿈/타로/운세)
- [x] `hooks/useFeed.js` - 피드 로드/필터
- [x] `hooks/useAiReport.js` - AI 리포트 생성
- [x] `hooks/useDreamActions.js` - 꿈 관련 액션
- [x] `hooks/useTarotActions.js` - 타로 관련 액션
- [x] `hooks/useUserActions.js` - 사용자 관련 액션
- [x] `hooks/useLiveUpdates.js` - 실시간 업데이트
- [x] `hooks/useDreamManagement.js` - 꿈 삭제/공개 토글
- [x] `hooks/useReadingActions.js` - 리딩 생성 액션
- [x] `hooks/useViewActions.js` - 뷰 전환 핸들러 (12개 함수)
- [x] `hooks/useFirebaseSave.js` - Firebase 저장
- [x] `hooks/useAnalysisAnimation.js` - 분석 애니메이션

### 4.3 유틸리티 추출
- [x] `utils/cardHelpers.js` - 카드 데이터 생성, 시간 포맷, 공유 텍스트
- [x] `utils/analysisHelpers.js` - 분석 애니메이션, API 키, 메시지 생성
- [x] `utils/calendarHelpers.js` - 캘린더 날짜 계산, 꿈 필터링

---

## Phase 5: CSS 모듈화

### 5.1 구조 개편
```
src/styles/
├── base/
│   ├── variables.css
│   └── reset.css
├── components/
│   ├── card.css
│   ├── button.css
│   └── input.css
├── layouts/
│   ├── header.css
│   └── sidebar.css
└── themes/
    ├── dream.css
    ├── tarot.css
    └── fortune.css
```

### 5.2 작업 항목
- [ ] CSS 변수 추출
- [ ] 컴포넌트별 CSS 분리
- [ ] 불필요한 스타일 제거

---

## Phase 6: 데이터 구조 통합

### 6.1 결과 스키마 통일
```javascript
const ResultSchema = {
  type: 'dream' | 'tarot' | 'fortune',
  title: string,
  verdict: string,
  rarity: number,
  keywords: [{ word, surface, hidden }],
  cards: [
    { label: string, image: url, content: object }
  ],
  reading: object,
  luckyElements: { color, number, day },
  shareText: string
};
```

### 6.2 Firebase 스키마 통합
- [ ] 컬렉션 구조 검토
- [ ] 인덱스 최적화

---

## 진행 상황

| Phase | 상태 | 완료일 |
|-------|------|--------|
| Phase 1 | ✅ 완료 | 2024-12-03 |
| Phase 2 | ✅ 완료 | 2024-12-03 |
| Phase 3 | ✅ 완료 | 2024-12-04 |
| Phase 4 | ✅ 완료 | 2024-12-04 |
| Phase 5 | 🔄 진행 중 | - |
| Phase 6 | ⏳ 대기 | - |

---

## 변경 로그

### 2024-12-03
- [x] 프로젝트 분석 완료
- [x] 리팩토링 계획 수립
- [x] cards.css 중복 스타일 제거
- [x] Phase 1.1 완료: 중복 저장 함수 3개 제거 (`autoSaveDream`, `autoSaveTarot`, `autoSaveFortune`)
- [x] Phase 1.2 완료: 이미지 생성 함수 3개 통합 (`generateImage` → `generateSingleImage` 훅)
- [x] 불필요한 import 제거 (`GoogleGenerativeAI`)
- [x] App.jsx 186줄 감소 (3,865 → 3,679)
- [x] Phase 2.1 진행: 모달 상태 그룹화 (4개 → 1개 `modals` 객체)
- [x] Phase 2.1 진행: 로딩 상태 그룹화 (5개 → 1개 `loading` 객체)
- [x] Phase 2.1 진행: 토스트 상태 그룹화 (4개 → 1개 `toasts` 객체)
- [x] Phase 2.1 진행: 댓글 편집 상태 그룹화 (2개 → 1개 `commentEdit` 객체)
- [x] Phase 2.1 진행: 캘린더 상태 그룹화 (2개 → 1개 `calendar` 객체)
- [x] useState 92개 → 74개 (-18개, -19.6%)
- [x] Phase 3.0 시작: 모달 컴포넌트 분리
- [x] NicknameModal 추출 (nicknameInput useState 제거)
- [x] ShareModal 추출
- [x] ReportModal 추출
- [x] PointsModal 추출
- [x] LoadingOverlay 추출
- [x] App.jsx 3,707줄 → 3,565줄 (-142줄)
- [x] 총 5개 컴포넌트 추출 완료
- [x] NavBar 추출 (네비게이션 바)
- [x] LeftSidebar 추출 (실시간 정보, 유형 필터, 꿈 상징)
- [x] RightSidebar 추출 (실시간 피드)
- [x] App.jsx 3,565줄 → 3,400줄 (-165줄)
- [x] 총 8개 컴포넌트 추출 완료 (모달 4개 + 공통 1개 + 레이아웃 3개)
- [x] DreamInput 추출 (꿈 입력 폼)
- [x] TarotInput 추출 (타로 질문/카드 선택)
- [x] FortuneInput 추출 (운세 입력 폼)
- [x] App.jsx 3,400줄 → 3,218줄 (-182줄)
- [x] 총 11개 컴포넌트 추출 완료
- [x] ResultView 추출 (통합 결과 뷰)
- [x] DetailedReadingModal 추출 (상세 풀이 모달)
- [x] App.jsx 3,218줄 → 3,082줄 (-136줄)
- [x] 총 13개 컴포넌트 추출 완료
- [x] DreamDetailView 추출 (꿈 상세 뷰 - 댓글/해석 섹션)
- [x] SymbolShortsModal 추출 (상징 쇼츠 모달)
- [x] App.jsx 3,082줄 → 2,882줄 (-200줄)
- [x] 총 16개 컴포넌트 추출 완료
- [x] TarotResultView 추출 (타로 결과 뷰)
- [x] FortuneResultView 추출 (운세 결과 뷰)
- [x] MyPage 추출 (마이페이지 - 프로필/통계/캘린더/꿈 목록)
- [x] App.jsx 2,882줄 → 2,490줄 (-392줄)
- [x] 총 19개 컴포넌트 추출 완료
- [x] FeedView 추출 (모드별 피드 뷰 - 꿈/타로/운세)
- [x] ToastNotifications 추출 (라이브/뱃지/도파민 토스트)
- [x] App.jsx 2,490줄 → 2,362줄 (-128줄)
- [x] 총 21개 컴포넌트 추출 완료 (목표 달성!)
- [x] Phase 4 시작: 커스텀 훅 추가
- [x] useAuth 훅 생성 (인증 로직)
- [x] useSwipe 훅 생성 (터치 스와이프)
- [x] useCardNavigation 훅 생성 (카드 네비게이션)
- [x] useSwipe 훅 App.jsx에 적용
- [x] StoryCard 추출 (카드 렌더링 컴포넌트 - 9개 카드 타입 통합)
- [x] App.jsx 2,362줄 → 2,139줄 (-223줄)
- [x] 총 22개 컴포넌트 추출 완료
- [x] cardHelpers.js 생성 (카드 데이터 생성 + formatTime 함수)
- [x] App.jsx 2,139줄 → 2,102줄 (-37줄)
- [x] 중복 dreamSymbols 정의 제거 (constants.js에서 import)
- [x] usePoints 훅 생성 (포인트 시스템 로직)
- [x] App.jsx 2,102줄 → 2,053줄 (-49줄)
- [x] useState 3개 감소 (userPoints, freeUsesLeft, pointHistory → usePoints 훅)
- [x] 중복 BADGES 정의 제거 (constants.js에서 import)
- [x] useBadges 훅 생성 (뱃지 체크/부여 로직)
- [x] App.jsx 2,053줄 → 1,991줄 (-62줄) **2,000줄 이하 달성!**
- [x] useState 1개 감소 (userBadges → useBadges 훅)
- [x] analysisHelpers.js 생성 (분석 애니메이션 + API 키 검증 + 메시지 생성)
- [x] generateReading/generateTarotReading/generateFortuneReading 리팩토링
- [x] App.jsx 1,991줄 → 1,940줄 (-51줄)
- [x] generateShareText 함수 cardHelpers.js로 추출
- [x] fortuneTypesInfo 중복 제거 (FORTUNE_TYPES 사용)
- [x] App.jsx 1,940줄 → 1,924줄 (-16줄) **50% 감소 달성!**

### 2024-12-04
- [x] useReading 훅 생성 (꿈/타로/운세 리딩 생성 통합)
- [x] useFeed 훅 생성 (피드 데이터 로딩)
- [x] useAiReport 훅 생성 (AI 리포트 생성)
- [x] useDreamActions 훅 생성 (꿈 관련 액션)
- [x] useTarotActions 훅 생성 (타로 관련 액션)
- [x] useUserActions 훅 생성 (사용자 관련 액션)
- [x] useLiveUpdates 훅 생성 (실시간 업데이트)
- [x] App.jsx 1,924줄 → 842줄 (-1,082줄)
- [x] useAuth 훅 강화 (loadMyDreams, myStats, dreamTypes 통합)
- [x] useDreamManagement 훅 생성 (꿈 삭제/공개 토글)
- [x] useReadingActions 훅 생성 (리딩 생성 액션)
- [x] useViewActions 훅 생성 (뷰 전환 핸들러 12개)
- [x] App.jsx 842줄 → 496줄 (-346줄) **목표 달성! (<500줄)**
- [x] Phase 3, 4 완료
- [x] 총 22개 커스텀 훅 완성
- [x] Phase 5 시작: CSS 모듈화
- [x] styles/base/ 생성 (variables.css, reset.css, responsive.css)
- [x] styles/layouts/ 생성 (main-layout.css, navbar.css, sidebar.css)
- [x] styles/components/ 생성 (toast.css, modal.css)
- [x] styles/views/ 생성 (tarot.css)
- [x] App.css 6,841줄 → 5,978줄 (-863줄, 12개 모듈 분리)
