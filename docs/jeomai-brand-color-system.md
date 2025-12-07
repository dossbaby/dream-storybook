# 점AI 브랜드 컬러 시스템 v2

> 이 문서는 점AI 앱의 모든 컬러, 타이포그래피, 컴포넌트 스타일을 정의합니다.
> Claude Code는 이 문서를 참조하여 일관된 디자인을 구현해야 합니다.

---

## 1. 폰트 시스템 (Typography)

### 1.1 폰트 패밀리

| 용도 | 폰트 | Fallback |
|------|------|----------|
| UI/헤딩 | `Pretendard` | `-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif` |
| 리딩 텍스트 | `RidiBatang` (리디바탕) | `'Nanum Myeongjo', serif` |

### 1.2 텍스트 컬러

#### 골드 텍스트 (메인 강조)
```css
color: #ffd080;
text-shadow: 0 0 20px rgba(255, 180, 80, 0.3), 0 0 40px rgba(255, 180, 80, 0.15);
```

#### 보라색 텍스트 (꿈/신비로운 느낌)
```css
color: rgba(220, 200, 255, 0.9);
text-shadow: 0 0 20px rgba(180, 150, 255, 0.3), 0 0 40px rgba(150, 100, 255, 0.15);
```
- HEX 근사값: `#DCC8FF` (opacity 0.9 적용 전)

#### 흰색 텍스트 스케일
```css
/* 순수 흰색 - 버튼 텍스트, 주요 헤딩 */
.text-white { color: #ffffff; }

/* 90% - 강조 텍스트 */
.text-white-90 { color: rgba(255, 255, 255, 0.9); }

/* 75% - 본문 텍스트 */
.text-white-75 { color: rgba(255, 255, 255, 0.75); }

/* 50% - 서브텍스트, 비활성 */
.text-white-50 { color: rgba(255, 255, 255, 0.5); }
```

#### 라벤더 텍스트 스케일 (Cosmic Lavender)
```css
/* 75% - 본문 텍스트, 주요 설명 */
color: rgba(200, 180, 255, 0.75);
text-shadow: 0 0 15px rgba(200, 180, 255, 0.15);

/* 50% - 서브 텍스트, 부가 정보 */
color: rgba(200, 180, 255, 0.5);

/* 30% - 비활성 텍스트, 힌트, 플레이스홀더 */
color: rgba(200, 180, 255, 0.3);
```

---

## 2. 배경 컬러 (Background Colors)

### 2.1 기본 배경

#### Void Black (가장 깊은 레이어)
```css
background: #08080c;
```

#### Deep Space (페이지 배경 그라디언트)
```css
background: linear-gradient(165deg, #0a0a0f 0%, #12101a 30%, #0d0b14 60%, #08080c 100%);
```

### 2.2 Surface 컬러

#### Card Surface (기본 카드 배경 - Premium 그라디언트 스타일)
```css
background: linear-gradient(135deg, rgba(0, 198, 251, 0.03) 0%, rgba(99, 102, 241, 0.05) 50%, rgba(168, 85, 247, 0.03) 100%), rgba(22, 20, 28, 0.9);
border: 1px solid rgba(99, 102, 241, 0.15);
```

#### Modal Surface (모달/팝업 배경 - 더 어두움)
```css
background: rgba(14, 12, 22, 0.97);
border: 1px solid rgba(70, 60, 100, 0.25);
```

#### Card + Gradient (블루톤 그라디언트 카드)
```css
background: linear-gradient(165deg, rgba(24, 26, 38, 0.95) 0%, rgba(14, 16, 26, 0.98) 100%);
border: 1px solid rgba(70, 80, 120, 0.2);
```

#### Modal + Gradient (Deep Space 모달)
```css
background: linear-gradient(165deg, rgba(16, 14, 28, 0.97) 0%, rgba(10, 8, 20, 0.98) 40%, rgba(6, 5, 14, 1) 100%);
border: 1px solid rgba(80, 70, 140, 0.12);
box-shadow: inset 0 0 60px rgba(60, 50, 120, 0.05);
```

---

## 3. 티어 그라디언트 (Tier Gradients)

### 3.1 Free / Upgrade (무료 티어)
```css
background: linear-gradient(135deg, #ffd080 0%, #ff9020 100%);
color: #1a0030; /* 어두운 텍스트 */
box-shadow: 0 0 25px rgba(255, 180, 80, 0.35);
```

