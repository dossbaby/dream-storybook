# 점AI (jeom.ai) 구현 전략 v2
> 최종 업데이트: 2025년 12월 13일
>
> 기존 3,400줄 → 간소화 버전

---

## 완료된 Phase 요약

| Phase | 이름 | 완료일 | 핵심 내용 |
|-------|------|--------|----------|
| 0 | AI Tier System | ✅ | 3티어 (무료/프리미엄/울트라), Sonnet/Opus 분기 |
| 1 | 기반 작업 | ✅ | 리디바탕 폰트, fortune→saju 네이밍 |
| 2 | 통합 공개 설정 | ✅ | visibility 3단계 (private/unlisted/public) |
| 3 | 태그 시스템 | ✅ | keywords→tags, /tag/{name} 라우팅 |
| 4 | pSEO 강화 | ✅ | TagPage, sitemap, robots.txt |
| 5 | 결제 시스템 | ✅ | PremiumModal, 토스페이먼츠 연동 |
| 6 | 데이터 마이그레이션 | ✅ | fortunes→saju, /fortune/* 리다이렉트 |
| 7 | 티어 고도화 | ✅ | Hidden Insight 잠금, 주 3회 제한 |
| 7.5 | 리브랜딩 | ✅ | jeom.ai 도메인, 점AI 브랜드 |
| 8 | 그로스 | ✅ | 알림, 레퍼럴, 온보딩, 시즌 이벤트, i18n 기반 |
| 9 | 프롬프트 캐싱 | ✅ | Claude cache_control, 비용 80% 절감 |
| 10 | 모바일 최적화 | ✅ | 바텀네비, PWA, 터치 최적화, Skeleton UI |
| 11 | 피드백 시스템 | ✅ | 별점, FeedbackModal, 인센티브 |
| 12 | 타로 카드 선택 UX | ✅ | 풀스크린 몰입형, 파티클 효과 |
| 13 | 네비게이션 및 FAB | ✅ | CTA 개선, Firebase 폴링 전환 |
| 16 | 온보딩 플로우 | ✅ | 5단계 스와이프 튜토리얼 |
| 17 | UX 폴리싱 | ✅ | OG 이미지, 스켈레톤 카드 |
| 18 | 에러 처리 | ✅ | EmptyState, ErrorBoundary |
| 19 | 이미지 생성 고도화 | ✅ | 12개 애니메 스타일, Hero 이미지 분리 |
| 25 | UI/UX 폴리싱 & 브랜딩 | ✅ | 모드별 테마, 입력 UI 통일, 태그라인 |
| 26 | 마이페이지 개편 | ✅ | MyReadingsView, 프로필 유도 모달 |
| 30 | 2K 이미지 업그레이드 | ✅ | Gemini 2K, Firebase Resize, OptimizedImage |

---

## 진행 중 / 대기 작업

### 🔴 즉시 (버그 수정)

#### Phase 27: 버그 & 개선 목록
| # | 작업 | 상태 | 설명 |
|---|------|------|------|
| 1 | 분석 단계 스크롤바 숨기기 | ⏳ | `overflow: hidden` 적용 |
| 2 | Sticky Persona Card 위치 | ⏳ | top nav 숨김 시 여백 버그 |
| 4 | 카드 재선택 시 덱 상태 | ⏳ | deselect 해도 선택 표시 유지 |
| 9 | 프로필 설정 모달 레이아웃 | ⏳ | 생년월일/시간 50/50 split |
| 13 | 리딩 이미지 Height | ⏳ | `.chapter-hero` 350→480px |
| 14 | 이미지 안 뜨는 버그 | ⏳ | Hero/Card 랜덤 누락 원인 파악 |

---

### 🟡 중기 (1-2주)

#### Phase 28: 스트리밍 & Progressive Loading
> 2-3분 대기 → 체감 10초로 개선

**⚠️ 기존 Prompt 보존 원칙**: prompt 내용은 절대 수정 금지, 메커니즘만 변경

| 작업 | 상태 | 설명 |
|------|------|------|
| `messages.create()` → `messages.stream()` | ⏳ | useReading.js |
| 스트리밍 버퍼 파싱 | ⏳ | 섹션별 완료 감지 |
| 텍스트 완료 시 해당 이미지 즉시 시작 | ⏳ | hook 완료 → Hero 이미지 |
| 섹션별 ready 상태 관리 | ⏳ | 카드별 오픈 버튼 활성화 |
| 결과 페이지 조기 전환 | ⏳ | hook 완료 시 전환 |
| Haiku 별도 호출 제거 | ⏳ | Sonnet에서 dopamineMessages 통합 |

**예상 결과:**
- 첫 피드백: Haiku ~1초 → Sonnet 스트리밍 2초
- 결과 페이지 전환: 2-3분 → **10초**
- 첫 카드 오픈: 2-3분 → **20초**
- API 비용: Haiku + Sonnet → **Sonnet만**

---

#### Phase 24: 커뮤니티 피드 시스템 (남은 작업)

##### Phase 24.3: Visibility 간소화
| 작업 | 상태 | 비고 |
|------|------|------|
| unlisted 옵션 제거 | ⏳ | public / private 만 유지 |
| 비공개 시 보이는 영역 정의 | ⏳ | hero + question + hook + foreshadow |
| TarotResultView 조건부 렌더링 | ⏳ | isPublic 기반 분기 |

##### Phase 24.4: 참여 시스템
| 작업 | 상태 | 비고 |
|------|------|------|
| "나도 같은 질문으로 타로보기" CTA | ⏳ | floating 버튼 |
| 질문 스킵 → 바로 카드 선택 | ⏳ | originalQuestion 전달 |
| Firebase 스키마 추가 | ⏳ | isParticipation, participationCount |
| 참여 리딩 요약 → 원본 댓글로 | ⏳ | 자동 게시 |

##### Phase 24.5: 인기 탭
| 작업 | 상태 | 비고 |
|------|------|------|
| PopularView 컴포넌트 | ⏳ | engagement score 정렬 |
| 트렌딩 질문 섹션 | ⏳ | 이번 주 TOP 5 |

---

#### Phase 21: 도파민 메시지 시스템 개편
> 가짜 랜덤 → 진짜 맞춤형 기대감 빌딩

| 작업 | 상태 | 비고 |
|------|------|------|
| Haiku 도파민 메시지 선생성 | ⏳ | Hook/Foreshadow 스타일 |
| AnalysisOverlay 풀스크린 개편 | ⏳ | 타이핑 효과 |
| 메시지 큐 시스템 | ⏳ | API 완료 이벤트 기반 |
| 타로 카드 영어 이름 표기 | ⏳ | 심판 → JUDGEMENT |

---

### 🟢 장기

#### Phase 14: Firebase 비용 최적화 (남은 것)
| 작업 | 상태 | 절감 효과 |
|------|------|----------|
| 배치 쓰기 (batch write) | ⏳ | 쓰기 20% 감소 |
| 페이지네이션 적용 | ⏳ | 읽기 50% 감소 |
| React Query/SWR 도입 | ⏳ | 읽기 30% 감소 |

---

#### Phase 15: SEO 콘텐츠 전략
> Headless WordPress + RankMath

| 작업 | 상태 | 비고 |
|------|------|------|
| Headless WP 세팅 | ⏳ | wp.jeom.ai |
| WPGraphQL + RankMath 연동 | ⏳ | SEO 최적화 |
| WPML 다국어 플러그인 | ⏳ | 한/영/일/중 |
| 꿈 해몽 사전 페이지 | ⏳ | /dreams/dictionary/뱀 등 |
| 타로 카드 의미 페이지 | ⏳ | /tarot/cards/fool 등 |
| "뱀꿈 해몽 총정리" 가이드 | ⏳ | 2000자+ 심층 콘텐츠 |

---

#### Phase 20: 글로벌 Localization
> 일본 (四柱推命), 중국 (八字) 시장

| 작업 | 상태 | 비고 |
|------|------|------|
| ja.js 일본어 locale | ⏳ | 1순위 확장 |
| zh.js 중국어 locale | ⏳ | 1순위 확장 |
| AI 프롬프트 현지화 | ⏳ | getLanguageInstruction(lang) |
| UI 컴포넌트 i18n 적용 | ⏳ | 하드코딩 한국어 제거 |

---

#### Phase 22: 브랜드 컬러 리브랜딩
> `docs/jeomai-brand-color-system.md` 기반

| 작업 | 상태 |
|------|------|
| 페이지 배경 Deep Space 적용 | ⏳ |
| 상단 네비게이션 탭 재디자인 | ⏳ |
| 모드별 섹션 (타로/꿈/사주) 테마 적용 | ⏳ |
| 프리미엄/울트라 모달 border-radius 통일 | ⏳ |

---

#### Phase 23: UX 개선 (남은 것)
| 작업 | 상태 |
|------|------|
| 공개 설정 변경 시 실시간 반영 | ⏳ |
| 공개 설정 토글 active 스타일 | ⏳ |
| 익명성 안내 문구 | ⏳ |
| 닉네임 시스템 완성 (피드에서 userName → nickname) | ⏳ |

---

## 미래 확장 아이디어

| 순위 | 기능 | 난이도 | 상태 |
|------|------|--------|------|
| 1 | 이미지 스타일 확장 (실사, 수채화) | ⭐⭐⭐ | ⏳ |
| 2 | MBTI 탭 & 커뮤니티 확장 | ⭐⭐⭐⭐ | ⏳ |
| 3 | 게이미피케이션 (뱃지, 랭킹) | ⭐⭐⭐⭐ | ⏳ |
| 4 | 실시간 채팅 (24시간 펑) | ⭐⭐⭐⭐⭐ | MAU 확보 후 |

---

## Major Update 계획

### Major A: 별도 커뮤니티 탭
- 자유 글쓰기 + AI 이미지 자동생성
- 카테고리: 자유게시판, 고민상담, 꿈 이야기, 리딩 후기
- "이 글로 리딩 보기" 연결

### Major B: 질문 공개 Freemium
- 질문은 기본 공개, 리딩 결과만 비공개 가능
- "이 질문으로 리딩 받기" 기능
- 완전 비공개는 프리미엄 전용

---

## 기술 스택 요약

```
Frontend: React + Vite
Backend: Firebase (Firestore, Auth, Functions, Storage)
AI: Claude Sonnet/Opus 4.5, Gemini 3 Pro (2K)
결제: 토스페이먼츠
이미지: Firebase Resize Extension (688x384, 1376x768, 2752x1536)
```

---

## 참조 문서
- `docs/pseo-strategy.md` - pSEO 상세 전략
- `docs/jeomai-brand-color-system.md` - 브랜드 컬러 시스템
- `docs/claude-caching-guide.md` - Claude 캐싱 가이드
- `docs/ai-prompt-streaming.md` - 스트리밍 상세 계획
