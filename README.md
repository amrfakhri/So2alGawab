# So2alGawab (سؤال وجواب)

A real-time two-team trivia game built with React Native, Expo, and Supabase. Questions and categories are fetched live from a Supabase backend, supporting both multiple-choice and presenter-judged answer modes.

---

## Features

- Two-team competitive play (Team A vs Team B)
- MCQ and presenter-judged question modes
- Per-team lifelines: Call a Friend, Discard Question, Answer Reward
- Live 20-second countdown timer per question
- Subcategory selection before each match
- Score tracking across rounds
- Results summary screen
- Supabase-powered content (categories, subcategories, questions, media)
- Arabic UI with RTL support

---

## Screens Overview

| Screen | Description |
|--------|-------------|
| **Game Setup** | Team name entry and subcategory selection |
| **Question** | Active question with timer, lifelines, and answer options |
| **Feedback** | Round result (correct / wrong / timeout / skipped) |
| **Results** | Final scores and match summary |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React Native 0.81 + Expo 54 |
| Language | TypeScript 5.6 |
| Navigation | React Navigation 6 (native stack) |
| State | Zustand 5 |
| Server state | TanStack React Query 5 |
| Backend | Supabase (PostgreSQL + Storage) |
| Animations | React Native Reanimated 4 |
| Styling | React Native StyleSheet + Expo Linear Gradient |

---

## Prerequisites

- Node.js 18+
- Expo CLI: `npm install -g expo-cli` (or use `npx expo`)
- A Supabase project with the required schema (see Environment Variables)

---

## Installation

```bash
git clone https://github.com/amrfakhri/So2alGawab.git
cd So2alGawab
npm install
```

---

## Environment Variables

Copy the example file and fill in your Supabase credentials:

```bash
cp .env.example .env
```

Edit `.env`:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

You can find these values in your Supabase project under **Settings → API**.

> The anon key is a publishable client key — it is safe to include in the app bundle. Supabase security relies on Row Level Security (RLS) policies, not key secrecy.

---

## Running Locally

```bash
# Start the Expo dev server
npx expo start

# Run on iOS simulator
npx expo start --ios

# Run on Android emulator
npx expo start --android

# Run in the browser (web)
npx expo start --web
```

---

## Web Support

The project includes `react-native-web` for browser-based play:

```bash
npx expo start --web
```

---

## Android Build (EAS)

```bash
# Install EAS CLI
npm install -g eas-cli

# Log in to Expo
eas login

# Build a preview APK
eas build --platform android --profile preview

# Build for production
eas build --platform android --profile production
```

---

## Project Structure

```
So2alGawab/
├── App.tsx                        # Root component
├── index.js                       # Expo entry point
├── app.json                       # Expo config
├── eas.json                       # EAS Build config
├── babel.config.js
├── tsconfig.json
├── .env.example                   # Environment variable template
└── src/
    ├── navigation/
    │   └── RootNavigator.tsx      # Stack navigator
    ├── features/
    │   ├── setup/
    │   │   ├── components/        # CategoryPicker, SubcategoryGrid, TeamNameFields
    │   │   └── screens/           # GameSetupScreen
    │   ├── game/
    │   │   ├── components/        # QuestionCard, AnswerOption, TimerBar, LifelineBar, ...
    │   │   ├── engine/            # Pure game logic (gameEngine.ts, scoring.ts)
    │   │   ├── screens/           # QuestionScreen, FeedbackScreen
    │   │   ├── store/             # useGameStore (Zustand)
    │   │   └── types/             # game.ts (shared types)
    │   └── results/
    │       └── screens/           # ResultsScreen
    ├── services/
    │   └── supabase/              # supabaseClient, categoryService, questionService, gameService
    └── shared/
        ├── components/            # PrimaryButton, Screen
        ├── theme/                 # colors.ts
        └── utils/                 # shuffle.ts
```

---

## Available Scripts

```bash
npm start          # Start Expo dev server
npm run android    # Run on Android
npm run ios        # Run on iOS
npm run lint       # ESLint
npm run typecheck  # TypeScript check (tsc --noEmit)
```

---

## After Cloning — Setup Checklist

1. `npm install`
2. Copy `.env.example` → `.env` and add your Supabase credentials
3. Ensure your Supabase project has the required tables: `categories`, `subcategories`, `questions`
4. Run `npx expo start`