### 3.2 Premium (프리미엄 티어)
```css
background: linear-gradient(135deg, #00c6fb 0%, #6366f1 50%, #a855f7 100%);
color: #ffffff;
box-shadow: 0 0 25px rgba(99, 102, 241, 0.4);
```
- Hover: `box-shadow: 0 0 40px rgba(99, 102, 241, 0.6), 0 0 80px rgba(99, 102, 241, 0.3);`

### 3.3 Ultra (울트라 티어)
```css
background: linear-gradient(135deg, #00d4ff 0%, #a855f7 50%, #ff0080 100%);
color: #ffffff;
box-shadow: 0 0 25px rgba(168, 85, 247, 0.4);
```
- Hover: `box-shadow: 0 0 40px rgba(168, 85, 247, 0.6), 0 0 80px rgba(168, 85, 247, 0.3);`

---

## 4. 서브브랜드 컬러 (Sub-Brand Colors)

### 4.1 타로 (Mystic Violet Blue)

#### 그라디언트
```css
background: linear-gradient(135deg, #3b82f6 0%, #6366f1 35%, #8b5cf6 70%, #a855f7 100%);
box-shadow: 0 0 30px rgba(99, 102, 241, 0.35);
```

#### 개별 컬러
| 이름 | HEX | 용도 |
|------|-----|------|
| Mystic Blue | `#3b82f6` | 시작점, 신비로운 느낌 |
| Indigo | `#6366f1` | 프라이머리 |
| Violet | `#8b5cf6` | 라이트 악센트 |
| Orchid | `#a855f7` | 끝점, 하이라이트 |
| Lavender Soft | `#c4b5fd` | 소프트 배경, 비활성 |

#### 카드 배경 (Radial Gradient)
```css
background: radial-gradient(ellipse at 50% 30%, rgba(99, 102, 241, 0.15) 0%, rgba(59, 130, 246, 0.05) 40%, rgba(18, 16, 24, 0.95) 70%);
border: 1px solid rgba(99, 102, 241, 0.35);
```

### 4.2 꿈해몽 (Dreamy Teal)

#### 그라디언트
```css
background: linear-gradient(135deg, #0891b2 0%, #0d9488 30%, #14b8a6 60%, #5eead4 100%);
box-shadow: 0 0 30px rgba(20, 184, 166, 0.35);
```

#### 개별 컬러
| 이름 | HEX | 용도 |
|------|-----|------|
| Ocean Cyan | `#0891b2` | 시작점, 깊은 바다 |
| Deep Teal | `#0d9488` | 다크 악센트 |
| Teal | `#14b8a6` | 프라이머리 |
| Aqua | `#5eead4` | 라이트, 글로우 |
| Mint | `#99f6e4` | 하이라이트 |

#### 카드 배경 (Radial Gradient)
```css
background: radial-gradient(ellipse at 50% 30%, rgba(20, 184, 166, 0.15) 0%, rgba(8, 145, 178, 0.05) 40%, rgba(18, 16, 24, 0.95) 70%);
border: 1px solid rgba(20, 184, 166, 0.35);
```

### 4.3 사주팔자 (Fortune Fire)

#### 그라디언트
```css
background: linear-gradient(135deg, #b91c1c 0%, #dc2626 25%, #f59e0b 60%, #fbbf24 100%);
box-shadow: 0 0 30px rgba(245, 158, 11, 0.35);
```

#### 개별 컬러
| 이름 | HEX | 용도 |
|------|-----|------|
| Deep Crimson | `#b91c1c` | 시작점, 진한 붉은색 |
| Fortune Red | `#dc2626` | 빨강 악센트 |
| Amber | `#f59e0b` | 프라이머리 |
| Gold | `#fbbf24` | 라이트, 글로우 |
| Cream | `#fde68a` | 소프트 배경, 하이라이트 |

#### 카드 배경 (Radial Gradient - 빨강 글로우)
```css
background: radial-gradient(ellipse at 50% 30%, rgba(220, 38, 38, 0.12) 0%, rgba(251, 191, 36, 0.06) 35%, rgba(18, 16, 24, 0.95) 70%);
border: 1px solid rgba(251, 191, 36, 0.3);
```
- Hover: `box-shadow: 0 0 50px rgba(220, 38, 38, 0.2), 0 0 80px rgba(251, 191, 36, 0.15);`

---

## 5. 보더 스타일 (Border Styles)

### 5.1 Standard Border (기본)
```css
border: 1px solid rgba(80, 70, 120, 0.2);
/* Hover */
border-color: rgba(100, 80, 180, 0.4);
```

