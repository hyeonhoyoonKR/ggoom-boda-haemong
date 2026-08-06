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
**[✨ 지금 바로 해몽 받기 →](https://ggoom-boda-haemong.vercel.app/)**

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

## 🧠 AI 스택 뒷이야기

### 🌏 한자 원문을 한국어로 먼저 번역한 이유
전통 해몽의 원전인 周公解夢(주공해몽)은 원문이 고전 한문입니다. `天門開貴人薦引` 같은 4자 구절을 한국어 꿈 내용과 그대로 비교하면 의미가 제대로 안 잡힐 게 뻔해서, 원문을 자연스러운 한국어 문장으로 먼저 번역해두고 그 번역문을 임베딩했습니다. 결국 검색은 "한국어 꿈 ↔ 한국어 해석"끼리 붙는 구조입니다.

### 🧩 임베딩 모델은 BGE-M3
번역까지 끝낸 뒤엔 다국어 성능보다 한국어 임베딩 품질이 중요해졌습니다. 여러 모델을 비교해보니 BGE-M3가 한국어 검색 성능에서 상위권으로 나왔고, 오픈소스라 HuggingFace Space에 무료로 셀프호스팅할 수 있다는 점도 결정에 한몫했습니다.

### 🗄️ 벡터 DB 대신 pgvector
피드백 저장용으로 이미 Supabase(Postgres)를 쓰고 있었기 때문에, Pinecone 같은 전용 벡터 DB를 새로 붙이는 대신 `vector` 확장만 켜서 같은 DB 안에서 해결했습니다. 서비스 하나 안 늘리기.

### ⚡ Gemini 대신 Groq
처음엔 Gemini로 시작했는데, 무료 티어 RPM이 너무 낮고 응답도 느려서 갈아탔습니다. Groq(`openai/gpt-oss-120b`)는 무료 티어 요청 한도가 훨씬 넉넉하고 한국어 응답 품질도 준수해서, 최종적으로 이쪽으로 정착했습니다.

### 🧪 RAGAS는 그냥 재미로
RAG 파이프라인이 정말 "지어내지 않고" 답하는지 궁금해서 faithfulness, answer relevancy 같은 지표로 찍어본 것 — 프로덕션엔 안 들어가고 `eval/`에서만 돌아갑니다.

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

## 난관 (Challenges)

### 달 애니메이션
인트로 → 로딩 → 결과 화면을 오가는 동안 달이 하나의 존재처럼 자연스럽게 이어지게 만들고 싶었는데, 화면(스테이지)이 바뀔 때마다 리액트가 다시 렌더링하면서 달의 위치가 매번 흐트러졌습니다. 특히 인트로의 작은 달(52px)에서 로딩 화면 중앙의 큰 달(120px)로 넘어가는 순간, 좌표와 스케일이 안 맞아 달이 화면 구석에서 순간이동하듯 튀는 문제가 계속 발생했습니다.

결국 전환 시점마다 `getBoundingClientRect()`로 달의 실제 화면 좌표를 직접 찍고, `window.innerWidth / 2 - 60` 같은 값으로 중앙 위치를 계산해 `transform: translate()`에 반쯤 하드코딩하는 식으로 맞춰야 했습니다. CSS 애니메이션만으로는 stage 전환 타이밍과 맞지 않아서, `useLayoutEffect`로 첫 페인트 전에 시작 위치를 강제로 박아넣는 방식까지 써야 했습니다.

"레이아웃 하나 이어붙이는 게 이렇게 어려울 일인가" 싶었던 구간 — UI는 여전히 어렵다는 걸 다시 한 번 깨달았습니다.

<br/>

---

<div align="center">

*🌙 좋은 꿈 꾸세요 🌙*

</div>
