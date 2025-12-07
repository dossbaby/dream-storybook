# Headless CMS 전략 가이드

점AI 블로그/가이드 페이지를 위한 CMS 선택 및 설정 가이드입니다.

---

## 0. CMS 옵션 비교 (WordPress vs 대안들) 🤔

### 꼭 WordPress를 써야 할까?

**결론: 아니요, 하지만 WordPress가 우리 상황에 가장 적합합니다.**

### Vercel과 연동 가능한 Headless CMS 5가지 비교

| CMS | 타입 | 가격 | 다국어 | SEO | Vercel 연동 | 비개발자 UX | 추천도 |
|-----|------|------|--------|-----|-------------|------------|--------|
| **Headless WordPress** | 오픈소스 | $5-15/월 (호스팅) | ⭐⭐⭐⭐⭐ Polylang | ⭐⭐⭐⭐⭐ RankMath | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | **1위** |
| **Sanity** | SaaS | 무료~$99/월 | ⭐⭐⭐⭐ 내장 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ 공식 | ⭐⭐⭐ | 2위 |
| **Strapi** | 오픈소스 | 무료 (셀프호스팅) | ⭐⭐⭐ 플러그인 | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | 3위 |
| **Contentful** | SaaS | $300/월~ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ 공식 | ⭐⭐⭐⭐⭐ | 4위 |
| **Storyblok** | SaaS | 무료~$99/월 | ⭐⭐⭐⭐⭐ 내장 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ 비주얼 | 5위 |