### 5.2 Active Border (선택됨/포커스)
```css
border: 2px solid transparent;
background: linear-gradient(rgba(20, 18, 28, 0.95), rgba(20, 18, 28, 0.95)) padding-box,
            linear-gradient(135deg, rgba(120, 200, 255, 0.8), rgba(170, 160, 240, 0.7), rgba(200, 180, 255, 0.6)) border-box;
box-shadow: 0 0 15px rgba(120, 180, 240, 0.25), 0 0 30px rgba(170, 160, 240, 0.12);
```

### 5.3 Glow Border (특별 강조)
```css
border: 2px solid transparent;
background: linear-gradient(rgba(25, 22, 32, 0.95), rgba(25, 22, 32, 0.95)) padding-box,
            linear-gradient(135deg, #ffd080, #ffb347, #ffd080) border-box;
box-shadow: 0 0 20px rgba(255, 180, 80, 0.35), 0 0 40px rgba(255, 180, 80, 0.15), inset 0 0 15px rgba(255, 180, 80, 0.05);
```

### 5.4 Premium Border
```css
border: 2px solid transparent;
background: linear-gradient(rgba(20, 18, 28, 0.95), rgba(20, 18, 28, 0.95)) padding-box,
            linear-gradient(135deg, #00c6fb, #6366f1, #a855f7) border-box;
box-shadow: 0 0 25px rgba(99, 102, 241, 0.4), 0 0 50px rgba(99, 102, 241, 0.2);
```

### 5.5 Ultra Border
```css
border: 2px solid transparent;
background: linear-gradient(rgba(20, 18, 28, 0.95), rgba(20, 18, 28, 0.95)) padding-box,
            linear-gradient(135deg, #00d4ff, #a855f7, #ff0080) border-box;
box-shadow: 0 0 30px rgba(168, 85, 247, 0.5), 0 0 60px rgba(168, 85, 247, 0.25);
```

### 5.6 서브브랜드 보더

#### Tarot Border
```css
border: 2px solid transparent;
background: linear-gradient(rgba(20, 18, 28, 0.95), rgba(20, 18, 28, 0.95)) padding-box,
            linear-gradient(135deg, #3b82f6, #6366f1, #8b5cf6, #a855f7) border-box;
box-shadow: 0 0 20px rgba(99, 102, 241, 0.35);
```

#### Dream Border
```css
border: 2px solid transparent;
background: linear-gradient(rgba(20, 18, 28, 0.95), rgba(20, 18, 28, 0.95)) padding-box,
            linear-gradient(135deg, #0d9488, #14b8a6, #5eead4) border-box;
box-shadow: 0 0 20px rgba(20, 184, 166, 0.35);
```

#### Saju Border
```css
border: 2px solid transparent;
background: linear-gradient(rgba(20, 18, 28, 0.95), rgba(20, 18, 28, 0.95)) padding-box,
            linear-gradient(135deg, #dc2626, #f59e0b, #fbbf24) border-box;
box-shadow: 0 0 20px rgba(245, 158, 11, 0.35);
```

---

## 6. 버튼 스타일 (Button Styles)

### 6.1 공통 버튼 스타일
```css
padding: 14px 32px;
border-radius: 30px;
font-weight: 600;
font-size: 0.95rem;
cursor: pointer;
border: none;
transition: all 0.3s ease;
```

### 6.2 티어 버튼

#### Ultra Button
```css
background: linear-gradient(135deg, #00d4ff 0%, #a855f7 50%, #ff0080 100%);
color: #fff;
box-shadow: 0 0 25px rgba(168, 85, 247, 0.4);
border: 1px solid rgba(255, 255, 255, 0.1);
/* Hover */
box-shadow: 0 0 40px rgba(168, 85, 247, 0.6), 0 0 80px rgba(168, 85, 247, 0.3);
transform: translateY(-2px);
```

#### Premium Button
```css
background: linear-gradient(135deg, #00c6fb 0%, #6366f1 50%, #a855f7 100%);
color: #fff;
box-shadow: 0 0 25px rgba(99, 102, 241, 0.4);
border: 1px solid rgba(255, 255, 255, 0.15);
/* Hover */
box-shadow: 0 0 40px rgba(99, 102, 241, 0.6), 0 0 80px rgba(99, 102, 241, 0.3);
transform: translateY(-2px);
```

#### Free Button (업그레이드 유도)
```css
background: linear-gradient(135deg, #ffd080, #ff9020);
color: #1a0030;
box-shadow: 0 0 25px rgba(255, 180, 80, 0.35);
border: 1px solid rgba(255, 255, 255, 0.1);
/* Hover */
box-shadow: 0 0 40px rgba(255, 180, 80, 0.5), 0 0 80px rgba(255, 180, 80, 0.25);
transform: translateY(-2px);
```

