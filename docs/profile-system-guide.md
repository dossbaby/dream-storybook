# 프로필 시스템 & 사주 연동 가이드

## 개요

사용자 프로필 정보를 기반으로 타로, 꿈해몽, **사주(기존 운세)**를 맞춤화하고,
만세력 자동 생성 기능을 제공하는 시스템.

---

## 1. 프로필 필드 구조

```javascript
userProfile = {
  name: "홍길동",           // 이름 (리딩에서 호명)
  birthDate: "1987-03-15",  // 생년월일 (YYYY-MM-DD)
  birthTime: "14:30",       // 태어난 시간 (HH:mm) - 사주 필수!
  gender: "female" | "male", // 성별 (기타 제외)
  mbti: "ENFP",             // MBTI (선택)

  // 자동 계산 필드
  zodiac: { name: "물고기자리", emoji: "♓" },  // 별자리
  age: 37,                   // 나이

  // 만세력 정보 (API 생성)
  saju: {
    yearPillar: "정묘(丁卯)",   // 년주
    monthPillar: "계묘(癸卯)",  // 월주
    dayPillar: "임인(壬寅)",    // 일주
    hourPillar: "정미(丁未)",   // 시주

    dayMaster: "임수(壬水)",    // 일간
    elements: {
      wood: 2, fire: 2, earth: 1, metal: 1, water: 2
    },
    summary: "물 기운이 강한 사주로...",  // AI 요약
    strengths: ["창의성", "적응력"],
    weaknesses: ["우유부단", "감정기복"],
    yearFortune2025: "올해는 변화의 해로..."  // 년운
  }
}
```

---

## 2. 프로필 설정 모달 UI

### 필드 목록
| 필드 | 타입 | 필수 | 용도 |
|------|------|------|------|
| 닉네임 | text | O | 피드 표시, 댓글 |
| 이름 | text | X | 리딩에서 호명 |
| 생년월일 | date | O* | 별자리, 사주 |
| 태어난 시간 | time | O* | 사주 시주 계산 |
| 성별 | select | O* | 이미지 생성, 사주 |
| MBTI | grid | X | 성향 맞춤 해석 |

*사주/만세력 기능 사용 시 필수

### UI 개선 사항
1. **배경**: 더 밝고 깔끔한 그라데이션
2. **생년월일**: 기본 연도 2000년 (20대 기준)
3. **태어난 시간**: 시간 선택 드롭다운 (자시~해시 or 24시간)
4. **성별**: 여성/남성 2개만 (기타 제외)

---

## 3. 만세력 시스템

### 만세력 계산 로직
```
입력: 생년월일 + 태어난 시간 + 성별
출력: 사주팔자 (년주, 월주, 일주, 시주)
```

### 만세력 생성 API 프롬프트
```
너는 만세력 전문가다. 다음 정보로 정확한 사주팔자를 계산해줘.

생년월일: {birthDate}
태어난 시간: {birthTime}
성별: {gender}
현재년도: 2025

JSON 반환:
{
  "yearPillar": { "korean": "정묘", "hanja": "丁卯", "element": "fire" },
  "monthPillar": { ... },
  "dayPillar": { ... },
  "hourPillar": { ... },
  "dayMaster": { "korean": "임수", "hanja": "壬水", "element": "water" },
  "elements": { "wood": 2, "fire": 2, "earth": 1, "metal": 1, "water": 2 },
  "summary": "일간 임수를 기준으로 한 사주 해석 요약 (200자)",
  "personality": "성격 특성 (150자)",
  "strengths": ["강점1", "강점2", "강점3"],
  "weaknesses": ["약점1", "약점2"],
  "yearFortune2025": "2025년 운세 요약 (200자)",
  "luckyElements": {
    "color": "파란색",
    "number": "1, 6",
    "direction": "북쪽"
  }
}
```

### 만세력 표시 위치
1. **마이페이지**: 프로필 아래 "내 만세력" 섹션
2. **사주 탭**: 로그인 시 상단에 내 사주 요약 표시
3. **사주 결과**: 내 만세력 기반 맞춤 해석

---

## 4. "운세" → "사주" 변경

### 명칭 변경
| 기존 | 변경 |
|------|------|
| 운세 | 사주 |
| FortuneInput | SajuInput |
| FortuneResultView | SajuResultView |
| fortuneResult | sajuResult |
| 🔮 운세 | 🔮 사주 |

