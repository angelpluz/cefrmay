# GPT Project Handoff: Phetchabun Adventure

Updated: 2026-07-03

This file is written for another GPT or developer who needs to understand this project quickly before making changes. It summarizes what the project does, what has already been implemented, where important code lives, how scoring works, and what to be careful about.

## 1. Short Summary

`cefrmay` is a Next.js web game for an English-learning/research activity. Players enter a `Player nickname` and `Participant code`, then play stage-based adventure questions set around Phetchabun locations. The system stores player progress, total XP, stage results, correct/wrong counts, and per-question answer records so the admin can inspect research data from `/admin`.

The frontend is in this repository:

```text
C:\cerfmay\cefrmay
```

The backend API is a separate local project:

```text
C:\databaseauth\server
```

The frontend does not connect to MySQL directly. It calls backend API routes only.

## 2. Tech Stack

- Next.js `16.2.0` App Router
- React `19.2.4`
- TypeScript
- Tailwind CSS v4
- Custom PWA service worker in `public/sw.js`
- Backend API: Node.js/Express project in `C:\databaseauth\server`
- Database: MySQL, accessed only by the backend

Important project rule from `AGENTS.md`:

```text
This version has breaking changes. Read relevant Next.js docs from node_modules/next/dist/docs/ before writing Next.js code.
```

## 3. Current User-Facing Flow

1. Player opens `/`.
2. Server checks current player session.
3. If no player session exists, `PlayerAccessScreen` asks for:
   - `Player nickname`
   - `Participant code`
4. Frontend posts to `POST /api/player-session`.
5. Next.js route calls backend `POST /api/v1/game/player-session`.
6. Backend creates or reuses a player by participant code and returns a generated UID.
7. Frontend sets signed cookie `phet_player_session`.
8. Player starts or continues the game.
9. Progress is saved locally and synced to backend.
10. When a stage ends, frontend posts stage result and answer records.
11. Admin opens `/admin` to inspect participants, stages, attempts, correct/wrong counts, XP, stars, and per-question answers.

## 4. Main Files

```text
app/
  page.tsx
    Server entry point for the player game.

  admin/
    page.tsx
      Admin dashboard UI, filters, player report, stage report, answer record display.
    actions.ts
      Admin login/logout server actions.
    dashboard-utils.ts
      Score filters, date formatting, chart helpers, stage analytics.

  api/
    player-session/route.ts
      Creates/deletes player session cookie and calls backend player-session API.
    player-progress/route.ts
      Validates and saves player progress through backend.
    stage-results/route.ts
      Validates and saves stage result, correct/wrong count, and answer records.

components/
  PlayerAccessScreen.tsx
    Player nickname / Participant code form.
  GameApp.tsx
    Main client state machine: start, stage select, play, result.
  GameScene.tsx
    Renders a scene, choices, scoring completion summary, and answer submission.
  StageSelectScreen.tsx
    Stage selection UI.
  ResultScreen.tsx
    Stage completion screen.
  GameHUD.tsx, ChoiceBox.tsx, CharacterBox.tsx, FeedbackOverlay.tsx
    Core gameplay UI pieces.
  PWARegistrar.tsx, PWAInstallPrompt.tsx, AssetPreloadScreen.tsx
    PWA and asset-loading support.

data/
  stages.ts
    Single switchboard that decides which question set is active.
  stage1_advanced.json
  stage2_advanced.json
  stage3_advanced.json
  stage4_advanced.json
    Current active advanced question set.
  stage1.json - stage4.json
    Older/original question set kept as reference.

lib/
  backend-api.ts
    Server-only adapter for backend API calls.
  gameEngine.ts
    Game data types, choice result, seeded shuffle, stage max XP, next scene.
  gameSave.ts
    LocalStorage save/load.
  research.ts
    Maps backend dashboard/player data into frontend-friendly objects.
  research-contract.ts
    Shared data contracts for player progress and stage results.
  session.ts
    Signed cookie sessions for player and admin.
  useGameSession.ts
    Client hook for scene state, XP, feedback, answer records, audio.
```

## 5. Active Stage Data

The game currently uses the advanced JSON files. This is controlled only in `data/stages.ts`:

```ts
import stage1Data from "@/data/stage1_advanced.json";
import stage2Data from "@/data/stage2_advanced.json";
import stage3Data from "@/data/stage3_advanced.json";
import stage4Data from "@/data/stage4_advanced.json";
```

