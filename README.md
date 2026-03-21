# DevAct

A developer activity tracking platform that aggregates GitHub contributions, competitive programming stats, and repository insights into a unified dashboard.

Built with the MERN stack (MongoDB, Express, React, Node.js).

---

## Features

| Feature | Description |
|---|---|
| **GitHub Tracker** | Monitor commits, PRs, and contribution streaks |
| **CP Tracker** | Codeforces ratings, LeetCode progress, contest history |
| **Repo Visualizer** | Language breakdown across repositories |
| **Dashboard** | Unified view of all developer metrics |
| **Authentication** | Secure JWT-based login and registration |

---

## Tech Stack

- **Frontend:** React (Vite), React Router, Axios
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (Atlas), Mongoose
- **Auth:** JWT, bcryptjs
- **APIs:** GitHub REST API, Codeforces API, LeetCode GraphQL API

---

## Project Structure

```
devact/
├── client/                 # React frontend (Vite)
│   └── src/
│       ├── api/            # Axios config
│       ├── components/     # Navbar, Footer, ProtectedRoute
│       ├── context/        # AuthContext
│       └── pages/          # Dashboard, GitHubTracker, CPTracker, RepoVisualizer, Profile
├── server/                 # Express backend
│   ├── config/             # Database connection
│   ├── controllers/        # Route handlers
│   ├── middleware/          # Auth middleware
│   ├── models/             # Mongoose schemas
│   ├── routes/             # API routes
│   └── services/           # External API integrations (GitHub, Codeforces, LeetCode)
├── .env.example            # Environment variables template
└── package.json            # Root scripts
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

# Copy environment config
cp .env.example .env
# Edit .env with your MongoDB URI, JWT secret, and GitHub token

# Install all dependencies
npm run install-all

# Start development (client + server)
npm run dev
```

### Environment Variables

| Variable | Required | Description |
|---|---|---|
| `MONGO_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | Secret for signing JWT tokens |
| `JWT_EXPIRE` | No | Token expiry (default: `7d`) |
| `GITHUB_TOKEN` | Recommended | GitHub PAT for higher API rate limits |

### Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start client + server concurrently |
| `npm run client` | Start React dev server only |
| `npm run server` | Start Express dev server only |
| `npm run install-all` | Install dependencies for root, server, and client |

---

## Branch Strategy

| Branch | Purpose |
|---|---|
| `main` | Stable releases |
| `development` | Active development — features merge here first |
| `feature/*` | Individual feature branches |

---

## Known Limitations

- **Handle Changes**: DevAct's daily snapshot tracking relies on a background sync engine that maps external data to an internal user ID. If you change your GitHub username or Codeforces handle and update your profile, the sync engine will start pulling data for the new handle, but old `DailySnapshot` entries will remain. This may cause a temporary discontinuity in your trend charts.

---

## License

This project is licensed under the [MIT License](LICENSE).
