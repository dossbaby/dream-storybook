# pSEO (Programmatic SEO) 전략

> 마지막 업데이트: 2025-12-12

---

## 현재 구현 상태

### 1. 타로 SEO (`generateTarotSEOMeta`) - ✅ 완료

| 항목 | 소스 | 설명 |
|------|------|------|
| **title** | `content.title` 또는 `타로 리딩: ${question}` | 페이지 제목 |
| **description** | `hook` + `foreshadow` (160자) | 메타 설명 |
| **keywords** | 기본 SEO + topics + keywords + 카드 이름들 | 검색 키워드 |
| **ogImage** | `heroImage` → `card1Image` → default | Open Graph 이미지 |
| **ogImageAlt** | `heroImagePrompt` (Claude 생성) | 이미지 alt 텍스트 |

#### 구조화 데이터 (JSON-LD articleBody)
```
질문: ${question}
제목: ${title}
핵심 메시지: ${verdict}
${hook}
${foreshadow}
[첫 번째 카드 이미지: ${card1ImagePrompt}]
${card1Analysis}
[두 번째 카드 이미지: ${card2ImagePrompt}]
${card2Analysis}
[세 번째 카드 이미지: ${card3ImagePrompt}]
${card3Analysis}
[결론 카드 이미지: ${conclusionImagePrompt}]
${conclusionCard}
종합: ${synthesis}
숨겨진 인사이트: ${hiddenInsight}
```

#### 이미지 객체 배열 (ImageObject)
각 이미지에 URL + description (이미지 프롬프트) 포함:
- heroImage + heroImagePrompt
- card1Image + card1ImagePrompt
- card2Image + card2ImagePrompt
- card3Image + card3ImagePrompt
- conclusionImage + conclusionImagePrompt

---

### 2. 꿈 SEO (`generateDreamSEOMeta`) - 기본 구현

| 항목 | 소스 |
|------|------|
| title | `content.title` 또는 '꿈해몽 결과' |
| description | `verdict` 또는 `dreamMeaning` (160자) |
| keywords | 기본 SEO + content keywords |
| ogImage | `dreamImage` 또는 default |

**추후 개선 필요:**
- 꿈 이미지 프롬프트 alt 태그 추가
- 상세 articleBody 구성
- 꿈 해석 상세 내용 포함

---

### 3. 사주 SEO (`generateSajuSEOMeta`) - 기본 구현

| 항목 | 소스 |
|------|------|
| title | `content.title` 또는 '사주 풀이 결과' |
| description | `verdict` 또는 `synthesisAnalysis` (160자) |
| keywords | 기본 SEO + content keywords |
| ogImage | `section1Image` 또는 `morningImage` 또는 default |

**추후 개선 필요:**
- 사주 이미지 프롬프트 alt 태그 추가
- 섹션별 분석 내용 articleBody에 포함
- 만세력 정보 구조화 데이터 추가

---

## 파일 구조

```
src/
├── utils/
│   └── seoConfig.js          # SEO 메타 생성 함수들
├── components/
│   └── common/
│       └── SEOHead.jsx       # react-helmet-async 기반 메타태그 컴포넌트
├── pages/
│   ├── TarotResultPage.jsx   # /tarot/:id 라우트 (TarotResultView + SEO)
│   └── ContentPage.jsx       # /dream/:id, /saju/:id 라우트 (기존)
└── main.jsx                  # 라우팅 설정
```

---

## SEOHead 컴포넌트 Props

```jsx
<SEOHead
    title={string}           // 페이지 제목
    description={string}     // 메타 설명 (160자 권장)
    keywords={string[]}      // 키워드 배열
    image={string}           // OG 이미지 URL
    imageAlt={string}        // OG 이미지 alt 텍스트
    url={string}             // canonical URL
    type={string}            // 'article' | 'website'
    author={string}          // 작성자
    publishedTime={string}   // ISO 날짜
    modifiedTime={string}    // ISO 날짜
    structuredData={object}  // 커스텀 JSON-LD (없으면 기본 생성)
/>
```

---

## 라우팅 현황

| 경로 | 컴포넌트 | SEO |
|------|----------|-----|
| `/tarot/:id` | TarotResultPage → TarotResultView | ✅ 완료 |
| `/dream/:id` | ContentPage | 기본 |
| `/saju/:id` | ContentPage | 기본 |
| `/dreams` | ContentListPage | 목록 SEO |
| `/tarots` | ContentListPage | 목록 SEO |
| `/sajus` | ContentListPage | 목록 SEO |

---

## 추후 작업 (TODO)

### 단기
- [ ] 꿈 결과 페이지 SEO 개선 (DreamResultView + SEOHead)
- [ ] 사주 결과 페이지 SEO 개선 (FortuneResultView + SEOHead)
- [ ] 이미지 프롬프트 필드명 통일 확인 (heroImagePrompt vs imagePrompt)

### 중기
- [ ] 사이트맵 자동 생성 (`generateSitemapEntry` 활용)
- [ ] robots.txt 최적화
- [ ] 목록 페이지 페이지네이션 SEO (rel="next", rel="prev")

### 장기
- [ ] FAQ 구조화 데이터 (FAQPage schema)
- [ ] BreadcrumbList 구조화 데이터
- [ ] 리뷰/평점 구조화 데이터 (AggregateRating)

---

## 참고 자료

- [Google Search Central - 구조화 데이터](https://developers.google.com/search/docs/appearance/structured-data)
- [Schema.org - Article](https://schema.org/Article)
- [Open Graph Protocol](https://ogp.me/)
- [Twitter Cards](https://developer.twitter.com/en/docs/twitter-for-websites/cards)
