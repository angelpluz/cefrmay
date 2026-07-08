# ข้อมูลโปรเจกต์ Phetchabun Adventure

อัปเดตล่าสุด: 2026-07-08

เอกสารนี้สรุปข้อมูลทั้งโปรเจกต์ `cefrmay` สำหรับคนหรือ GPT ตัวอื่นที่ต้องอ่านต่อก่อนแก้โค้ด จุดประสงค์คือให้เข้าใจว่าโปรเจกต์นี้ทำอะไร โครงสร้างอยู่ตรงไหน ระบบบันทึกข้อมูลอย่างไร และถ้าจะพัฒนาต่อต้องระวังอะไรบ้าง

## 1. ภาพรวม

`cefrmay` เป็นเว็บแอปเกมภาษาอังกฤษแนว adventure สำหรับกิจกรรมการเรียนรู้/งานวิจัย ผู้เล่นเข้าเกมด้วย `Player nickname` และ `Participant code` จากนั้นเลือกด่าน เล่นโจทย์ภาษาอังกฤษตามสถานที่ในจังหวัดเพชรบูรณ์ ระบบจะบันทึกข้อมูลการเล่น เช่น progress, XP, stage result, จำนวนข้อถูก/ผิด และ answer records รายข้อ

ผู้ดูแลสามารถเข้า `/admin` เพื่อดูรายงานของผู้เล่นแต่ละคน แต่ละ stage และดูได้ว่าผู้เล่นตอบข้อไหนถูกหรือผิด

## 2. ตำแหน่งโปรเจกต์

Frontend repository:

```text
C:\cerfmay\cefrmay
```

Backend API repository แยก:

```text
C:\databaseauth\server
```

หลักการสำคัญ:

- Frontend ไม่ต่อ MySQL โดยตรง
- Frontend เรียก Next.js API routes ของตัวเอง
- Next.js API routes เรียก backend API
- Backend API เป็นคนจัดการ MySQL, UID, player progress, dashboard data

## 3. Tech Stack

Frontend:

- Next.js `16.2.0`
- React `19.2.4`
- TypeScript
- Tailwind CSS v4
- App Router
- Custom PWA service worker ที่ `public/sw.js`

Backend:

- Node.js / Express
- MySQL
- JWT สำหรับ admin dashboard
- API key สำหรับ internal game write endpoints

Package scripts ใน frontend:

```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start -p 3000",
  "lint": "eslint"
}
```

## 4. บทบาทผู้ใช้

### Player

ผู้เล่นกรอก:

- `Player nickname`
- `Participant code`

ระบบจะสร้างหรือ reuse player record จาก `Participant code` แล้วให้ผู้เล่นเล่นเกมต่อได้ ถ้าผู้เล่นกลับมาใช้ participant code เดิม ระบบจะผูกกับ record เดิม

### Admin

ผู้ดูแลเข้า:

```text
/admin
```

Admin สามารถดู:

- จำนวนผู้เล่น
- progress ของแต่ละคน
- stage attempts
- score / XP
- stars
- correct / incorrect count
- answer records รายข้อ
- filter ตาม participant, stage, score range และ search text

## 5. โครงสร้างไฟล์หลัก

```text
app/
  page.tsx
  admin/
    page.tsx
    actions.ts
    dashboard-utils.ts
  api/
    player-session/route.ts
    player-progress/route.ts
    stage-results/route.ts

components/
  GameApp.tsx
  GameScene.tsx
  PlayerAccessScreen.tsx
  StageSelectScreen.tsx
  ResultScreen.tsx
  GameHUD.tsx
  ChoiceBox.tsx
  CharacterBox.tsx
  FeedbackOverlay.tsx
  AssetPreloadScreen.tsx
  PWARegistrar.tsx
  PWAInstallPrompt.tsx

data/
  stages.ts
  stage1_advanced.json
  stage2_advanced.json
  stage3_advanced.json
  stage4_advanced.json
  stage1.json
  stage2.json
  stage3.json
  stage4.json

lib/
  backend-api.ts
  gameEngine.ts
  gameSave.ts
  research.ts
  research-contract.ts
  session.ts
  useGameSession.ts

public/
  sw.js
  offline.html
  app-icon.svg
  *.jpg / *.svg
```

## 6. ไฟล์ที่ควรอ่านก่อนแก้งาน

ถ้าเป็นงานทั่วไป:

1. `PROJECT_INFO.md`
2. `GPT_PROJECT_HANDOFF.md`
3. `PROJECT_DOCUMENTATION.md`
4. `data/stages.ts`
5. `lib/research-contract.ts`
6. `components/GameApp.tsx`
7. `components/GameScene.tsx`
8. `lib/useGameSession.ts`
9. `app/admin/page.tsx`
10. `lib/backend-api.ts`

