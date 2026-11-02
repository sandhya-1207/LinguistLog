# LinguistLog — Personal Language Learning Progress Tracker

A sophisticated, Pinterest-inspired personal language learning progress tracker built with **React**, **TypeScript**, **Vite**, **Tailwind CSS**, and **Supabase**.

> **Note**: This application is strictly a **progress tracker and analytics dashboard**, not a language learning platform or teaching tool. It is designed to manually record focused study sessions, track vocabulary and grammar mastery, monitor CEFR skill milestones, and visualize consistency over time.

---

## 🎨 Design Aesthetics

- **Light Mode — Warm Mocha Aesthetic**: Warm cream backgrounds (`#F5EFE7`), latte surfaces (`#FFF9F2`), mocha brown brand accents (`#755744`), espresso typography (`#352820`), soft taupe borders (`#E4D7CC`).
- **Dark Mode — Forest Green Aesthetic**: Deep forest green backgrounds (`#17251D`), moss surfaces (`#203128`), forest green primaries (`#3F6650`), sage accents (`#A7BDA9`), pale green text (`#E8F0E8`).
- **Typography & Details**: Playfair Display editorial headings, Plus Jakarta Sans body copy, rounded cards, progress rings, responsive charts, and no cluttered gradients.

---

## 🚀 Key Features

1. **Supabase Authentication**:
   - Email/password sign-up and sign-in.
   - Google OAuth sign-in.
   - Password reset request & password update flow.
   - Session persistence and protected routes.
   - **Local Workspace & Offline Fallback**: Works immediately out-of-the-box with full offline local storage and preloaded demo data if Supabase credentials are not yet configured.

2. **Personalized Onboarding**:
   - Focus language setup (single target language per user).
   - Baseline CEFR level (A1, A2, B1, B2, C1, C2) and target CEFR level.
   - Daily study time, vocabulary, and grammar targets.

3. **Dashboard & Analytics**:
   - Personalized welcome greeting and active streak indicator.
   - Today's study time progress ring with target completion percentages.
   - Statistics cards: total learning hours, sessions, vocabulary count, completed grammar topics, current streak, goal success rate.
   - Recharts visual suite:
     - Cumulative learning progress line chart.
     - Weekly study time bar chart.
     - Four skills radar chart (Reading, Listening, Speaking, Writing).
     - Vocabulary & grammar status donut charts.
     - 12-week learning consistency heatmap matrix.
   - Real personalized learning insights generated from saved records.
   - Curated daily motivational quotes from polyglots and philosophers.

4. **Manual Study Session Logging**:
   - Strictly manual recording (no automatic stopwatch or distracting timers).
   - Skill focus (Reading, Listening, Speaking, Writing, Vocabulary, Grammar).
   - Preset or custom activity names.
   - Automatic duration calculation from start and end times, or direct hours/minutes entry.
   - Search, filter by skill, date, and activity, with ascending/descending date sorting.

5. **Vocabulary & Grammar Trackers**:
   - Custom categories, difficulty tags (Easy, Medium, Hard), and learning statuses.
   - Real-time auto-calculation of total counts, learning counts, and mastery rates.

6. **Goals & Milestones System**:
   - Daily, weekly, monthly, and custom date range goals.
   - Automatic progress calculation against actual study records.
   - Historical goal achievement rate breakdown.

7. **Habit Streak & Rest Days**:
   - Streak calculation across time zones.
   - Planned rest days pause streak without breaking it.

8. **Monthly Study Calendar**:
   - Month-by-month calendar view with goal completion, rest day, and study badges.
   - Interactive date click inspector to view all sessions and vocabulary for any date.

9. **Data Export & Reporting**:
   - Downloadable formatted PDF Progress Dossiers via `jspdf` and `jspdf-autotable`.
   - Excel-compatible CSV exports for study sessions, vocabulary, grammar topics, and goals.

---

## 🛠️ Installation & Quickstart

### Prerequisites
- Node.js 18+ (tested on Node 20 & 24)
- npm or pnpm

### 1. Clone & Install Dependencies
```bash
git clone <repository-url>
cd tracker
npm install
```

### 2. Configure Environment Variables (Optional)
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Update `.env` with your Supabase credentials:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

> **Instant Demo**: If you do not configure Supabase right away, the app runs in **Local Workspace Mode** using localStorage, complete with preloaded demo data so you can test all features immediately!

### 3. Start the Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🗄️ Supabase Database & Row Level Security (RLS)

All SQL schema definitions, indexes, and Row Level Security policies are located in:
- `supabase/schema.sql`
- `supabase/migrations/20261102_initial_schema.sql`

### How to Apply Migrations to Supabase:
1. Log into your [Supabase Dashboard](https://supabase.com/dashboard).
2. Open your project and navigate to the **SQL Editor**.
3. Click **New Query**, copy the contents of `supabase/schema.sql`, and click **Run**.
4. All 10 tables will be created with strict RLS policies ensuring each user only accesses their own data:
   - `profiles`
   - `study_sessions`
   - `vocabulary`
   - `grammar_topics`
   - `skill_progress`
   - `goals`
   - `goal_progress`
   - `planned_activities`
   - `rest_days`
   - `settings`

---

## 🔐 Google OAuth Configuration in Supabase

To enable Google Sign-In with Supabase Auth:
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create an OAuth 2.0 Client ID under **APIs & Services > Credentials**.
3. Add your Supabase auth callback URL to Authorized redirect URIs:
   ```
   https://<your-project-ref>.supabase.co/auth/v1/callback
   ```
4. Copy the Client ID and Client Secret into your Supabase Dashboard under **Authentication > Providers > Google**.
5. Enable the provider.

---

## 🧪 Available Scripts

- `npm run dev`: Starts the Vite development server with hot module replacement.
- `npm run build`: Compiles TypeScript and builds production bundles into `dist/`.
- `npm run preview`: Previews the production build locally.

---

## 📄 License
MIT
