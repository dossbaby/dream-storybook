# Claude Code 작업 가이드

## Git 규칙

**절대로 `git pull` 하지 마세요!**

이 프로젝트는 두 대의 컴퓨터(데스크탑, 랩탑)에서 작업하며, 항상 `force push`만 사용합니다.

### 푸시할 때
```bash
git push --force origin main
```

### 절대 하지 말 것
- `git pull`
- `git fetch && git merge`
- `git pull --rebase`

원격에 변경사항이 있어도 무시하고 force push하세요.

## 용어 규칙

### "운세" 대신 "사주" 사용

이 프로젝트에서 fortune/운세 기능은 **사주**로 통일합니다.

- ❌ "운세", "오늘의 운세", "운세 보기"
- ✅ "사주", "오늘의 사주", "사주 보기"

**주의사항:**
- UI 텍스트에서 "운세"를 사용하지 마세요
- 코드 변수명 `fortune`은 그대로 유지 (리팩토링 비용 대비 효과 낮음)
- 사용자에게 보이는 텍스트만 "사주"로 표시

### 모드별 명칭
- `dream` → 꿈 해몽
- `tarot` → 타로
- `fortune` → 사주 (코드는 fortune, UI는 사주)

## 디자인 규칙

### 색상 금지 목록 (절대 사용 금지!)

**탁한 색, mute 색, 채도 낮은 색 사용 금지!**

이 프로젝트는 "Glacial Theme"으로, 선명하고 깨끗한 색상만 사용합니다.

#### ❌ 금지하는 색상 유형:
- 탁한 회색빛 색상 (grayish, muddy)
- 채도가 낮은 색 (desaturated, muted)
- 어둡고 칙칙한 색 (dull, murky)
- 혼탁한 중간톤 (brownish, greenish-gray)

#### ✅ 사용해야 하는 색상:
- **Primary Cyan**: `#00d4ff` (메인 강조)
- **Secondary Purple**: `#9b59b6` (보조 강조)
- **Light Blue**: `rgba(100, 180, 255)` (밝은 파란색)
- **배경**: 순수한 검정 `#000` 또는 매우 어두운 파란 계열
- **텍스트**: 순백 `#fff` 또는 `rgba(255,255,255,0.9)`

#### Border 규칙:
- 단색 border보다 **그라데이션 border** 선호
- 그라데이션: cyan → purple 방향 (`linear-gradient(135deg, #00d4ff, #9b59b6)`)
- hover 시 border glow 효과 추가

#### 예시:
```css
/* ❌ 나쁜 예 - 탁한 색 */
background: rgba(50, 55, 60, 0.5);  /* 탁한 회색 */
border: 1px solid #444;             /* 칙칙한 회색 */

/* ✅ 좋은 예 - 선명한 색 */
background: rgba(0, 20, 40, 0.8);   /* 깨끗한 어두운 파랑 */
border: 1px solid rgba(0, 212, 255, 0.3);  /* 투명한 시안 */
```
