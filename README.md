# 🧠 BrainCards

**Learn. Play. Remember.** — Gamified educational platform for children (ages 3–12).

## Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, Vite, TypeScript, Tailwind CSS 4, TanStack Query, Framer Motion |
| Backend | Node.js, Express, TypeScript, Prisma |
| Database | PostgreSQL 16 |
| Auth | JWT + Refresh Tokens, bcrypt |

## Quick Start

### 1. Prerequisites

- Node.js 20+
- Docker (for PostgreSQL)

### 2. Install dependencies

```bash
cd /home/abdulaziz/FlashCard
npm install
```

### 3. Start database

```bash
npm run db:up
```

### 4. Configure environment

```bash
cp server/.env.example server/.env
```

### 5. Migrate & seed

```bash
cd server
npx prisma migrate dev --name init
npm run db:seed
```

### 6. Run development servers

```bash
cd ..
npm run dev
```

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:4000/api/v1/health

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Student | student@braincards.app | password123 |
| Teacher | teacher@braincards.app | password123 |
| Admin | admin@braincards.app | password123 |

## Features (Phase 1–3)

- ✅ Register / Login / Logout (JWT)
- ✅ User profile with avatar, XP, level, coins
- ✅ 8 categories, 40+ flashcards (seed data)
- ✅ Flashcard viewer with flip & text-to-speech
- ✅ Games: Memory Match, Image Quiz, Word Quiz, Spelling
- ✅ XP, levels, coins, streak, achievements
- ✅ Leaderboard & statistics dashboard
- ✅ Guest demo mode (no progress saved)

## Project Structure

```
FlashCard/
├── client/          # React frontend
├── server/          # Express API + Prisma
├── docs/            # Documentation
├── docker-compose.yml
└── package.json     # npm workspaces
```

## API Endpoints

```
GET  /api/v1/health
POST /api/v1/auth/register
POST /api/v1/auth/login
GET  /api/v1/categories
GET  /api/v1/flashcards
GET  /api/v1/games/cards
POST /api/v1/games/submit
GET  /api/v1/stats
GET  /api/v1/leaderboard
```

## Roadmap

- [ ] Parent & Teacher dashboards
- [ ] Admin panel
- [ ] More game modes (Hangman, Word Search, Survival)
- [ ] PWA support
- [ ] Cloudinary media upload
- [ ] AI features (Phase 5)

## License

MIT
