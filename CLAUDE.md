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