> 참고: [Vercel CMS Integrations](https://vercel.com/docs/integrations/cms)
> 참고: [Best Headless CMS 2025](https://hygraph.com/blog/best-headless-cms)

---

### 각 CMS 상세 분석

#### 1️⃣ Headless WordPress (추천)
```
장점:
✅ 전 세계 43% 웹사이트가 사용 (가장 익숙한 UI)
✅ RankMath SEO - 최고 수준의 SEO 도구
✅ Polylang - 무료 다국어 지원 (GraphQL 호환)
✅ 플러그인 생태계 (50,000+)
✅ 비개발자도 쉽게 콘텐츠 작성
✅ 저렴한 호스팅 ($5-15/월)

단점:
❌ 별도 호스팅 필요 (Vercel에서 직접 호스팅 불가)
❌ 보안 관리 필요
❌ PHP 기반 (모던하지 않음)
```

#### 2️⃣ Sanity
```
장점:
✅ Vercel 공식 통합
✅ 실시간 협업 (Google Docs처럼)
✅ 관대한 무료 티어
✅ GROQ 쿼리 언어 (강력함)
✅ 호스팅 걱정 없음 (SaaS)

단점:
❌ 학습 곡선 있음 (GROQ)
❌ SEO 플러그인 없음 (직접 구현)
❌ 사용량 늘면 비용 증가
```

#### 3️⃣ Strapi (오픈소스)
```
장점:
✅ 완전 무료 (셀프 호스팅)
✅ REST + GraphQL 지원
✅ 높은 커스터마이징
✅ Node.js 기반 (모던)

단점:
❌ 셀프 호스팅 필요 (관리 부담)
❌ SEO 플러그인 부족
❌ 다국어 설정 복잡
```

#### 4️⃣ Contentful
```
장점:
✅ 엔터프라이즈급 안정성
✅ 최고의 다국어 지원
✅ 비개발자 친화적 UI
✅ 강력한 CDN

단점:
❌ 매우 비쌈 ($300/월~)
❌ 스타트업/개인에겐 오버킬
```

#### 5️⃣ Storyblok
```
장점:
✅ 비주얼 에디터 (노코드 수준)
✅ 다국어 내장
✅ 마케터/디자이너 친화적

단점:
❌ 개발자 유연성 제한
❌ GraphQL 지원 제한적
```

---

### 🏆 점AI 최종 결정: Headless WordPress

| 평가 기준 | WordPress | 이유 |
|----------|-----------|------|
| **SEO** | ⭐⭐⭐⭐⭐ | RankMath = 업계 최고 SEO 도구 |
| **다국어** | ⭐⭐⭐⭐⭐ | Polylang 무료 + GraphQL 지원 |
| **비용** | ⭐⭐⭐⭐⭐ | $5-15/월 (Contentful은 $300+) |
| **콘텐츠 작성 UX** | ⭐⭐⭐⭐⭐ | Gutenberg 에디터 (가장 익숙) |
| **플러그인 생태계** | ⭐⭐⭐⭐⭐ | 50,000+ 플러그인 |
| **Vercel 연동** | ⭐⭐⭐⭐ | WPGraphQL로 완벽 연동 |

**다른 CMS를 고려할 때:**
- Sanity: 실시간 협업이 핵심일 때
- Strapi: 완전 무료 + 풀스택 개발자가 관리할 때
- Contentful: 엔터프라이즈 예산 + 글로벌 팀일 때
- Storyblok: 마케터가 직접 페이지 빌딩할 때

> 참고: [Sanity vs WordPress 2025](https://pagepro.co/blog/sanity-vs-wordpress/)
> 참고: [Best CMS for SEO 2025](https://hygraph.com/blog/best-cms-for-seo)

---

## 🔑 핵심 개념 정리

### WPGraphQL이란?

**GraphQL** = Facebook이 만든 API 쿼리 언어
**WPGraphQL** = WordPress에 GraphQL API를 추가해주는 무료 플러그인

#### 쉬운 비유
```
기존 REST API (레스토랑 세트메뉴):
"햄버거 세트 주세요" → 햄버거 + 감자튀김 + 콜라 다 옴 (안 먹어도)

GraphQL (단품 주문):
"햄버거만 주세요" → 햄버거만 옴 (필요한 것만!)
```

#### 실제 코드 예시
```graphql
# 블로그 포스트 제목과 설명만 요청
query {
  posts(first: 5) {
    nodes {
      title        # 이것만 요청
      excerpt      # 이것만 요청
    }
  }
}

# 응답: 요청한 것만 딱 옴
{
  "data": {
    "posts": {
      "nodes": [
        { "title": "타로 보는 법", "excerpt": "초보자 가이드..." }
      ]
    }
  }
}
```

#### 장점
- **빠름**: 필요한 데이터만 받아서 네트워크 효율적
- **한 번에**: 여러 데이터를 1번 요청으로 (REST는 여러번)
- **타입 안전**: 뭘 받을지 미리 알 수 있음
- **헤드리스**: WordPress 백엔드 + React 프론트엔드 연결

---

## 1. WordPress 호스팅 선택

### ⚠️ Vercel에서 WordPress 호스팅 가능?

**결론: 네이티브 지원 안됨. 다른 호스팅 필요.**

| 방식 | 가능 여부 | 설명 |
|------|----------|------|
| **Headless WordPress** | ✅ 추천 | WordPress는 별도 서버, React 프론트만 Vercel |
| **ServerlessWP** | ⚠️ 실험적 | PHP를 서버리스로 실행 (소규모만) |
| **전통적 WP** | ❌ 불가 | PHP + MySQL 필요, Vercel 미지원 |

**우리 전략:**
- WordPress: Cloudways/Kinsta/DO 등에서 `wp.jeom.ai` 호스팅
- React 프론트: Vercel에서 `jeom.ai` 호스팅
- 연결: WPGraphQL API로 데이터 가져오기

> 참고: [Vercel Headless WordPress 가이드](https://vercel.com/guides/wordpress-with-vercel)

### 추천 호스팅
| 호스팅 | 가격 | 특징 | 추천도 |
|--------|------|------|--------|
| **Cloudways** | $14/월~ | 관리형, 성능 우수 | ⭐⭐⭐⭐⭐ |
| **Kinsta** | $35/월~ | 프리미엄, 최고 속도 | ⭐⭐⭐⭐ |
| **DigitalOcean** | $5/월~ | 직접 설정, 저렴 | ⭐⭐⭐ |
| **Vultr** | $5/월~ | 직접 설정, 저렴 | ⭐⭐⭐ |
| **Hostinger** | $3/월~ | 초저가, 입문용 | ⭐⭐ |

### 도메인 설정
- WordPress: `wp.jeom.ai` (관리자 전용, 외부 노출 X)
- 프론트엔드: `jeom.ai/blog`, `jeom.ai/guide` (사용자용)

## 2. WordPress 설치 후 필수 플러그인

### 2.1 WPGraphQL (필수)
```
플러그인 검색: WPGraphQL
또는: https://github.com/wp-graphql/wp-graphql
```

설치 후:
1. 설정 → WPGraphQL
2. GraphQL Endpoint: `/graphql` (기본값)
3. Enable GraphQL IDE: 체크

### 2.2 RankMath SEO (필수)
```
플러그인 검색: Rank Math SEO
```

**RankMath vs Yoast 선택 이유:**
- 무료 기능이 더 많음
- Headless CMS 네이티브 지원
- REST API / GraphQL 연동 편리
- 성능 우수

설정:
1. RankMath → Dashboard → Setup Wizard 완료
2. General Settings → SEO Meta → Enable Schema 체크

### 2.3 wp-graphql-rank-math (필수)
```
GitHub: https://github.com/developer-developer/wp-graphql-rank-math
```

수동 설치:
1. GitHub에서 ZIP 다운로드
2. 플러그인 → 플러그인 추가 → 플러그인 업로드

이 플러그인이 RankMath SEO 데이터를 GraphQL로 노출시킵니다.

### 2.4 다국어 플러그인 비교 🌏

#### 플러그인 비교표

| 기능 | WPML | Polylang | TranslatePress | Weglot |
|------|------|----------|----------------|--------|
| **가격** | $39/년~ | 무료 (Pro €99) | 무료 (Pro $79) | $17/월~ |
| **접근 방식** | 백엔드 복제 | 백엔드 복제 | 프론트엔드 비주얼 | 클라우드 SaaS |
| **무료 언어 수** | ❌ | 무제한 | 1개 | 1개 |
| **자동 번역** | DeepL 연동 | DeepL (Pro) | Google/DeepL | 내장 |
| **설정 난이도** | 중간 | 복잡 | 쉬움 | 매우 쉬움 |
| **데이터 소유권** | ✅ 내 서버 | ✅ 내 서버 | ✅ 내 서버 | ❌ Weglot 서버 |
| **GraphQL 연동** | wp-graphql-wpml | wp-graphql-polylang | ⚠️ 제한적 | REST만 |

#### 🏆 추천: TranslatePress 또는 Polylang

**TranslatePress** (프론트엔드 비주얼 에디터)
- 장점: 실시간 미리보기, 직관적 UI, WooCommerce 호환
- 단점: DB 크기 증가, GraphQL 연동 복잡
- 추천: 번역 작업 편의성 중시할 때

**Polylang** (백엔드 복제 방식)
- 장점: 무료 버전 충분, wp-graphql-polylang 지원
- 단점: 설정 복잡, 수동 작업 많음
- 추천: Headless 환경, GraphQL 필수일 때

**WPML** (업계 표준)
- 장점: 가장 안정적, 방대한 기능, 에이전시 표준
- 단점: 유료, 무거움
- 추천: 대규모 사이트, 전문 번역팀 있을 때

**Weglot** (클라우드 SaaS)
- 장점: 5분 설치, 자동 번역, 관리 불필요
- 단점: 월정액, 데이터 외부 의존
- 추천: 빠른 시작, 소규모 사이트

> 참고: [WordPress Translation Plugin Comparison](https://wpshout.com/wordpress-translation-plugin-wpml-vs-polylang-vs-weglot-vs-translatepress/)

#### 우리 추천 (점AI)
```
1순위: Polylang + wp-graphql-polylang (무료, GraphQL 호환)
2순위: TranslatePress (비주얼 편집, UX 좋음)
3순위: WPML (안정성, 예산 있을 때)
```

### 2.5 wp-graphql-polylang (추천)
```
GitHub: https://github.com/valu-digital/wp-graphql-polylang
```

Polylang 사용 시 필수. GraphQL로 다국어 콘텐츠 조회 가능.

### 2.6 wp-graphql-wpml (대안)
WPML 사용 시:
```
GitHub: https://github.com/valu-digital/wp-graphql-wpml
```

---

## 2.7 Bricks Builder 사용해도 될까? 🧱

### 결론: Headless 환경에서는 비추천

**Bricks Builder란?**
- WordPress 비주얼 페이지 빌더 (Elementor 대안)
- 성능 좋고, 깔끔한 코드 출력
- 일반 WordPress 사이트에선 훌륭한 선택

**문제점:**
| 이슈 | 설명 |
|------|------|
| **WPGraphQL 미지원** | 네이티브 연동 없음 |
| **Gato GraphQL 필요** | 별도 플러그인으로 우회 (2025.06 출시) |
| **Headless 목적 불일치** | 페이지 빌더는 프론트엔드 렌더링용 |
| **불필요한 복잡성** | React 프론트가 있으면 빌더 의미 없음 |

**우리 상황:**
```
WordPress (백엔드) → 콘텐츠만 관리 → GraphQL로 전송 → React (프론트엔드)
                     ↑
            여기서 빌더는 필요 없음!
```

### 추천 전략
| 상황 | 추천 |
|------|------|
| **Headless (우리)** | Gutenberg 기본 에디터 + ACF (커스텀 필드) |
| **일반 WP 사이트** | Bricks Builder 👍 |
| **랜딩페이지 필요** | Bricks로 별도 제작, 메인 앱과 분리 |

**Gutenberg + ACF 조합:**
- Gutenberg: 블록 에디터 (WordPress 기본 내장)
- ACF (Advanced Custom Fields): 커스텀 데이터 구조
- WPGraphQL for ACF: ACF 데이터 GraphQL 노출

> 참고: [Gato GraphQL Bricks Extension](https://gatographql.com/blog/launching-the-bricks-extension-for-gatographql)

---

## 2.8 Headless용 테마 선택 🎨

### 핵심 질문: GeneratePress 같은 가벼운 테마 써야 할까?

**결론: Headless에서는 테마가 거의 의미 없음 - 최소 테마면 충분**

#### 왜 테마가 필요한가?
WordPress는 기술적으로 테마 없이 작동 안 함. 하지만:
```
일반 WP 사이트: 테마가 프론트엔드 렌더링 담당 (중요!)
Headless WP: 테마는 그냥 플레이스홀더 (React가 렌더링)
```

#### 테마 옵션 비교

| 테마 | 크기 | 속도 | Headless 적합도 | 비고 |
|------|------|------|----------------|------|
| **wp-headless-theme** | ~1KB | ⚡ 최고 | ⭐⭐⭐⭐⭐ | Headless 전용, 빈 테마 |
| **GeneratePress** | ~30KB | ⚡ | ⭐⭐⭐ | 가볍지만 Headless엔 과함 |
| **Astra** | ~48KB | ⚡ | ⭐⭐⭐ | 스타터 템플릿 多, Headless엔 불필요 |
| **Twenty Twenty-Four** | ~200KB+ | 보통 | ⭐⭐ | 기본 테마, 무거움 |

#### 🏆 Headless 추천: 전용 빈 테마

**옵션 1: wp-headless-theme (추천)**
```bash
# GitHub에서 다운로드
https://github.com/madebyfabian/wp-headless-theme
```
- GraphQL 최적화된 빈 테마
- 프론트엔드 접근 시 리다이렉트 설정 가능
- 불필요한 코드 0%

**옵션 2: 직접 만들기 (3파일만)**
```
wp-content/themes/jeom-headless/
├── style.css      (테마 정보만)
├── index.php      (빈 파일 또는 리다이렉트)
└── functions.php  (WPGraphQL 설정)
```

**style.css 예시:**
```css
/*
Theme Name: JeomAI Headless
Description: Headless WordPress theme for jeom.ai
Version: 1.0
*/
```

**index.php 예시 (프론트 접근 시 리다이렉트):**
```php
<?php
// 프론트엔드로 리다이렉트
header('Location: https://jeom.ai');
exit;
```

#### GeneratePress/Astra는 언제?

| 상황 | 추천 테마 |
|------|----------|
| **Headless (우리)** | wp-headless-theme 또는 직접 빈 테마 |
| **일반 WP + 페이지빌더** | GeneratePress, Astra, Kadence |
| **WP 관리자 UI 꾸미기** | 그냥 기본 테마 OK (어차피 안 보임) |

> 참고: [Building a Headless WordPress Theme](https://dev.to/arnonate/building-a-headless-wordpress-theme-3ing)
> 참고: [wp-headless-theme GitHub](https://github.com/madebyfabian/wp-headless-theme)

---

## 2.9 Polylang + WPGraphQL 상세 가이드 🌏

### 왜 Polylang인가? (Headless 환경)

[WP Engine 공식 가이드](https://wpengine.com/builders/multilingual-headlesswordpress-with-nextjs-wpgraphql-polylang/)에서도 Headless 다국어로 **Polylang + WPGraphQL** 조합을 추천합니다.

#### 장점
- **무료**: 무제한 언어 지원
- **GraphQL 완벽 지원**: wp-graphql-polylang 확장
- **데이터 소유권**: 내 서버에 저장
- **커뮤니티**: WPGraphQL Slack #polylang 채널

#### 설치 순서
```
1. Polylang 설치 (플러그인 검색)
2. wp-graphql-polylang 설치 (GitHub)
3. 언어 설정 (한/영/일/중)
4. URL 구조 설정
```

#### URL 설정 (중요!)
Languages → Settings → URL modifications:
- ✅ "The language is set in pretty permalinks"
- ✅ "Hide URL language information for default language"
- ✅ "Remove /language/ in pretty permalinks"

결과:
```
/blog/타로-가이드         (한국어 - 기본)
/en/blog/tarot-guide      (영어)
/ja/blog/タロットガイド    (일본어)
```

#### GraphQL 쿼리 예시
```graphql
# 특정 언어 포스트 조회
query GetPostsByLanguage {
  posts(where: { language: EN }) {
    nodes {
      title
      slug
      language {
        code
        name
      }
      translations {
        slug
        language {
          code
        }
      }
    }
  }
}
```

> 참고: [WPGraphQL Polylang 공식](https://www.wpgraphql.com/extenstion-plugins/wpgraphql-polylang)
> 참고: [wp-graphql-polylang GitHub](https://github.com/valu-digital/wp-graphql-polylang)

---

## 3. WordPress 설정

### 3.1 퍼머링크 설정
설정 → 퍼머링크:
- **Post name** 선택: `/%postname%/`

### 3.2 RankMath 설정
RankMath → General Settings:
- **Titles & Meta**: 각 포스트 타입별 기본 SEO 템플릿 설정
- **Sitemap Settings**: XML 사이트맵 활성화
- **Schema Templates**: Article/BlogPosting 스키마 활성화

### 3.3 카테고리 생성
Posts → Categories:
```
- dream (꿈해몽) - Slug: dream
- tarot (타로) - Slug: tarot
- saju (사주) - Slug: saju
- guide (가이드) - Slug: guide
- tips (팁) - Slug: tips
```

### 3.4 가이드 페이지 구조
Pages → Add New:
```
/guide (부모 페이지)
  ├── /guide/dream-interpretation (꿈해몽 가이드)
  ├── /guide/tarot-reading (타로 리딩 가이드)
  ├── /guide/saju-basics (사주 기초)
  └── /guide/symbols (상징 사전)
```

## 4. 프론트엔드 연동

### 4.1 환경변수 설정
`.env` 파일:
```env
VITE_WP_GRAPHQL_URL=https://wp.jeom.ai/graphql
```

### 4.2 GraphQL 테스트
브라우저에서 `https://wp.jeom.ai/graphql` 접속:
```graphql
query TestQuery {
  posts(first: 3) {
    nodes {
      title
      slug
      seo {
        title
        description
      }
    }
  }
}
```

## 5. CORS 설정

WordPress functions.php 또는 플러그인:
```php
add_action('rest_api_init', function() {
    remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');
    add_filter('rest_pre_serve_request', function($value) {
        header('Access-Control-Allow-Origin: https://jeom.ai');
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization');
        return $value;
    });
});

// GraphQL CORS
add_filter('graphql_response_headers_to_send', function($headers) {
    $headers['Access-Control-Allow-Origin'] = 'https://jeom.ai';
    return $headers;
});
```

## 6. 보안 설정

### 6.1 GraphQL 읽기 전용
WPGraphQL 설정:
- Public Introspection: OFF (프로덕션)
- Debug Mode: OFF

### 6.2 관리자 접근 제한
```php
// wp-admin을 특정 IP만 허용 (선택사항)
// .htaccess 또는 Nginx 설정
```

### 6.3 Rate Limiting
Cloudflare 또는 서버 레벨에서 설정

## 7. 콘텐츠 작성 가이드

### 블로그 포스트 작성
1. Posts → Add New
2. 제목, 본문 작성
3. Featured Image 설정 (16:9 권장)
4. Categories/Tags 선택
5. RankMath → Focus Keyword 설정
6. RankMath → SEO 점수 80+ 목표

### 가이드 페이지 작성
1. Pages → Add New
2. Parent: guide 선택
3. Table of Contents 플러그인 사용 (선택)

## 8. 다국어 콘텐츠 (WPML)

### 번역 워크플로우
1. 원본 (한국어) 작성
2. WPML → Translation Management
3. 번역 작업 (자동 번역 또는 수동)
4. 검수 후 게시

### 언어별 URL 구조
```
/blog/꿈-해몽-방법 (한국어)
/en/blog/dream-interpretation-guide (영어)
/ja/blog/夢占いガイド (일본어)
```

## 9. 모니터링

### RankMath Analytics
- 검색 순위 추적
- 클릭률 모니터링
- Core Web Vitals

### GraphQL 성능
- Query Complexity 모니터링
- Caching (Redis/Varnish)

## 10. 체크리스트

- [ ] WordPress 설치
- [ ] WPGraphQL 플러그인 활성화
- [ ] RankMath SEO 설치 및 설정
- [ ] wp-graphql-rank-math 설치
- [ ] CORS 설정
- [ ] 환경변수 설정 (VITE_WP_GRAPHQL_URL)
- [ ] 테스트 포스트 작성
- [ ] 프론트엔드 연동 테스트
- [ ] (선택) WPML 다국어 설정
- [ ] (선택) CDN 설정

---

## 참고 자료

### 핵심 문서
- [WPGraphQL 공식 문서](https://www.wpgraphql.com/docs)
- [RankMath 공식 가이드](https://rankmath.com/kb/)
- [Headless WordPress + React 가이드](https://developers.wpengine.com/blog/headless-wordpress-with-react)

### Vercel + WordPress
- [Vercel Headless WordPress 가이드](https://vercel.com/guides/wordpress-with-vercel)
- [ServerlessWP (실험적)](https://serverlesswp.com/)

### 다국어 플러그인
- [WPML vs Polylang vs Weglot vs TranslatePress 비교](https://wpshout.com/wordpress-translation-plugin-wpml-vs-polylang-vs-weglot-vs-translatepress/)
- [TranslatePress vs Weglot](https://www.weglot.com/guides/weglot-vs-translatepress)
- [2025 Best Multilingual Plugin](https://trendmeadow.com/best-multilingual-wordpress-plugin-2025/)

### 페이지 빌더
- [Bricks Builder](https://bricksbuilder.io/)
- [Gato GraphQL Bricks Extension](https://gatographql.com/blog/launching-the-bricks-extension-for-gatographql)

### GraphQL
- [WPGraphQL GitHub](https://github.com/wp-graphql/wp-graphql)
- [GraphQL 소개 (Smashing Magazine)](https://www.smashingmagazine.com/2021/04/making-graphql-work-in-wordpress/)

---

## TL;DR (요약)

### CMS 선택 (5개 비교 후 결정)
```
🏆 1위: Headless WordPress ← 선택!
   - SEO: RankMath (최고)
   - 다국어: Polylang (무료)
   - 비용: $5-15/월

📊 2위: Sanity (실시간 협업 필요시)
📊 3위: Strapi (완전 무료 원할 때)
📊 4위: Contentful (엔터프라이즈 예산)
📊 5위: Storyblok (비주얼 에디터 중시)
```

### 우리 스택
```
✅ 프론트엔드: Vercel (jeom.ai)
✅ 백엔드 CMS: Cloudways WordPress (wp.jeom.ai)
✅ API: WPGraphQL
✅ SEO: RankMath + wp-graphql-rank-math
✅ 다국어: Polylang + wp-graphql-polylang (무료) ← WP Engine 공식 추천!
✅ 테마: wp-headless-theme (빈 테마) 또는 직접 제작
✅ 에디터: Gutenberg (기본) + ACF (필요시)
```

### 안 쓰는 것
```
❌ Bricks Builder (Headless에서 불필요, WPGraphQL 미지원)
❌ GeneratePress/Astra (가볍지만 Headless엔 오버킬)
❌ Weglot (데이터 외부 의존, 월정액)
❌ WPML (유료, Polylang으로 충분)
❌ 전통적 WP 테마 (React가 프론트라 필요 없음)
❌ Sanity/Strapi (WordPress가 SEO+다국어 더 강력)
```

### 핵심 결정 요약

| 질문 | 답변 |
|------|------|
| 꼭 WordPress 써야 해? | 아니지만, SEO+다국어+비용 면에서 최적 |
| Vercel에서 WP 호스팅? | ❌ 안됨, 별도 호스팅 필요 |
| Sanity가 더 모던한데? | WordPress가 RankMath SEO로 SEO 압승 |
| Bricks Builder? | ❌ Headless엔 불필요 |
| GeneratePress/Astra? | ❌ 빈 테마로 충분 |
| 다국어 플러그인? | ✅ Polylang (무료, GraphQL 지원) |
| WPGraphQL? | 필요한 데이터만 요청하는 효율적 API |