#### Outline Button
```css
background: transparent;
border: 1px solid rgba(100, 80, 180, 0.4);
color: rgba(200, 180, 255, 0.8);
/* Hover */
border-color: rgba(100, 80, 180, 0.7);
background: rgba(100, 80, 180, 0.1);
box-shadow: 0 0 20px rgba(100, 80, 180, 0.2);
```

#### Ghost Button
```css
background: transparent;
border: none;
color: rgba(200, 180, 255, 0.5);
/* Hover */
color: rgba(200, 180, 255, 0.8);
text-shadow: 0 0 10px rgba(200, 180, 255, 0.3);
```

### 6.3 서브브랜드 버튼

#### Tarot Button
```css
background: linear-gradient(135deg, #4c1d95 0%, #6366f1 50%, #8b5cf6 100%);
color: #fff;
box-shadow: 0 0 20px rgba(99, 102, 241, 0.35);
border: 1px solid rgba(255, 255, 255, 0.1);
```

#### Dream Button
```css
background: linear-gradient(135deg, #0d9488 0%, #14b8a6 50%, #5eead4 100%);
color: #0a2520;
box-shadow: 0 0 20px rgba(20, 184, 166, 0.35);
border: 1px solid rgba(255, 255, 255, 0.1);
```

#### Saju Button
```css
background: linear-gradient(135deg, #dc2626 0%, #f59e0b 50%, #fbbf24 100%);
color: #1a0a00;
box-shadow: 0 0 20px rgba(245, 158, 11, 0.35);
border: 1px solid rgba(255, 255, 255, 0.1);
```

---

## 7. 토글 버튼 (Toggle Buttons)

### 7.1 컨테이너
```css
display: inline-flex;
background: rgba(18, 16, 24, 0.9);
border-radius: 50px;
padding: 4px;
border: 1px solid rgba(80, 70, 120, 0.25);
```

### 7.2 토글 버튼 (비활성)
```css
padding: 12px 32px;
border-radius: 46px;
font-weight: 600;
font-size: 0.95rem;
background: transparent;
color: rgba(200, 180, 255, 0.6);
border: none;
transition: all 0.3s ease;
```

### 7.3 Premium 토글 (활성)
```css
background: linear-gradient(135deg, #00c6fb 0%, #6366f1 50%, #a855f7 100%);
color: #fff;
box-shadow: 0 0 20px rgba(99, 102, 241, 0.4);
```

### 7.4 Ultra 토글 (활성)
```css
background: linear-gradient(135deg, #00d4ff 0%, #a855f7 50%, #ff0080 100%);
color: #fff;
box-shadow: 0 0 20px rgba(168, 85, 247, 0.4);
```

---

## 8. 리딩 시작하기 버튼 (Reading Buttons)

### 8.1 공통 스타일
```css
padding: 16px 48px;
border-radius: 50px;
font-weight: 600;
font-size: 1rem;
display: inline-flex;
align-items: center;
gap: 10px;
transition: all 0.3s ease;
```

### 8.2 타로 리딩 버튼

#### Inactive (파스텔 라벤더)
```css
background: rgba(140, 130, 180, 0.12);
border: 1px solid rgba(160, 150, 200, 0.25);
color: rgba(200, 190, 230, 0.8);
/* Hover */
border-color: rgba(170, 160, 210, 0.4);
background: rgba(150, 140, 190, 0.18);
```

#### Active (파스텔 라벤더 그라디언트)
```css
background: linear-gradient(135deg, #7c8dff 0%, #a78bfa 50%, #c4b5fd 100%);
border: 1px solid rgba(196, 181, 253, 0.4);
color: #1a1625;
box-shadow: 0 0 20px rgba(167, 139, 250, 0.3);
```

### 8.3 꿈해몽 리딩 버튼

#### Inactive (파스텔 민트)
```css
background: rgba(130, 180, 175, 0.1);
border: 1px solid rgba(150, 200, 195, 0.2);
color: rgba(200, 220, 218, 0.8);
/* Hover */
border-color: rgba(160, 210, 205, 0.35);
background: rgba(140, 190, 185, 0.15);
```

#### Active (파스텔 민트 그라디언트)
```css
background: linear-gradient(135deg, #6ee7b7 0%, #a7f3d0 50%, #d1fae5 100%);
border: 1px solid rgba(167, 243, 208, 0.4);
color: #0a1f1a;
box-shadow: 0 0 20px rgba(110, 231, 183, 0.25);
```

### 8.4 사주 리딩 버튼

