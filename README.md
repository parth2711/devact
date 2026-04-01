# DevAct

A developer activity tracking platform that aggregates GitHub contributions, competitive programming stats, coding time, and more into a clean unified dashboard.

Live at **[devact.vercel.app](https://devact.vercel.app)**

Built with the MERN stack (MongoDB, Express, React, Node.js).

---

## Features

| Feature | Description |
|---|---|
| **GitHub Tracker** | Monitor commits, PRs, and contribution streaks across all repositories |
| **CP Tracker** | Codeforces ratings, LeetCode progress, and full contest history |
| **Repo Visualizer** | Language breakdowns, star counts, and activity across your repos |
| **Practice Review** | Problems you attempted but didn't solve — with editorial links |
| **WakaTime Integration** | Weekly coding time and per-language breakdown |
| **Stack Overflow** | Reputation, badges, and top answers |
| **npm / PyPI Packages** | Weekly download stats for your open-source packages |
| **Trend Charts** | 30-day history charts for ratings, solved count, and GitHub stars |
| **Shadow Dashboard** | Toggle into the "Shadow Board" to view anti-metrics like longest zero-commit streak and abandoned repos |
| **Skill Decay Monitor** | Track languages and CP tags you haven't touched in >30 days and discover quick refresher tasks |
| **Public Profile** | Shareable developer profile at `/u/:username` |
| **Authentication** | JWT-based login, registration, and GitHub OAuth |

---

## Tech Stack

- **Frontend:** React (Vite), React Router, Recharts, Axios
- **Backend:** Node.js, Express.js, Passport.js
- **Database:** MongoDB Atlas, Mongoose
- **Auth:** JWT (httpOnly cookies), bcryptjs, GitHub OAuth2
- **APIs:** GitHub REST, Codeforces, LeetCode GraphQL, WakaTime, Stack Overflow, npm Registry, PyPI
- **Deployment:** Vercel (monorepo — client + server)

---

## Project Structure

```
devact/
├── client/                 # React frontend (Vite)
│   └── src/
│       ├── api/            # Axios instance
│       ├── components/     # Navbar, Footer, ProtectedRoute
│       ├── context/        # AuthContext
│       └── pages/          # Dashboard, GitHubTracker, CPTracker, RepoVisualizer,
│                           # PracticeReview, Profile, ManageAccount, PublicProfile
├── server/                 # Express backend
│   ├── config/             # DB connection, Passport config
│   ├── controllers/        # Route handlers
│   ├── cron/               # Daily sync cron job
│   ├── middleware/         # Auth + rate limiter
│   ├── models/             # Mongoose schemas (User, SyncData, DailySnapshot)
│   ├── routes/             # API route definitions
│   └── services/           # External API integrations
├── .env.example            # Environment variables template
└── package.json            # Root scripts (concurrently)
```

---

## Getting Started

### Prerequisites
- Node.js >= 18
- MongoDB (local or [Atlas](https://www.mongodb.com/atlas))

### Setup

```bash
# Clone the repo
git clone https://github.com/parth2711/devact.git
cd devact

# Copy environment config and fill in values
cp .env.example .env

# Install all dependencies (root + server + client)
npm run install-all

# Start development (client + server concurrently)
npm run dev
```

Client runs on `http://localhost:5173`, server on `http://localhost:5000`.

### Environment Variables

| Variable | Required | Description |
|---|---|---|
| `MONGO_URI` | ✅ | MongoDB connection string |
| `JWT_SECRET` | ✅ | Secret for signing JWT tokens |
| `FRONTEND_URL` | ✅ | Frontend origin for CORS (e.g. `http://localhost:5173`) |
| `ENCRYPTION_KEY` | ✅ | Exactly 32-byte key for encrypting WakaTime tokens |
| `JWT_EXPIRE` | No | Token expiry duration (default: `7d`) |
| `GITHUB_TOKEN` | Recommended | GitHub PAT — raises API rate limit from 60 to 5000/hr |
| `GITHUB_CLIENT_ID` | OAuth | GitHub OAuth App client ID |
| `GITHUB_CLIENT_SECRET` | OAuth | GitHub OAuth App client secret |
| `GEMINI_API_KEY` | AI features | Google Gemini API key for AI insights |

### Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start client + server concurrently |
| `npm run client` | Start React dev server only |
| `npm run server` | Start Express server only |
| `npm run install-all` | Install all dependencies |

---

## Branch Strategy

| Branch | Purpose |
|---|---|
| `main` | Production — auto-deploys to Vercel |
| `development` | Active development — features merge here first |
| `feature/*` | Individual feature branches |

---

## Known Limitations

- **Handle changes:** If you change your GitHub username or Codeforces handle and update your profile, old `DailySnapshot` entries remain. Trend charts may show a temporary discontinuity until new snapshots accumulate.
- **WakaTime sync:** Requires a valid API key configured in your profile. Data reflects the past 7 days as returned by the WakaTime API.

---

## License

This project is licensed under the [MIT License](LICENSE).
