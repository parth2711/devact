# DevAct

DevAct is a centralized developer analytics platform that aggregates activity from GitHub, competitive programming platforms, coding timers, and package managers into a unified dashboard.

Deployment: [devact.vercel.app](https://devact.vercel.app)

---

## Overview

DevAct collects and correlates data across multiple developer platforms to provide visibility into coding consistency, problem-solving skills, and open-source contributions. The application features periodic data synchronization, historical metric snapshots, a public portfolio page, and an optional AI-driven repository review engine.

---

## Features

### Activity and Version Control
- **GitHub Metrics:** Tracks commit activity, contribution streaks, pull requests, and repository statistics via the GitHub REST API.
- **Repository Visualizer:** Displays repository distributions, top languages, stargazers, and commit frequency.
- **AI Repository Analysis:** Evaluates repository structure and documentation quality using the Google Gemini API.
- **WakaTime Metrics:** Displays rolling 7-day coding duration and language usage breakdowns with encrypted credential storage.

### Competitive Programming
- **Multi-Platform Ratings:** Aggregates live ratings, ranks, and contest histories from Codeforces and LeetCode.
- **Topic and Difficulty Breakdown:** Categorizes solved problems by difficulty tier and algorithmic tags.
- **Contest Schedules:** Aggregates upcoming and ongoing contests across Codeforces and LeetCode with countdown timers and direct links.
- **Practice Review:** Tracks attempted but unsolved problems with direct references to solution editorials.

### Package and Community Statistics
- **Open Source Packages:** Tracks weekly and monthly download counts for packages published to npm and PyPI.
- **Stack Overflow:** Displays reputation milestones, badge distributions, and top community answers.

### Analytics and Developer Health
- **Trend Charts:** Visualizes 30-day historical trajectories for competitive programming ratings, solved problems, and GitHub stars.
- **Skill Decay Monitor:** Detects languages and algorithms untouched for more than 30 days and suggests refreshers.
- **Shadow Dashboard:** Exposes anti-metrics such as dormant repositories and extended inactive streaks to help identify abandoned work.
- **Developer Journal:** Daily work logging with mood tracking, tags, and progress notes.

### Platform and Security
- **Public Profiles:** Shareable developer profiles available at `/u/:username`.
- **Authentication:** Local authentication with bcryptjs and JWT (stored in httpOnly cookies), alongside GitHub OAuth 2.0.
- **Credential Encryption:** Third-party secrets (such as WakaTime API keys) are encrypted at rest using AES-256-CBC.
- **Scheduled Synchronization:** Automatic background sync with daily snapshots and rate-limit handling.

---

## Tech Stack

### Frontend
- **Framework:** React 19 with Vite
- **Routing:** React Router 7
- **Charts and Visualization:** Recharts
- **HTTP Client:** Axios
- **Icons:** Lucide React

### Backend
- **Runtime:** Node.js
- **Framework:** Express 4
- **Database ODM:** Mongoose 8
- **Authentication:** Passport.js (GitHub OAuth 2.0), JSON Web Tokens (JWT)
- **Security:** Helmet, express-rate-limit, bcryptjs
- **Scheduler:** node-cron (local), Vercel Cron handler (serverless)

### Database and Infrastructure
- **Database:** MongoDB Atlas
- **Hosting:** Vercel (monorepo configuration for static client assets and serverless API endpoints)
- **Testing:** Vitest, Supertest

### External APIs
- GitHub REST API
- Codeforces API
- LeetCode GraphQL API
- WakaTime API
- Stack Exchange API
- npm Registry API
- PyPI Stats API
- Google Gemini API

---

## Project Structure

```
devact/
├── api/                    # Vercel serverless function entrypoints
│   ├── cron/sync.js        # Scheduled background synchronization endpoint
│   └── index.js            # Express serverless handler
├── client/                 # React frontend application (Vite)
│   └── src/
│       ├── api/            # Axios instance and API client configuration
│       ├── components/     # Reusable UI components, modals, and loaders
│       ├── context/        # Authentication and global state providers
│       └── pages/          # Application views and dashboard pages
├── server/                 # Express backend application
│   ├── config/             # Database connection and Passport strategy configurations
│   ├── controllers/        # Route handlers and controller logic
│   ├── cron/               # Scheduled synchronization routines
│   ├── middleware/         # Authentication, rate limiting, and validation middleware
│   ├── models/             # Mongoose schemas (User, SyncData, DailySnapshot, etc.)
│   ├── routes/             # REST API route declarations
│   └── services/           # Third-party platform integrations
├── tests/                  # Integration and unit test suite
├── .env.example            # Environment variable template
├── package.json            # Monorepo workspace configuration and root scripts
└── vercel.json             # Vercel deployment routes and serverless bundle config
```

---

## Getting Started

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0
- MongoDB instance (local or MongoDB Atlas connection string)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/parth2711/devact.git
   cd devact
   ```

2. Create and configure the environment file:
   ```bash
   cp .env.example .env
   ```

3. Install all dependencies across the root, client, and server packages:
   ```bash
   npm run install-all
   ```

4. Run the development environment:
   ```bash
   npm run dev
   ```

The client application will be accessible at `http://localhost:5173`, and the API server will run on `http://localhost:5000`.

---

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `PORT` | No | `5000` | Port for the Express backend server |
| `NODE_ENV` | No | `development` | Application runtime environment (`development`, `production`, `test`) |
| `MONGO_URI` | Yes | None | MongoDB connection string |
| `JWT_SECRET` | Yes | None | Secret key used to sign JSON Web Tokens |
| `JWT_EXPIRE` | No | `7d` | Expiration window for JWT tokens |
| `SESSION_SECRET` | Yes | None | Secret key used for session handling |
| `ENCRYPTION_KEY` | Yes | None | Exactly 32-character key for AES-256 encryption of user API tokens |
| `FRONTEND_URL` | Yes | `http://localhost:5173` | Allowed origin for CORS policies and OAuth redirects |
| `GITHUB_TOKEN` | No | None | GitHub Personal Access Token to raise API rate limits from 60 to 5,000 requests/hour |
| `GITHUB_CLIENT_ID` | No | None | Client ID for GitHub OAuth authentication |
| `GITHUB_CLIENT_SECRET` | No | None | Client secret for GitHub OAuth authentication |
| `GITHUB_CALLBACK_URL` | No | `http://localhost:5000/api/auth/github/callback` | Callback URL for GitHub OAuth redirection |
| `GEMINI_API_KEY` | No | None | Google Gemini API key for automated repository code reviews |
| `CRON_SECRET` | No | None | Bearer token to authorize scheduled synchronization requests to `/api/cron/sync` |

> Note: To generate secure 32-byte hexadecimal strings for `JWT_SECRET`, `SESSION_SECRET`, or `ENCRYPTION_KEY`, run:
> ```bash
> node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
> ```

---

## Available Scripts

| Script | Command | Description |
|---|---|---|
| `npm run dev` | `concurrently "npm run server" "npm run client"` | Starts backend and frontend development servers concurrently |
| `npm run server` | `cd server && npm run dev` | Starts the Express server with nodemon |
| `npm run client` | `cd client && npm run dev` | Starts the Vite development server for the frontend |
| `npm run install-all` | `npm install && cd server && npm install && cd ../client && npm install` | Installs root, server, and client dependencies |
| `npm test` | `vitest run` | Executes backend test suites |
| `npm run vercel-build` | `npm install && cd server && npm install && cd ../client && npm install && npm run build` | Builds frontend assets for Vercel production deployment |

---

## Branching Strategy

| Branch | Purpose |
|---|---|
| `main` | Production branch. Automatic continuous deployment to Vercel. |
| `development` | Main integration branch. Features merge here before production release. |
| `feature/*` | Isolated feature branches created from `development`. |

---

## Operational Notes

- **Handle Updates:** When updating a linked GitHub username or Codeforces handle, existing `DailySnapshot` entries remain linked to the account. Snapshot continuity resumes as new data synchronizes under the new handle.
- **WakaTime Sync:** Requires an active WakaTime API key configured in user settings. Data is fetched for a rolling 7-day window.
- **Rate Limit Management:** When `GITHUB_TOKEN` is unset, GitHub API requests use unauthenticated quotas (60 requests per hour per IP). Configuring a token increases the limit to 5,000 requests per hour.

---

## License

This project is licensed under the [MIT License](LICENSE).