Current stage mapping:

| Stage ID | File | Title | Main Focus |
| --- | --- | --- | --- |
| `stage-1` | `data/stage1_advanced.json` | Temple Guide Adventure | etiquette / respectful tourism |
| `stage-2` | `data/stage2_advanced.json` | Si Thep Historical Park | heritage / reading |
| `stage-3` | `data/stage3_advanced.json` | Phu Thap Boek Market | speaking / vocabulary / bargaining |
| `stage-4` | `data/stage4_advanced.json` | Lom Sak Walking Street | writing / grammar |

If another GPT needs to swap question sets, edit `data/stages.ts`, not the game components.

## 6. Question JSON Shape

Each stage JSON is loaded as `GameData` from `lib/gameEngine.ts`.

Core shape:

```ts
type GameData = {
  id: string;
  title: string;
  stage?: string;
  entrySceneId: string;
  totalScenes?: number;
  backgroundImage?: string;
  character: {
    avatar: string;
    avatarImage?: string;
    name: string;
    role: string;
  };
  scenes: GameSceneData[];
};
```

Each scene has:

```ts
type GameSceneData = {
  sceneId: string;
  id: number;
  type?: string;
  difficulty?: string;
  location: string;
  context: string;
  sceneImage?: string;
  story: {
    title: string;
    text: string;
  };
  dialogue: {
    speaker: string;
    mood: string;
    text: string;
  };
  question: string;
  choices: GameChoice[];
};
```

Each choice has:

```ts
type GameChoice = {
  text: string;
  correct: boolean;
  xp: number;
  nextSceneId?: string | null;
  feedback: {
    status: "correct" | "wrong";
    reaction: string;
  };
};
```

Rules to preserve:

- `entrySceneId` must point to a real `sceneId`.
- Every scene should have exactly one correct choice.
- Correct choices should have positive XP.
- Wrong choices can have `xp`, but the game awards `0` for wrong answers.
- `nextSceneId` must point to another scene or be `null` to end the stage.
- Image paths must exist under `public/`.

## 7. Scoring Logic

Scoring is split across:

- `lib/gameEngine.ts`
- `lib/useGameSession.ts`
- `components/GameScene.tsx`
- `components/GameApp.tsx`

When a player selects a choice:

1. `useGameSession.handleChoiceSelect()` calls `getChoiceResult(choice)`.
2. `getChoiceResult()` returns:
   - `isCorrect`
   - feedback text
   - feedback status
   - `xpAwarded`
3. If the answer is correct, `xpAwarded = choice.xp`.
4. If the answer is wrong, `xpAwarded = 0`.
5. `answerRecords` receives one record for that selected answer.
6. The game moves to the next scene after `FEEDBACK_DELAY_MS = 1200`.

Important distinction:

- `totalXp` is the player's cumulative XP across progress.
- `stageXp` is the XP gained during the current stage attempt only.
- `correctCount` and `incorrectCount` are calculated from the current stage attempt's `answerRecords`.

Stage completion in `GameScene.tsx`:

```ts
const correctCount = answerRecords.filter((record) => record.isCorrect).length;
const incorrectCount = answerRecords.length - correctCount;
const stageXp = xp - stageStartXp;
const maxXp = getStageMaxXp(stageData);
const ratio = maxXp === 0 ? 0 : stageXp / maxXp;
const stars = ratio >= 0.95 ? 3 : ratio >= 0.55 ? 2 : 1;
```

Star rule:

| Ratio of `stageXp / maxStageXp` | Stars |
| --- | --- |
| `>= 0.95` | 3 |
| `>= 0.55` | 2 |
| `< 0.55` | 1 |

## 8. Answer Records

Each selected answer creates one `StageAnswerRecordInput`:

```ts
type StageAnswerRecordInput = {
  answeredAt: string;
  correctAnswer: string;
  isCorrect: boolean;
  question: string;
  sceneId: string;
  selectedAnswer: string;
  xpAwarded: number;
};
```

This is the feature added to answer the research question:

> For each participant, each stage, how many questions did they answer correctly or incorrectly, and which questions were wrong?

Admin can now inspect this through `/admin`, including a per-player and per-stage summary.