#### Inactive (파스텔 피치/코랄)
```css
background: rgba(200, 160, 150, 0.1);
border: 1px solid rgba(220, 180, 170, 0.2);
color: rgba(230, 210, 200, 0.8);
/* Hover */
border-color: rgba(230, 190, 180, 0.35);
background: rgba(210, 170, 160, 0.15);
```

#### Active (파스텔 피치 그라디언트)
```css
background: linear-gradient(135deg, #fca5a5 0%, #fcd5ce 50%, #ffecd2 100%);
border: 1px solid rgba(252, 213, 206, 0.4);
color: #1f0a0a;
box-shadow: 0 0 20px rgba(252, 165, 165, 0.25);
```

---

## 9. 카드 컴포넌트 (Card Components)

### 9.1 기본 카드
```css
background: rgba(22, 20, 28, 0.85);
border-radius: 16px;
padding: 28px;
border: 1px solid rgba(100, 80, 180, 0.12);
transition: all 0.3s ease;
/* Hover */
border-color: rgba(100, 80, 180, 0.35);
box-shadow: 0 4px 24px rgba(80, 70, 120, 0.15);
```

### 9.2 서브브랜드 카드 (Radial Gradient)

#### 타로 카드
```css
background: radial-gradient(ellipse at 50% 20%, rgba(99, 102, 241, 0.12) 0%, rgba(59, 130, 246, 0.04) 50%, rgba(18, 16, 24, 0.95) 80%);
border: 1px solid rgba(99, 102, 241, 0.2);
/* Hover */
border-color: rgba(99, 102, 241, 0.5);
box-shadow: 0 4px 30px rgba(99, 102, 241, 0.2);
/* 타이틀 색상 */
color: #8b5cf6;
text-shadow: 0 0 20px rgba(139, 92, 246, 0.4);
```

#### 꿈해몽 카드
```css
background: radial-gradient(ellipse at 50% 20%, rgba(20, 184, 166, 0.12) 0%, rgba(8, 145, 178, 0.04) 50%, rgba(18, 16, 24, 0.95) 80%);
border: 1px solid rgba(20, 184, 166, 0.2);
/* Hover */
border-color: rgba(20, 184, 166, 0.5);
box-shadow: 0 4px 30px rgba(20, 184, 166, 0.2);
/* 타이틀 색상 */
color: #5eead4;
text-shadow: 0 0 20px rgba(94, 234, 212, 0.4);
```

#### 사주 카드
```css
background: radial-gradient(ellipse at 50% 20%, rgba(220, 38, 38, 0.1) 0%, rgba(251, 191, 36, 0.05) 40%, rgba(18, 16, 24, 0.95) 70%);
border: 1px solid rgba(251, 191, 36, 0.2);
/* Hover */
border-color: rgba(251, 191, 36, 0.5);
box-shadow: 0 4px 30px rgba(220, 38, 38, 0.15), 0 0 50px rgba(251, 191, 36, 0.1);
/* 타이틀 색상 */
color: #fbbf24;
text-shadow: 0 0 20px rgba(251, 191, 36, 0.4);
```

#### 프리미엄 카드
```css
background: radial-gradient(ellipse at 50% 20%, rgba(99, 102, 241, 0.1) 0%, rgba(0, 198, 251, 0.04) 50%, rgba(18, 16, 24, 0.95) 80%);
border: 1px solid rgba(99, 102, 241, 0.25);
/* Hover */
border-color: rgba(99, 102, 241, 0.5);
box-shadow: 0 4px 30px rgba(99, 102, 241, 0.25);
/* 타이틀: 그라디언트 텍스트 */
background: linear-gradient(135deg, #00c6fb, #a855f7);
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;
background-clip: text;
```

---

## 10. 호버 & 트랜지션 효과

### 10.1 기본 트랜지션
```css
transition: all 0.3s ease;
```

### 10.2 카드 호버
```css
transform: translateY(-4px);
/* + 보더 색상 강화 */
/* + 박스 쉐도우 추가 */
```

### 10.3 버튼 호버
```css
transform: translateY(-2px);
/* + 글로우 강도 1.5배 */
```

### 10.4 글로우 레이어
- 1차 레이어: `0 0 20-30px` (가까이서 선명하게)
- 2차 레이어: `0 0 50-80px` (멀리서 은은하게)

---

## 11. 장식 요소 (Decorations)

### 11.1 별 심볼
- 문자: `✧` (U+2727)
- 색상: `rgba(255, 200, 100, 0.3-0.4)`

### 11.2 디바이더 패턴
```
~ ✧ ~
```

---

## 12. 반응형 (Responsive)