### 사주 탭 플로우

#### 로그인 유저 (프로필 완성)
```
[사주 탭 진입]
    ↓
[내 만세력 요약 표시]
 - 년주/월주/일주/시주
 - 오행 분포 그래프
 - 2025년 운세 한줄
    ↓
[오늘의 사주 보기 버튼]
    ↓
[사주 리딩 결과]
 - 내 사주 기반 맞춤 해석
 - 오늘 날짜 + 내 사주 조합 분석
```

#### 비로그인 / 프로필 미완성
```
[사주 탭 진입]
    ↓
[정보 입력 폼]
 - 이름
 - 생년월일
 - 태어난 시간
 - 성별
    ↓
[사주 리딩 결과]
```

---

## 5. heroImage 인물 중심 프롬프트

### 프로필 있을 때
```javascript
// 성별 + 나이대 반영
const personDesc = gender === 'female' ? 'young woman' : 'young man';
const ageRange = `in their ${Math.floor(age / 10) * 10}s`;

// 타로 heroImage
`${personDesc} ${ageRange} standing in a mystical tarot reading scene...`

// 꿈 heroImage
`${personDesc} in a surreal dreamscape...`

// 사주 heroImage
`${personDesc} surrounded by traditional Korean fortune-telling elements,
 floating Chinese characters (四柱八字), cosmic energy...`
```

### 프로필 없을 때
- 기존 landscape/abstract 이미지 (폴백)

---

## 6. 데이터 흐름

### Firebase 저장 구조
```javascript
// users/{userId}
{
  nickname: "도쓰",
  email: "doss@example.com",
  profile: {
    name: "김도쓰",
    birthDate: "1987-03-15",
    birthTime: "14:30",
    gender: "male",
    mbti: "ENFP"
  },
  saju: {  // 만세력 (한번 생성 후 저장)
    yearPillar: {...},
    monthPillar: {...},
    ...
    generatedAt: Timestamp
  },
  updatedAt: Timestamp
}
```

### 리딩 시 프로필 활용
```javascript
// useReading.js
const generateSajuReading = async () => {
  const prompt = `
    사용자 정보:
    - 이름: ${userProfile.name || '익명'}
    - 생년월일: ${userProfile.birthDate}
    - 태어난 시간: ${userProfile.birthTime}
    - 성별: ${userProfile.gender}
    - 사주: ${JSON.stringify(userProfile.saju)}

    오늘 날짜: ${new Date().toLocaleDateString('ko-KR')}

    위 사주를 기반으로 오늘의 운세를 봐줘...
  `;
};
```

---

## 7. 구현 체크리스트

### Phase 1: 프로필 시스템 개선
- [ ] 프로필 모달 UI 개선 (밝은 배경)
- [ ] 생년월일 기본값 2000년
- [ ] 태어난 시간 필드 추가
- [ ] 성별 옵션 2개로 축소

### Phase 2: 운세 → 사주 변환
- [ ] FortuneInput → SajuInput 리네임
- [ ] FortuneResultView → SajuResultView 리네임
- [ ] UI 텍스트 "운세" → "사주" 변경
- [ ] 아이콘/이모지 업데이트

### Phase 3: 만세력 시스템
- [ ] 만세력 생성 API 함수 구현
- [ ] 마이페이지 만세력 섹션 추가
- [ ] 사주 탭 로그인 유저 플로우
- [ ] 사주 탭 비로그인 유저 플로우

### Phase 4: 통합 및 최적화
- [ ] heroImage 프롬프트 사주용 추가
- [ ] 리딩 프롬프트에 사주 정보 반영
- [ ] 피드에서 사주 결과 표시

---

## 8. 프로필 설정 혜택 안내 문구

```
🎁 프로필 설정 시 혜택

✓ 타로, 꿈해몽이 당신에게 맞춤으로!
✓ 이미지에 당신의 모습이 반영돼요
✓ 별자리 기반 운세 분석 제공
✓ MBTI 성향 맞춤 해석
✓ 만세력 자동 생성 & 저장 ⭐ NEW
✓ 사주 볼 때 내 정보 자동 입력
```

---

## 변경 이력

| 날짜 | 변경 내용 |
|------|----------|
| 2025-12-06 | 초안 작성 |
| - | 운세 → 사주 변환 계획 추가 |
| - | 만세력 시스템 설계 |
