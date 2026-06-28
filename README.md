<div align="center">

# 🌙 꿈 보다 해몽

**당신의 꿈 속에 숨겨진 의미를 AI가 읽어드립니다**

*현대 심리학과 데이터 기반 해석을 결합한 AI 해몽 서비스*

<br/>

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)
![Vercel](https://img.shields.io/badge/Vercel-Deploy-000000?style=for-the-badge&logo=vercel)

<br/>

<!-- 배포 후 아래 URL을 실제 주소로 교체하세요 -->
**[✨ 지금 바로 해몽 받기 →](#)**

</div>
<div align="center">
  <img width="800" height="483" align="center" alt="Project-GBH-Readme" src="https://github.com/user-attachments/assets/271beb89-c6e9-4962-a0c2-49035c37b32f" />
</div>

---

<br/>

## 🔮 어떤 서비스인가요?

꿈을 꾸고 나서 그 의미가 궁금했던 적 있으신가요?

**꿈 보다 해몽**은 꿈 내용을 입력하면 AI가 한국 전통 해몽 방식과 현대 심리학을 결합해 숨겨진 의미를 풀어드리는 서비스입니다. 달이 화면을 넘나드는 신비로운 애니메이션과 함께 결과를 전달합니다.

<br/>

## ✨ 주요 기능

| 기능 | 설명 |
|------|------|
| 🤖 **AI 해몽** | 꿈 내용을 입력하면 AI가 깊이 있는 해석을 제공 |
| 🌙 **달 애니메이션** | 화면 전환마다 달이 부드럽게 날아다니는 인터랙티브 UI |
| ✨ **길몽 / 흉몽 판별** | 분석 결과에 따라 좋은 요소와 나쁜 요소를 구분해서 표시 |
| 💬 **의견 보내기** | 별점과 한줄 의견으로 피드백 전송 가능 |
| 🖼️ **결과 저장** | 해몽 결과를 이미지로 다운로드 또는 클립보드에 복사 |

<br/>

## 🛠 기술 스택

```
Frontend   Next.js 16 (App Router) · React 19 · TypeScript
AI         Groq API (LLM 추론)
Database   Supabase (피드백 저장)
Deploy     Vercel
```

<br/>

## 🚀 로컬 실행

```bash
# 패키지 설치
npm install

# 환경 변수 설정
cp .env.example .env.local
```

`.env.local` 파일에 아래 값을 채워주세요:

```env
GROQ_API_KEY=your_groq_api_key
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
```

```bash
# 개발 서버 실행
npm run dev
```

<br/>

## ✨ 주요 기능

| 기능 | 설명 |
|------|------|
| 🤖 **AI 해몽** | 꿈 내용을 입력하면 AI가 깊이 있는 해석을 제공 |
| ☀️ **길몽 / 흉몽 판별** | 분석 결과에 따라 좋은 요소와 나쁜 요소를 구분해서 표시 |
| 🔗 **결과 공유하기** | 해몽 결과를 클립보드에 복사해 간편하게 공유 |
| 📸 **캡처 / 이미지 저장** | 해몽 결과를 이미지로 다운로드 |
| 💬 **피드백** | 별점과 한줄 의견으로 서비스 피드백 전송 가능 |

<br/>

<br/>

## 📁 프로젝트 구조

```
src/
├── app/
│   ├── _components/       # UI 컴포넌트
│   │   ├── IntroScreen    # 꿈 입력 화면
│   │   ├── LoadingScreen  # 해몽 중 화면
│   │   ├── ResultScreen   # 결과 화면
│   │   └── MoonLayer      # 달 애니메이션
│   └── api/
│       ├── interpret-dream/  # AI 해몽 엔드포인트
│       └── feedback/         # 피드백 저장 엔드포인트
└── ...
```

<br/>

---

<div align="center">

*🌙 좋은 꿈 꾸세요 🌙*

</div>