ถ้าเกี่ยวกับ backend หรือ database:

1. `C:\databaseauth\server\schema.js`
2. `C:\databaseauth\server\routes\api-v1.js`

## 7. Flow ฝั่ง Player

1. Player เปิด `/`
2. `app/page.tsx` ตรวจ session ปัจจุบัน
3. ถ้าไม่มี session จะแสดง `PlayerAccessScreen`
4. Player กรอก nickname และ participant code
5. Client ส่ง `POST /api/player-session`
6. Next.js route เรียก backend `POST /api/v1/game/player-session`
7. Backend สร้างหรือ reuse player จาก participant code
8. Backend คืน player record และ progress ถ้ามี
9. Next.js ตั้ง signed cookie `phet_player_session`
10. `GameApp` โหลด local save หรือ backend progress
11. Player เลือก stage และตอบคำถาม
12. ระหว่างเล่น sync progress ไป `POST /api/player-progress`
13. เมื่อจบ stage ส่งผลไป `POST /api/stage-results`
14. Backend บันทึกลง `game_stage_results`

## 8. Flow ฝั่ง Admin

1. Admin เปิด `/admin`
2. ถ้ายังไม่มี session จะแสดง login form
3. `actions.ts` login กับ backend `POST /api/v1/auth/login`
4. Backend คืน access token
5. Next.js ตั้ง admin session cookie
6. `app/admin/page.tsx` เรียก `getResearchDashboardData()`
7. `lib/research.ts` เรียก backend dashboard API
8. หน้า admin render dashboard, filter, report และ answer details

## 9. Stage Data ปัจจุบัน

ตอนนี้เกมใช้โจทย์ชุด advanced ทั้ง 4 stage โดยกำหนดใน `data/stages.ts`

```ts
import stage1Data from "@/data/stage1_advanced.json";
import stage2Data from "@/data/stage2_advanced.json";
import stage3Data from "@/data/stage3_advanced.json";
import stage4Data from "@/data/stage4_advanced.json";
```

ตาราง stage:

| Stage ID | File | หัวข้อ |
| --- | --- | --- |
| `stage-1` | `stage1_advanced.json` | Temple Guide Adventure |
| `stage-2` | `stage2_advanced.json` | Si Thep Historical Park |
| `stage-3` | `stage3_advanced.json` | Phu Thap Boek Market |
| `stage-4` | `stage4_advanced.json` | Lom Sak Walking Street |

ไฟล์ `stage1.json` ถึง `stage4.json` ยังอยู่ใน repo เป็นชุดเดิม/reference แต่ไม่ได้ถูกใช้ใน app ปัจจุบัน

## 10. โครงสร้างโจทย์

Type หลักอยู่ใน `lib/gameEngine.ts`

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

Scene:

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

Choice:

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

กฎสำคัญของ JSON:

- `entrySceneId` ต้องตรงกับ `sceneId` ที่มีจริง
- แต่ละ scene ควรมีคำตอบถูก 1 ข้อ
- `nextSceneId` ต้องชี้ไป scene ที่มีจริง หรือ `null` เพื่อจบ stage
- รูปที่อ้างถึงต้องมีอยู่ใน `public/`
- Wrong choice อาจมี `xp` ในไฟล์ JSON ได้ แต่ game engine จะให้ `0 XP` ถ้า `correct: false`

## 11. ระบบคะแนน

คะแนนหลักคำนวณจาก:

- `lib/gameEngine.ts`
- `lib/useGameSession.ts`
- `components/GameScene.tsx`
- `components/GameApp.tsx`

เมื่อตอบคำถาม:

- ถ้าถูก: ได้ `choice.xp`
- ถ้าผิด: ได้ `0`
- feedback มาจาก `choice.feedback.reaction`
- ทุกคำตอบถูกบันทึกเข้า `answerRecords`

ฟังก์ชันสำคัญ:

```ts
export function getChoiceResult(choice: GameChoice) {
  return {
    feedback: choice.feedback.reaction,
    isCorrect: choice.correct,
    status: choice.feedback.status,
    xpAwarded: choice.correct ? choice.xp : 0,
  };
}
```

ความหมายของคะแนน:

- `totalXp` คือ XP สะสมของ player
- `stageXp` คือ XP ที่ได้จาก attempt ของ stage รอบนั้น
- `correctCount` คือจำนวนข้อถูกใน attempt นั้น
- `incorrectCount` คือจำนวนข้อผิดใน attempt นั้น

ตอนจบ stage:

```ts
const correctCount = answerRecords.filter((record) => record.isCorrect).length;
const incorrectCount = answerRecords.length - correctCount;
const stageXp = xp - stageStartXp;
const maxXp = getStageMaxXp(stageData);
const ratio = maxXp === 0 ? 0 : stageXp / maxXp;
const stars = ratio >= 0.95 ? 3 : ratio >= 0.55 ? 2 : 1;
```

