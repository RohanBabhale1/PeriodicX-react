# PeriodicX

![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat&logo=vite)
![React Router](https://img.shields.io/badge/React_Router-v6-CA4245?style=flat&logo=reactrouter)
![License](https://img.shields.io/badge/License-MIT-green?style=flat)

An interactive periodic table web app built with React, featuring an AI-powered chemistry assistant, quiz mode, 3D atomic models, and element comparison tools.

---

## ✨ Features

### 🧪 Core
- **118 Elements** — complete data including atomic mass, category, period, group, electron configuration, electronegativity, melting/boiling points, and more
- **Interactive Element Cards** — click any element to open a detailed modal
- **Search** — instant search by name, symbol, or atomic number
- **Multi-Filter** — filter by category, period, group, and state of matter
- **Element Comparison** — compare two elements side by side
- **Dark / Light Mode** — theme toggle with persistent preference
- **Fully Responsive** — works on desktop, tablet, and mobile

### 🎓 Extensions
- **Quiz Mode** — 4 quiz types (Symbol→Name, Name→Symbol, Category, Properties) with configurable question count, streak counter, and answer review
- **3D Atomic Model** — CSS 3D Bohr model with animated electron shells (no Three.js required)
- **Electron Orbital Diagram** — orbital box diagram with ↑↓ spin arrows
- **ChemBot** — AI-powered chemistry assistant chatbot (powered by Groq API) with element-aware context

### 📬 Feedback
- Submissions handled via [Formspree](https://formspree.io)

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 |
| Build Tool | Vite 5 |
| Routing | React Router v6 |
| State | Context API |
| Layout | CSS Grid |
| AI Chatbot | Groq API (llama-3.3-70b-versatile) |
| Feedback | Formspree |
| Deployment | Vercel |

---

## 📁 Project Structure

```
PeriodicX-react/
├── api/                          ← Serverless API functions (Vercel)
│   ├── chat.js                   ← Chat endpoint with rate limiting
│   └── health.js                 ← Health check endpoint
├── public/                       ← Static assets
├── src/
│   ├── assets/                   ← Images, icons, static files
│   ├── components/
│   │   ├── layout/
│   │   ├── periodic-table/
│   │   ├── modal/
│   │   ├── search/
│   │   ├── comparison/
│   │   ├── quiz/
│   │   └── chat/
│   ├── config/
│   ├── context/
│   ├── data/
│   ├── hooks/
│   ├── pages/
│   ├── services/
│   ├── styles/
│   │   └── global.css
│   ├── App.jsx
│   └── main.jsx
├── .env.local                    ← Local environment variables (not committed)
├── .eslintrc
├── .gitignore
├── index.html
├── package.json
├── vercel.json
└── vite.config.js
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- A [Groq API key](https://console.groq.com) (free)

### Installation

```bash
# Clone the repository
git clone https://github.com/RohanBabhale1/PeriodicX-react.git

# Navigate into the project
cd PeriodicX-react

# Install dependencies
npm install

# Start the dev server
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build       # builds to /dist
npm run preview     # preview the production build locally
```

---

## ⚙️ Environment Variables

### Local Development

Create a `.env.local` file in the root of the project:

```env
VITE_GROQ_API_KEY=your_groq_api_key_here
```

> `VITE_` prefix exposes the key to the browser/frontend in dev mode. ChemBot calls the Groq API directly when running locally.

### Production (Vercel)

For the deployed app, the serverless functions in `/api` need the key exposed as a server-side environment variable — **not** the `VITE_` prefixed one.

1. Go to your project on [vercel.com](https://vercel.com)
2. Navigate to **Settings → Environment Variables**
3. Add the following variable:

| Name | Value | Environment |
|---|---|---|
| `GROQ_API_KEY` | `your_groq_api_key_here` | Production, Preview |

4. Click **Save**
5. Go to **Deployments** and **Redeploy** — environment variables only take effect after a redeploy

> ⚠️ **Important:** `VITE_GROQ_API_KEY` (used locally) and `GROQ_API_KEY` (used by Vercel serverless functions) are two separate variables. You must add `GROQ_API_KEY` to Vercel's dashboard, otherwise `/api/health` will return 503 and `/api/chat` will return 500, causing ChemBot to fail in production.

---

## 🧭 Routes

| Path | Page |
|---|---|
| `/` | Home — Periodic Table |
| `/compare` | Element Comparison |
| `/quiz` | Quiz Mode |
| `*` | 404 Not Found |

---

## 🤖 ChemBot

ChemBot is a chemistry-focused AI assistant embedded in the app as a floating chat widget. It uses the **Groq API** (model: `llama-3.3-70b-versatile`) and is context-aware — when you're viewing an element, ChemBot automatically loads its data and answers questions about it specifically.

It only answers chemistry-related questions. Off-topic queries are politely declined.

### Rate Limits

ChemBot has built-in rate limiting to protect the API quota:

- **Per user:** 6 messages/minute, 100,000 tokens/session
- **Global:** 20 requests/minute, 100,000 tokens/day
- Friendly error messages are shown when limits are reached

---

## 📬 Feedback

The in-app feedback form (Contact & Feedback modal) collects:
- Name & Email
- Feedback type — Bug Report / Feature Request / General Feedback
- Star Rating (1–5)
- Message

Submissions are sent directly to the maintainer via [Formspree](https://formspree.io)

You can also reach out via:
- 📧 Email: [periodicx01@gmail.com](mailto:periodicx01@gmail.com)
- 🐛 Bug Reports: [GitHub Issues](https://github.com/RohanBabhale1/PeriodicX-react/issues)
- 💡 Feature Ideas: [GitHub Discussions](https://github.com/RohanBabhale1/PeriodicX-react/discussions)

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the repository
2. Create a feature branch — `git checkout -b feature/your-feature`
3. Commit your changes — `git commit -m 'feat: add your feature'`
4. Push to the branch — `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

## 👨‍💻 Author

**Rohan Babhale**
- GitHub: [@RohanBabhale1](https://github.com/RohanBabhale1)
- Email: [babhale.rohan6@gmail.com](mailto:babhale.rohan6@gmail.com)

---

> Built with ❤️ and a passion for chemistry and clean UI.