## 9. Progress Save Model

`GameApp.tsx` saves progress in two places:

1. Browser localStorage through `lib/gameSave.ts`
2. Backend through `POST /api/player-progress`

LocalStorage key:

```ts
GAME_SAVE_KEY = "phetchabun-adventure-save-v1";
```

Progress shape:

```ts
type GameProgressInput = {
  completedStageIds: string[];
  currentSceneId: string | null;
  currentStageId: string;
  unlockedStageIds: string[];
  xp: number;
};
```

Local save is intentionally kept even if network sync fails.

## 10. Frontend API Routes

### `POST /api/player-session`

File: `app/api/player-session/route.ts`

Input:

```json
{
  "username": "Player nickname",
  "phone": "Participant code"
}
```

The field is still named `phone` internally for backward compatibility, but UI text now says `Participant code`.

Behavior:

- Calls backend `POST /api/v1/game/player-session`.
- Backend creates or reuses player by participant code.
- Sets signed cookie with `playerId` and `uid`.

### `DELETE /api/player-session`

Clears player session cookie. Used by "switch player".

### `POST /api/player-progress`

File: `app/api/player-progress/route.ts`

Validates the current player session and writes current progress to backend.

### `POST /api/stage-results`

File: `app/api/stage-results/route.ts`

Validates:

- stage id/label/title
- `stageXp`
- `stars`
- `totalXp`
- optional `answerRecords`
- optional `correctCount`
- optional `incorrectCount`

If counts are missing, it computes them from `answerRecords`.

## 11. Backend API

Backend project path:

```text
C:\databaseauth\server
```

Relevant backend files:

```text
C:\databaseauth\server\schema.js
C:\databaseauth\server\routes\api-v1.js
```

Relevant routes:

```text
POST /api/v1/game/player-session
GET  /api/v1/game/player-session/:uid
POST /api/v1/game/progress
POST /api/v1/game/results
GET  /api/v1/game/dashboard
```

Auth model:

- Internal game writes use `X-API-Key`.
- Admin dashboard uses `Authorization: Bearer <accessToken>`.
- Admin logs in through `POST /api/v1/auth/login`.

## 12. Backend Database Tables

These are created or migrated by `C:\databaseauth\server\schema.js`.

### `game_players`

Stores player identity:

- `id`
- `uid`
- `username`
- `phone`
- `created_at`
- `updated_at`
- `last_active_at`

Note: `phone` currently stores the participant code, not necessarily a real phone number.

### `game_progress`

One row per player:

- `player_id`
- `current_stage_id`
- `current_scene_id`
- `unlocked_stage_ids` JSON
- `completed_stage_ids` JSON
- `xp`
- timestamps

### `game_stage_results`

One row per completed stage attempt:

- `player_id`
- `stage_id`
- `stage_label`
- `stage_title`
- `stars`
- `stage_xp`
- `total_xp`
- `correct_count`
- `incorrect_count`
- `answer_records` JSON
- `completed_at`

This table is the key research record for answering "this participant did this stage and got X correct / Y wrong".

## 13. Admin Dashboard

File: `app/admin/page.tsx`

Current dashboard supports:

- Admin login/logout.
- Search by nickname, participant code, UID, stage label/title.
- Filter by participant.
- Filter by stage.
- Filter by score range.
- Summary metrics.
- Stage analytics.
- Player/stage rows.
- Per-player report view.
- Per-attempt answer record details.

The "Participant" dropdown is important. It lets the admin focus on one participant and see how many stages they played, how many attempts, and correct/wrong counts per stage.

The answer record details render via `AnswerRecordsDetails` in `app/admin/page.tsx`. Old attempts from before answer-record tracking may show:

```text
No answer record saved for this older attempt.
```

That is expected for historical data.

## 14. What Was Recently Changed

Recent commits from `git log`:

```text
9c39666 Add project documentation
2c9e0b5 Polish advanced stage grammar
696756c Use advanced stage question set
9e4aaf8 Add participant filter to admin report
f33a31b Add player stage answer summary
27625ea Track answer records in stage results
608b73b Update player access labels
5f81017 Update player access form label to Student_ID
```

Meaning of the important changes:

- Player access labels were changed from username/phone style to:
  - `Player nickname`
  - `Participant code`
