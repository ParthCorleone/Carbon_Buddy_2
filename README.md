# Carbon Buddy

Carbon Buddy is a full-stack web application built with [Next.js](https://nextjs.org), [Prisma ORM](https://www.prisma.io/), and PostgreSQL/SQLite. It helps users track, analyze, and reduce their daily carbon footprint through personalized dashboards, data visualizations, and actionable insights.

## Features

- **User Authentication:** Secure registration and login with JWT-based sessions.
- **Daily Emissions Tracking:** Log daily activities (transport, energy, food, digital) and calculate carbon emissions.
- **Dashboard:** Visualize your progress, streaks, and emission breakdowns.
- **Auto Backfill:** Automatically fills missing days with averaged data for accurate streaks and trends.
- **Streaks & Achievements:** Encourages eco-friendly habits with streak tracking and fun plant icons.
- **Responsive UI:** Modern, mobile-friendly interface using Next.js App Router and [Geist font](https://vercel.com/font).

## Tech Stack

- **Frontend:** Next.js 13+ (App Router), React, TypeScript
- **Backend:** Next.js API routes, Prisma ORM
- **Database:** PostgreSQL (production) or SQLite (development)
- **Authentication:** JWT, HTTP-only cookies
- **Styling:** CSS Modules, [Geist font](https://vercel.com/font)

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-username/carbon-buddy.git
cd carbon-buddy
```

### 2. Install dependencies

```bash
npm install
# or
yarn install
```

### 3. Configure environment variables

Create a `.env` file in the root directory:

```env
DATABASE_URL="file:./dev.db" # For SQLite (development)
# or
# DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE" # For PostgreSQL (production)
JWT_SECRET="your-very-secret-key"
```

### 4. Set up the database

```bash
npx prisma migrate dev --name init
```

### 5. Run the development server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
prisma/               # Prisma schema and migrations
src/
  app/                # Next.js app directory (pages, API routes, hooks, utils)
  lib/                # Shared libraries (Prisma client, utils)
.env                  # Environment variables
```

## Deployment

The easiest way to deploy is on [Vercel](https://vercel.com/):

- Push your code to GitHub.
- Connect your repo on Vercel.
- Set your `DATABASE_URL` and `JWT_SECRET` in Vercel dashboard.
- Deploy!

See [Next.js deployment docs](https://nextjs.org/docs/app/building-your-application/deploying) for more options.

Made with 🌱 by the Carbon Buddy team.