```css
@media (max-width: 768px) {
    .demo-grid, .subbrand-demo, .surface-demo-grid {
        grid-template-columns: 1fr;
    }
    body {
        padding: 20px;
    }
}
```

---

## 13. 컬러 요약 테이블

### 메인 브랜드
| 용도 | 컬러 |
|------|------|
| Mystic Gold (메인) | `#ffd080` |
| Cosmic Lavender | `rgba(200, 180, 255, 0.75)` |
| Void Black | `#08080c` |

### 티어 그라디언트
| 티어 | 시작 | 중간 | 끝 |
|------|------|------|-----|
| Free | `#ffd080` | - | `#ff9020` |
| Premium | `#00c6fb` | `#6366f1` | `#a855f7` |
| Ultra | `#00d4ff` | `#a855f7` | `#ff0080` |

### 서브브랜드
| 서비스 | 프라이머리 | 다크 | 라이트 |
|--------|-----------|------|--------|
| 타로 | `#6366f1` | `#3b82f6` | `#8b5cf6` |
| 꿈해몽 | `#14b8a6` | `#0d9488` | `#5eead4` |
| 사주 | `#f59e0b` | `#dc2626` | `#fbbf24` |

### 리딩 버튼 (파스텔 매트)
| 서비스 | Active 시작 | Active 중간 | Active 끝 |
|--------|------------|------------|----------|
| 타로 | `#7c8dff` | `#a78bfa` | `#c4b5fd` |
| 꿈해몽 | `#6ee7b7` | `#a7f3d0` | `#d1fae5` |
| 사주 | `#fca5a5` | `#fcd5ce` | `#ffecd2` |

---

## 14. 사용 가이드라인

### 14.1 헤딩 색상 선택
- 메인 섹션 타이틀: `#ffd080` (골드) 또는 `#ffffff` (흰색)
- 섹션 내부 서브 헤딩: `#ffffff` 권장
- 서브브랜드 관련 헤딩: 해당 서브브랜드 프라이머리 컬러

### 14.2 배경 선택
- 페이지 전체: Deep Space 그라디언트
- 일반 카드: Card Surface (Premium 스타일)
- 모달/팝업: Modal Surface 또는 Modal + Gradient
- 강조 영역: Void Black + 흰색 텍스트

### 14.3 버튼 선택
- 최상위 CTA: Ultra Button
- 유료 전환: Premium Button
- 무료 시작/업그레이드: Free Button
- 보조 액션: Outline Button
- 취소/나중에: Ghost Button
- 서비스별 액션: 해당 서브브랜드 버튼

### 14.4 리딩 시작 버튼
- 선택 안 됨: Inactive 스타일 (파스텔 매트)
- 선택됨/활성: Active 스타일 (파스텔 그라디언트 + 글로우)

---

## 15. 벤치마크 컴포넌트 (Benchmark Components)

> 아래 컴포넌트들은 디자인 기준점으로, 새로운 모달이나 카드를 만들 때 참조하세요.

### 15.1 Premium Modal (3-Tier) - 최고 기준

**파일:** `src/components/modals/PremiumModal.jsx`, `src/styles/components/premium.css`

이 모달은 모든 모달 디자인의 기준점입니다.

#### 컬러 조합 (The Perfect Palette)
```
Primary Cyan:    #00d4ff (rgb 0, 212, 255)
Primary Purple:  #9b59b6 (rgb 155, 89, 182)
Accent Pink:     #ff0055 (Ultra only)

Background Dark: rgba(12, 8, 24, 0.98)  → rgba(20, 12, 35, 0.97) → rgba(8, 5, 18, 0.99)
Border Opacity:  0.4 ~ 0.5 (subtle glow)
Glow Opacity:    0.3 (box-shadow)
```

이 Cyan → Purple 조합은 점AI의 시그니처 컬러입니다. 모든 Premium/Active 상태에 사용하세요.

#### 모달 컨테이너
```css
.premium-modal.three-tier {
    max-width: 440px;
    border: 2px solid transparent;
    border-radius: 20px;
    background:
        linear-gradient(165deg, rgba(12, 8, 24, 0.98) 0%, rgba(20, 12, 35, 0.97) 40%, rgba(8, 5, 18, 0.99) 100%) padding-box,
        linear-gradient(135deg, rgba(0, 212, 255, 0.5), rgba(155, 89, 182, 0.4)) border-box;
}
```

