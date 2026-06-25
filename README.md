# 꿈 보다 해몽

AI가 당신의 꿈을 해석해드립니다. 꿈 내용을 입력하면 현대 심리학과 데이터 기반 분석을 결합해 숨겨진 의미를 풀어냅니다.

## 주요 기능

- **AI 해몽** — Google Gemini API를 사용한 꿈 분석
- **길몽 / 흉몽 판별** — 분석 결과에 따라 부적 이미지가 달라집니다
- **애니메이션 부적함** — 결과를 부적함을 열어 확인하는 인터랙티브 UI

## 시작하기

```bash
npm install
```

환경 변수 설정 (`.env.local` 파일 생성):

```
GEMINI_API_KEY=your_api_key_here
```

개발 서버 실행:

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000)에서 확인하세요.

## 기술 스택

- [Next.js 16](https://nextjs.org) (App Router)
- [Google Gemini API](https://ai.google.dev) — 꿈 해석 AI
- TypeScript / React 19

## 배포

[Vercel](https://vercel.com)을 사용하면 가장 쉽게 배포할 수 있습니다.
