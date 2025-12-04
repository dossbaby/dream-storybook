# 꿈 해몽 스토리북 - 로컬 실행 가이드

## 1. 사전 준비

### Node.js 설치
- https://nodejs.org 에서 LTS 버전 다운로드 및 설치
- 터미널에서 확인: `node --version`

### Gemini API 키 발급
1. https://aistudio.google.com 접속
2. Google 계정으로 로그인
3. "Get API Key" 클릭하여 키 생성
4. 생성된 키를 안전하게 복사해두기

## 2. 프로젝트 생성

터미널(VSCode 터미널)에서 다음 명령어 실행:

```bash
# Vite로 React 프로젝트 생성
npm create vite@latest dream-storybook -- --template react

# 프로젝트 폴더로 이동
cd dream-storybook

# 필요한 패키지 설치
npm install

# Gemini API SDK 설치
npm install @google/generative-ai
```

## 3. 환경 변수 설정

프로젝트 루트에 `.env` 파일 생성:

```
VITE_GEMINI_API_KEY=여기에_발급받은_API_키_입력
```

⚠️ 주의: `.env` 파일은 절대 Git에 커밋하지 마세요!

## 4. 파일 구조

```
dream-storybook/
├── src/
│   ├── App.jsx          (메인 컴포넌트)
│   ├── main.jsx         (엔트리 포인트)
│   └── index.css        (스타일)
├── .env                 (API 키)
├── package.json
└── vite.config.js
```

## 5. 실행

```bash
# 개발 서버 시작
npm run dev
```

브라우저에서 http://localhost:5173 접속

## 6. 빌드 및 배포

```bash
# 프로덕션 빌드
npm run build

# 빌드된 파일은 dist/ 폴더에 생성됨
```

## 문제 해결

### API 키 오류
- `.env` 파일의 키 앞뒤 공백 확인
- `VITE_` 접두사 확인
- 개발 서버 재시작

### CORS 오류
- 로컬 개발 환경에서는 문제없음
- 배포 시 백엔드 프록시 필요할 수 있음

### 이미지 생성 느림
- Gemini API는 이미지당 5-10초 소요
- 6개 이미지 생성에 30초-1분 정도 걸림