#### Plan Toggle Tabs (Premium/Ultra 전환)
```css
/* 컨테이너 */
.plan-tabs {
    display: flex;
    gap: 0;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 12px;
    padding: 4px;
    border: 1px solid rgba(255, 255, 255, 0.08);
}

/* 비활성 탭 */
.plan-tab {
    flex: 1;
    padding: 0.75rem 1rem;
    background: transparent;
    border: none;
    border-radius: 10px;
    font-size: 0.9rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.5);
    transition: all 0.25s ease;
}

/* 활성 탭 - Premium */
.plan-tab.active {
    background: linear-gradient(135deg, #00d4ff, #9b59b6);
    color: #fff;
    box-shadow: 0 4px 15px rgba(0, 212, 255, 0.3);
}

/* 활성 탭 - Ultra */
.plan-tab.ultra.active {
    background: linear-gradient(135deg, #00d4ff 0%, #9b59b6 50%, #ff0055 100%);
    box-shadow: 0 4px 15px rgba(155, 89, 182, 0.4);
}
```

#### Price Option Cards (Monthly/Yearly)
```css
/* 기본 */
.price-option {
    padding: 1rem;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.25s ease;
}

/* 선택됨 - Gradient Border */
.price-option.selected {
    border: 2px solid transparent;
    background:
        linear-gradient(135deg, rgba(0, 212, 255, 0.1), rgba(155, 89, 182, 0.08)) padding-box,
        linear-gradient(135deg, rgba(0, 212, 255, 0.5), rgba(155, 89, 182, 0.4)) border-box;
    border-radius: 12px;
}

/* Best Value 선택됨 */
.price-option.best.selected {
    background:
        linear-gradient(135deg, rgba(0, 212, 255, 0.15), rgba(155, 89, 182, 0.12)) padding-box,
        linear-gradient(135deg, rgba(0, 212, 255, 0.7), rgba(155, 89, 182, 0.6)) border-box;
}
```

#### Savings Badge
```css
.price-option .savings-badge {
    position: absolute;
    top: -8px;
    right: -8px;
    background: linear-gradient(135deg, #00d4ff, #9b59b6);
    color: #fff;
    font-size: 0.7rem;
    font-weight: 600;
    padding: 4px 8px;
    border-radius: 10px;
}
```

#### 핵심 디자인 원칙
1. **Gradient Border 기법**: `border-image`는 `border-radius`와 호환 안 됨. 반드시 `padding-box/border-box` 방식 사용
2. **배경 깊이감**: `rgba(12, 8, 24, 0.98)` → `rgba(20, 12, 35, 0.97)` → `rgba(8, 5, 18, 0.99)` 3단계 그라디언트
3. **글로우**: `box-shadow`로 은은한 글로우 (`0 4px 15px rgba(color, 0.3)`)
4. **토글 탭**: 내부 padding 4px, 탭 border-radius 10px
5. **컬러 팔레트**: Cyan `#00d4ff` → Purple `#9b59b6` (Premium), + Pink `#ff0055` (Ultra)

### 15.2 Ultra Upgrade Modal

```css
.premium-modal.ultra-upgrade {
    max-width: 420px;
    border: 2px solid transparent;
    background:
        linear-gradient(165deg, rgba(12, 8, 24, 0.98) 0%, rgba(20, 12, 35, 0.97) 40%, rgba(8, 5, 18, 0.99) 100%) padding-box,
        linear-gradient(135deg, rgba(0, 212, 255, 0.5), rgba(155, 89, 182, 0.4), rgba(255, 0, 85, 0.3)) border-box;
}
```
- Premium과 동일한 구조, 3색 그라디언트 보더 (Cyan → Purple → Pink)

### 15.3 Active Benefit Item
```css
.benefit-item.active.ultra {
    border: 2px solid transparent;
    background:
        linear-gradient(135deg, rgba(0, 212, 255, 0.1), rgba(155, 89, 182, 0.08)) padding-box,
        linear-gradient(135deg, rgba(0, 212, 255, 0.4), rgba(155, 89, 182, 0.3)) border-box;
    border-radius: 12px;
}
```

### 15.4 CSS Tooltips - Premium Modal 스타일

**파일:** `src/styles/views/tarot.css`

CSS-only 툴팁으로 `title` 속성 대신 `data-tooltip` 사용. Premium Modal의 gradient border 기법 적용.

#### Standard Tooltip (Cyan → Purple)
일반적인 UI 요소에 사용하는 기본 툴팁 스타일.