Star rule:

| Ratio | Stars |
| --- | --- |
| `>= 0.95` | 3 |
| `>= 0.55` | 2 |
| `< 0.55` | 1 |

## 12. Answer Records

Answer records คือข้อมูลรายข้อที่ช่วยตอบคำถามเชิงวิจัยว่า player แต่ละคนทำ stage ไหน ถูกกี่ข้อ ผิดกี่ข้อ และผิดข้อไหน

Type อยู่ที่ `lib/research-contract.ts`

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

การบันทึกเกิดใน `lib/useGameSession.ts` ตอน player เลือกคำตอบ และถูกส่งต่อไป backend ตอน stage complete ผ่าน `POST /api/stage-results`

หมายเหตุ:

- Record เก่าก่อนเพิ่ม feature นี้อาจไม่มี answer records
- ใน admin จะขึ้นข้อความว่าไม่มี record สำหรับ older attempt

## 13. Progress Save

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

Frontend save สองที่:

1. `localStorage`
2. backend API

LocalStorage key:

```ts
GAME_SAVE_KEY = "phetchabun-adventure-save-v1";
```

ถ้า backend sync fail, local save ยังเป็นหลักเพื่อให้ player เล่นต่อได้

## 14. Next.js API Routes

### `POST /api/player-session`

File:

```text
app/api/player-session/route.ts
```

รับ:

```json
{
  "username": "Player nickname",
  "phone": "Participant code"
}
```

หมายเหตุ: internal field ยังชื่อ `phone` เพื่อ backward compatibility แต่ UI แสดงเป็น `Participant code`

### `DELETE /api/player-session`

ลบ player session cookie ใช้ตอน switch player

### `POST /api/player-progress`

File:

```text
app/api/player-progress/route.ts
```

ตรวจ session แล้วส่ง progress ไป backend

### `POST /api/stage-results`

File:

```text
app/api/stage-results/route.ts
```

บันทึก:

- `stageId`
- `stageLabel`
- `stageTitle`
- `stageXp`
- `stars`
- `totalXp`
- `answerRecords`
- `correctCount`
- `incorrectCount`

ถ้าไม่ได้ส่ง correct/incorrect count route จะคำนวณจาก `answerRecords`

## 15. Backend API ที่เกี่ยวข้อง

Backend อยู่ที่:

```text
C:\databaseauth\server
```

Routes สำคัญอยู่ใน:

```text
C:\databaseauth\server\routes\api-v1.js
```

Endpoints:

```text
POST /api/v1/game/player-session
GET  /api/v1/game/player-session/:uid
POST /api/v1/game/progress
POST /api/v1/game/results
GET  /api/v1/game/dashboard
```

Auth:

- game write endpoints ใช้ `X-API-Key`
- admin dashboard ใช้ Bearer token จาก `/auth/login`

## 16. Database Tables

Schema อยู่ใน:

```text
C:\databaseauth\server\schema.js
```

### `game_players`

เก็บข้อมูล player:

- `id`
- `uid`
- `username`
- `phone`
- `created_at`
- `updated_at`
- `last_active_at`

หมายเหตุ: `phone` ในระบบนี้หมายถึง participant code ตาม UI ปัจจุบัน

### `game_progress`

เก็บ progress ล่าสุดของ player:

- `player_id`
- `current_stage_id`
- `current_scene_id`
- `unlocked_stage_ids`
- `completed_stage_ids`
- `xp`
- timestamps

### `game_stage_results`

เก็บผลการเล่น stage แต่ละครั้ง:

- `player_id`
- `stage_id`
- `stage_label`
- `stage_title`
- `stars`
- `stage_xp`
- `total_xp`
- `correct_count`
- `incorrect_count`
- `answer_records`
- `completed_at`

ตารางนี้เป็นข้อมูลหลักสำหรับรายงานว่า player คนหนึ่งทำแต่ละ stage ได้ถูก/ผิดกี่ข้อ

## 17. Environment Variables

ตัวอย่างอยู่ใน `.env.example`

```env
BACKEND_API_BASE_URL="https://api.alprasoft-corp.com/api/v1"
BACKEND_API_KEY="replace-with-backend-api-key"
APP_SESSION_SECRET="replace-with-a-long-random-session-secret"
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="replace-with-backend-admin-password"
```

Fallback:

- Development: `http://127.0.0.1:4272/api/v1`
- Production: `https://api.alprasoft-corp.com/api/v1`

ห้าม commit secret จริงลง repo

## 18. วิธีรัน Local

เริ่ม backend:

