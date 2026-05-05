# So2alGawab

An offline React Native + TypeScript MVP built from the recovered APK rules.

## Current Scope

- 2 teams
- 6 selected categories per match
- 36 total questions
- alternating turns
- per-question point values
- correct answer awards full points
- wrong answer or timeout awards 0 points
- 3 lifelines per team
- final winner determined by total score

## Lifeline Assumptions

Because the APK did not expose the full live game logic, the MVP uses simple, consistent trivia patterns:

- `Call a Friend`: reveals a hint for the current question
- `Discard`: skips the current question with 0 points
- `Answer Reward`: doubles the points for the next correct answer by that team

## Navigation Flow

1. `GameSetup`
2. `Question`
3. `Feedback`
4. `Question` or `Results`

## State Flow

- `setup`: team names and categories are configured
- `question`: active team answers under a timer
- `feedback`: result is shown immediately after answer, timeout, or discard
- `finished`: shown after the 36th question

## Folder Notes

- `src/features/game/engine`
  - pure functions only
  - match building, scoring, state transitions
- `src/features/game/store`
  - zustand orchestration
- `src/features/*/screens`
  - UI flow
- `src/data`
  - local JSON for categories and questions

## Ready For Later

- replace local JSON with an API-backed repository
- expand categories and question packs
- add animation polish with Reanimated
- add persistence for unfinished matches

## Not Included

- auth
- backend
- purchases
- network multiplayer