```css
/* 툴팁 컨테이너 */
.element[data-tooltip] {
    position: relative;
}

/* 툴팁 본체 */
.element[data-tooltip]::before {
    content: attr(data-tooltip);
    position: absolute;
    bottom: calc(100% + 12px);
    left: 50%;
    transform: translateX(-50%) scale(0.9);
    padding: 0.6rem 1rem;
    background:
        linear-gradient(135deg, rgba(12, 8, 24, 0.98) 0%, rgba(20, 12, 35, 0.97) 100%) padding-box,
        linear-gradient(135deg, rgba(0, 212, 255, 0.5) 0%, rgba(155, 89, 182, 0.4) 100%) border-box;
    border: 1px solid transparent;
    border-radius: 10px;
    color: rgba(255, 255, 255, 0.95);
    font-size: 0.75rem;
    font-weight: 500;
    white-space: nowrap;
    box-shadow:
        0 8px 32px rgba(0, 0, 0, 0.5),
        0 0 20px rgba(0, 212, 255, 0.15);
    opacity: 0;
    visibility: hidden;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 1000;
    pointer-events: none;
}

/* 툴팁 화살표 */
.element[data-tooltip]::after {
    content: '';
    position: absolute;
    bottom: calc(100% + 4px);
    left: 50%;
    transform: translateX(-50%) scale(0.9);
    border: 6px solid transparent;
    border-top-color: rgba(20, 12, 35, 0.97);
    opacity: 0;
    visibility: hidden;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 1001;
}

/* 호버 시 표시 */
.element[data-tooltip]:hover::before,
.element[data-tooltip]:hover::after {
    opacity: 1;
    visibility: visible;
    transform: translateX(-50%) scale(1);
}
```

#### Cosmic Blue Tooltip (차원의 틈 테마)
프리미엄 기능이나 신비로운 요소에 사용하는 특별한 툴팁.

```css
/* 차원의 틈 테마 툴팁 */
.premium-element[data-tooltip]::before {
    content: attr(data-tooltip);
    position: absolute;
    bottom: calc(100% + 14px);
    left: 50%;
    transform: translateX(-50%) scale(0.9);
    padding: 0.75rem 1.25rem;
    background:
        linear-gradient(145deg, rgba(5, 10, 30, 0.98), rgba(15, 25, 55, 0.97)) padding-box,
        linear-gradient(135deg, rgba(100, 150, 255, 0.5), rgba(160, 120, 255, 0.4)) border-box;
    border: 1px solid transparent;
    border-radius: 12px;
    color: rgba(180, 200, 255, 0.95);  /* 우주적 청색 텍스트 */
    font-size: 0.8rem;
    font-weight: 500;
    white-space: nowrap;
    box-shadow:
        0 8px 32px rgba(0, 0, 0, 0.5),
        0 0 25px rgba(100, 150, 255, 0.2),
        inset 0 0 20px rgba(100, 150, 255, 0.05);
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 1000;
    pointer-events: none;
}

/* 차원의 틈 화살표 */
.premium-element[data-tooltip]::after {
    content: '';
    position: absolute;
    bottom: calc(100% + 6px);
    left: 50%;
    transform: translateX(-50%) scale(0.9);
    border: 7px solid transparent;
    border-top-color: rgba(15, 25, 55, 0.97);
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 1001;
}

/* 호버 시 표시 */
.premium-element[data-tooltip]:hover::before,
.premium-element[data-tooltip]:hover::after {
    opacity: 1;
    visibility: visible;
    transform: translateX(-50%) scale(1);
}
```

#### 툴팁 컬러 팔레트
| 용도 | 배경 | 보더 | 텍스트 | 글로우 |
|------|------|------|--------|--------|
| Standard | `rgba(12, 8, 24, 0.98)` → `rgba(20, 12, 35, 0.97)` | Cyan `0.5` → Purple `0.4` | White `0.95` | Cyan `0.15` |
| Cosmic Blue | `rgba(5, 10, 30, 0.98)` → `rgba(15, 25, 55, 0.97)` | Blue `0.5` → Violet `0.4` | Blue-tint `rgba(180, 200, 255, 0.95)` | Blue `0.2` |

#### 핵심 원칙
1. `title` 대신 `data-tooltip` 사용 (스타일링 가능)
2. `::before`는 툴팁 본체, `::after`는 화살표
3. `scale(0.9)` → `scale(1)` 애니메이션으로 자연스러운 등장
4. `cubic-bezier(0.4, 0, 0.2, 1)` 이징으로 부드러운 전환
5. 화살표 색상은 툴팁 배경 하단 색상과 일치
6. 가장자리 요소는 `left/right: 0`으로 정렬 조정

---

*이 문서는 점AI 브랜드 컬러 시스템의 완전한 참조 문서입니다.*
*모든 UI 구현 시 이 가이드라인을 따라주세요.*