- Advanced question files were added and are now active.
- Advanced question grammar was reviewed and polished.
- Stage result submission now includes:
  - `answerRecords`
  - `correctCount`
  - `incorrectCount`
- Backend schema/API supports those new fields.
- Admin dashboard now shows participant-level and stage-level answer summaries.
- `PROJECT_DOCUMENTATION.md` was added as a broader Thai project document.

## 15. Environment Variables

Example file: `.env.example`

```env
BACKEND_API_BASE_URL="https://api.alprasoft-corp.com/api/v1"
BACKEND_API_KEY="replace-with-backend-api-key"
APP_SESSION_SECRET="replace-with-a-long-random-session-secret"
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="replace-with-backend-admin-password"
```

Runtime defaults in `lib/backend-api.ts`:

- Development backend fallback: `http://127.0.0.1:4272/api/v1`
- Production backend fallback: `https://api.alprasoft-corp.com/api/v1`

Do not commit real secrets.

## 16. Local Development

Start backend first:

```powershell
cd C:\databaseauth\server
npm start
```

Start frontend:

```powershell
cd C:\cerfmay\cefrmay
npm run dev
```

Open:

```text
http://localhost:3000
```

If port `3000` is already used, run preview/dev on another port.

## 17. Verification Commands

For documentation-only changes:

```powershell
git status --short --branch
rg -n "replace-with|your-backend-api-key" *.md
```

For app changes:

```powershell
npm run lint
npm run build
```

If changing JSON question files, also manually verify:

- JSON parses.
- each stage has valid `entrySceneId`.
- every `nextSceneId` points to an existing scene or `null`.
- each scene has one correct choice.
- referenced image files exist in `public/`.

## 18. Deployment Notes

Frontend:

- Hosted through Vercel or any Next-compatible host.
- Must set backend/API/session/admin env vars in production.

Backend:

- Separate Express/MySQL API.
- Must run schema migration from `schema.js` or start server flow that calls it.
- Must expose `https://api.alprasoft-corp.com/api/v1` or set `BACKEND_API_BASE_URL` accordingly.

Important:

- The frontend should never connect directly to MySQL.
- Do not duplicate backend DB logic inside Next.js routes.

## 19. Known Dirty File

The working tree has had this unrelated modified file:

```text
.tmp-backend-restart-out.log
```

Do not stage or commit it unless the user explicitly asks. It is runtime/log noise.

## 20. Common Pitfalls

### Total XP looks like it is "always stateful"

That is expected. `totalXp` is cumulative player progress. To inspect each attempt, use:

- `stageXp`
- `correctCount`
- `incorrectCount`
- `answerRecords`
- `completedAt`

### Older records have no answer details

Expected. Attempts before the answer-record feature only have older score fields.

### Participant code is stored as `phone`

The database/backend field is still named `phone` to avoid a larger migration. UI now labels it as `Participant code`.

### Wrong answer XP

Even if a wrong choice has an `xp` value in JSON, `getChoiceResult()` awards `0` because it checks `choice.correct`.

### Replaying a stage

A replay creates another stage result row when completed. Reports are attempt-based, not "one row per stage forever".

### Editing Next.js code

Read the local Next.js docs from `node_modules/next/dist/docs/` first because this repo uses Next.js `16.2.0`.

## 21. Recommended Next Improvements

If another GPT continues the project, likely useful next tasks are:

- Add automated stage JSON validation script.
- Rename backend field `phone` to `participant_code` with a careful migration, or keep compatibility aliases.
- Add CSV export for admin research data.
- Add explicit attempt number per player/stage in admin report.
- Add tests for `stage-results` validation and dashboard analytics.
- Add a "latest attempt vs all attempts" toggle in `/admin`.

## 22. Best Starting Points For Another GPT

Read these in order:

1. `GPT_PROJECT_HANDOFF.md`
2. `PROJECT_DOCUMENTATION.md`
3. `data/stages.ts`
4. `lib/research-contract.ts`
5. `components/GameApp.tsx`
6. `lib/useGameSession.ts`
7. `components/GameScene.tsx`
8. `app/admin/page.tsx`
9. `app/api/stage-results/route.ts`
10. `lib/backend-api.ts`

If the task touches database/API behavior, also inspect:

1. `C:\databaseauth\server\schema.js`
2. `C:\databaseauth\server\routes\api-v1.js`
