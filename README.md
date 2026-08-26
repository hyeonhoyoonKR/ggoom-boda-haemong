<div align="center">

[🇰🇷 한국어](README.ko.md) · 🇺🇸 English

</div>

<div align="center">

# 🌙 GGoom Boda Haemong (꿈 보다 해몽)

*A Korean idiom meaning "the interpretation matters more than the dream itself" — this project takes it literally*

**AI reads the hidden meaning inside your dreams**

*An AI dream-interpretation service blending traditional Korean dream symbolism with modern psychology*

<br/>

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)
![Vercel](https://img.shields.io/badge/Vercel-Deploy-000000?style=for-the-badge&logo=vercel)

<br/>

**[✨ Try it now →](https://ggoom-boda-haemong.vercel.app/)**

</div>
<div align="center">
  <img width="800" height="483" align="center" alt="Project-GBH-Readme" src="https://github.com/user-attachments/assets/271beb89-c6e9-4962-a0c2-49035c37b32f" />
</div>

---

<br/>

## 🔮 What is this?

Ever woken up wondering what your dream meant?

**GGoom Boda Haemong** is a service where you type in a dream and AI interprets its hidden meaning by combining traditional Korean dream symbolism with modern psychology. Results arrive alongside a moon that glides seamlessly across every screen transition.

<br/>

## ✨ Key Features

| Feature | Description |
|------|------|
| 🤖 **AI Interpretation** | Type your dream, get an in-depth AI reading |
| 🌙 **Moon Animation** | An interactive moon that glides smoothly across every screen transition |
| ✨ **Good / Bad Omen Classification** | Results are split into favorable and cautionary elements |
| 💬 **Send Feedback** | Star rating plus a one-line comment |
| 🖼️ **Save Results** | Download the result as an image or copy it to the clipboard |

<br/>

## 🛠 Tech Stack

```
Frontend   Next.js 16 (App Router) · React 19 · TypeScript
AI         Groq API (LLM inference)
Database   Supabase (feedback storage)
Deploy     Vercel
```

<br/>

## 🧠 Behind the AI Stack

### 🌏 Why the classical Chinese source was translated to Korean first
The source text behind traditional Korean dream interpretation, 周公解夢 (Zhou Gong's Book of Dream Interpretation), is written in classical Chinese. Matching a terse 4-character phrase like `天門開貴人薦引` directly against a Korean dream description clearly wasn't going to capture the meaning well, so the source text was translated into natural Korean sentences first, and those translations were embedded instead. Retrieval ends up matching "Korean dream ↔ Korean interpretation" — entirely within one language.

### 🧩 Embedding model: BGE-M3
Once the translation step was in place, Korean embedding quality mattered more than multilingual coverage. After comparing a few options, BGE-M3 came out near the top for Korean retrieval performance, and being open-source meant it could be self-hosted for free on a HuggingFace Space — that sealed the decision.

### 🗄️ pgvector instead of a dedicated vector DB
Supabase (Postgres) was already in use for feedback storage, so instead of adding a dedicated vector DB like Pinecone, the `vector` extension was simply enabled and everything stayed in the same database. One less service to run.

### ⚡ Groq instead of Gemini
Development started with Gemini, but its free tier's RPM limit was too low and responses were slow. Groq (`openai/gpt-oss-120b`) offered a far more generous free-tier request limit with solid Korean output quality, so the project settled there.

### 🧪 RAGAS, just for fun
Mostly out of curiosity about whether the RAG pipeline was actually answering without "making things up" — measured with faithfulness, answer relevancy, and similar metrics. It's not part of production; it only runs under `eval/`.

<br/>

## 🚀 Run Locally

```bash
# install dependencies
npm install

# set up environment variables
cp .env.example .env.local
```

Fill in `.env.local`:

```env
GROQ_API_KEY=your_groq_api_key
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
```

```bash
# run the dev server
npm run dev
```

<br/>

## 📁 Project Structure

```
src/
├── app/
│   ├── _components/       # UI components
│   │   ├── IntroScreen    # Dream input screen
│   │   ├── LoadingScreen  # Loading screen
│   │   ├── ResultScreen   # Result screen
│   │   └── MoonLayer      # Moon animation
│   └── api/
│       ├── interpret-dream/  # AI interpretation endpoint
│       └── feedback/         # Feedback storage endpoint
└── ...
```

<br/>

## Challenges

### Moon animation
The goal was for the moon to feel like a single continuous object as the user moved between the intro, loading, and result screens — but every stage change re-rendered the React tree and threw its position off. The worst case was the handoff from the small intro moon (52px) to the large, centered loading moon (120px): coordinates and scale would mismatch, and the moon would visibly teleport to a corner of the screen.

The fix ended up capturing the moon's actual on-screen coordinates with `getBoundingClientRect()` at each transition and computing the center position with values like `window.innerWidth / 2 - 60`, semi-hardcoded into `transform: translate()`. CSS animation alone couldn't keep up with the stage-transition timing, so the starting position had to be forced in with `useLayoutEffect` before the first paint.

A stretch where the recurring thought was "how is wiring up one layout transition this hard?" — a reminder that UI is still hard.

<br/>

---

<div align="center">

*🌙 Sweet dreams 🌙*

</div>