```powershell
cd C:\databaseauth\server
npm start
```

เริ่ม frontend:

```powershell
cd C:\cerfmay\cefrmay
npm run dev
```

เปิด:

```text
http://localhost:3000
```

ถ้า port `3000` ถูกใช้อยู่ ให้เปลี่ยน port ตอนรัน dev/preview

## 19. วิธีอัปเดตโจทย์

ถ้าจะแก้โจทย์ปัจจุบัน:

1. แก้ไฟล์ `data/stage*_advanced.json`
2. ตรวจ `sceneId`, `entrySceneId`, `nextSceneId`
3. ตรวจว่ามี correct choice ครบ
4. ตรวจ image path ว่ามีไฟล์จริงใน `public/`
5. รัน lint/build

ถ้าจะสลับกลับไปใช้โจทย์ชุดเดิม:

1. แก้ import ใน `data/stages.ts`
2. เปลี่ยนจาก `stage*_advanced.json` เป็น `stage*.json`
3. รัน verification

## 20. วิธีดูรายงานที่ Admin

เข้า:

```text
/admin
```

ใช้งาน filter:

- `Search`: ค้น nickname, participant code, UID, stage title
- `Participant`: ดูเฉพาะคน
- `Stage`: ดูเฉพาะ stage
- `Score Range`: กรองตามคะแนน

สิ่งที่ดูได้:

- ผู้เล่นคนนี้เล่นกี่ stage
- stage ไหนเล่นกี่ครั้ง
- attempt ล่าสุดได้กี่ XP
- ถูกกี่ข้อ
- ผิดกี่ข้อ
- answer records รายข้อ

## 21. สิ่งที่ทำไปแล้วในโปรเจกต์

จาก commit ล่าสุด ๆ:

- เปลี่ยน label เป็น `Player nickname` และ `Participant code`
- เพิ่มการ track answer records
- เพิ่ม correct/incorrect count ใน stage results
- เพิ่ม player-stage summary ใน admin report
- เพิ่ม participant filter ใน admin dashboard
- เปลี่ยนมาใช้โจทย์ชุด advanced
- polish grammar ของโจทย์ advanced
- เพิ่มเอกสาร `PROJECT_DOCUMENTATION.md`
- เพิ่มเอกสาร `GPT_PROJECT_HANDOFF.md`

## 22. ข้อควรระวัง

- อย่า commit `.tmp-backend-restart-out.log` เพราะเป็น runtime log ที่ dirty อยู่เดิม
- อย่าใส่ secret จริงใน Markdown หรือ source code
- `totalXp` เป็นคะแนนสะสม ไม่ใช่คะแนนของ stage รอบเดียว
- ถ้าต้องดูคะแนนของ stage รอบเดียว ให้ดู `stageXp`
- ถ้าต้องดูถูก/ผิดรายข้อ ให้ดู `answerRecords`
- field `phone` คือ participant code ตาม UI ปัจจุบัน
- records เก่าอาจไม่มี answer records เพราะ feature นี้เพิ่มมาทีหลัง
- Replaying stage จะสร้าง result row ใหม่เมื่อจบ stage
- โปรเจกต์ใช้ Next.js `16.2.0`; ก่อนแก้ Next.js API/convention ให้อ่าน docs ใน `node_modules/next/dist/docs/`

## 23. คำสั่งตรวจสอบก่อนส่งงาน

สำหรับ docs-only:

```powershell
git status --short --branch
rg -n "replace-with|your-backend-api-key" *.md
```

สำหรับ code changes:

```powershell
npm run lint
npm run build
```

สำหรับ JSON stage changes ควรเพิ่ม validation script ในอนาคต แต่ตอนนี้ต้องตรวจด้วย manual review ร่วมกับ lint/build

## 24. เอกสารอื่นใน repo

- `README.md`: วิธีรัน local และ deployment env แบบสั้น
- `PROJECT_DOCUMENTATION.md`: เอกสารโปรเจกต์ภาษาไทยแบบละเอียด
- `GPT_PROJECT_HANDOFF.md`: เอกสาร handoff สำหรับ GPT/ผู้พัฒนาคนถัดไป
- `AGENTS.md`: instruction ของ coding agent
- `CLAUDE.md`: context/instruction สำหรับ Claude

## 25. งานต่อที่แนะนำ

- เพิ่ม script validate stage JSON
- เพิ่ม CSV export สำหรับ admin dashboard
- เพิ่ม attempt number ต่อ player/stage
- เพิ่ม toggle ระหว่าง latest attempt และ all attempts
- เพิ่ม test ให้ `stage-results` route
- เพิ่ม test ให้ dashboard analytics
- พิจารณา migration เปลี่ยน field `phone` เป็น `participant_code` แบบ backward compatible

