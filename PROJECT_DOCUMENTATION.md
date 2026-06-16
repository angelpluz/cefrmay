# Phetchabun Adventure Project Documentation

อัปเดตล่าสุด: 2026-06-16

## 1. ภาพรวมโปรเจกต์

`cefrmay` เป็นเว็บแอปเกมภาษาอังกฤษแนว adventure สำหรับผู้เรียน/ผู้เข้าร่วมวิจัย โดยผู้เล่นจะเข้าเกมด้วย `Player nickname` และ `Participant code` จากนั้นเล่นด่านตามสถานที่ท่องเที่ยว/บริบทในจังหวัดเพชรบูรณ์ ระบบจะบันทึก progress, score, จำนวนข้อถูก/ผิด และ answer records รายข้อ เพื่อให้ผู้ดูแลตรวจผลได้จากหน้า `/admin`

โปรเจกต์ frontend อยู่ที่:

```text
C:\cerfmay\cefrmay
```

Backend API แยกอยู่ที่:

```text
C:\databaseauth\server
```

Frontend ไม่ต่อ MySQL โดยตรง แต่เรียก backend API เท่านั้น

## 2. เทคโนโลยีหลัก

- Next.js 16.2.0 App Router
- React 19.2.4
- TypeScript
- Tailwind CSS v4
- PWA service worker แบบ custom ใน `public/sw.js`
- Backend API: Node.js/Express แยกโปรเจกต์
- Database: MySQL ผ่าน backend API

## 3. บทบาทผู้ใช้

### Player

ผู้เล่นเข้า `/` แล้วกรอก:

- `Player nickname`
- `Participant code`

หลังจากเข้าสู่ระบบแล้วจะเห็นเกม, เลือก stage, เล่นโจทย์, ได้ XP, ได้ stars และบันทึก answer records เมื่อจบ stage

### Admin

ผู้ดูแลเข้า `/admin` แล้ว login ด้วย admin username/password ที่ตั้งใน env จากนั้นดูรายงาน:

- participant list
- stage performance
- score distribution
- correct/wrong summary
- player-specific report
- answer records รายข้อ

## 4. โครงสร้างไฟล์สำคัญ

```text
app/
  page.tsx                         หน้าเกมหลัก
  admin/
    page.tsx                       dashboard รายงาน
    actions.ts                     admin login/logout server actions
    dashboard-utils.ts             helper สำหรับ filter/chart/format
  api/
    player-session/route.ts        สร้าง/ลบ player session
    player-progress/route.ts       บันทึก progress
    stage-results/route.ts         บันทึกผล stage และ answer records

components/
  GameApp.tsx                      state หลักของเกม
  GameScene.tsx                    render scene, question, choices
  StageSelectScreen.tsx            เลือกด่าน
  ResultScreen.tsx                 หน้าผลลัพธ์หลังจบด่าน
  PlayerAccessScreen.tsx           ฟอร์มเข้าเกม
  ...

data/
  stages.ts                        loader ของ stage data
  stage1_advanced.json             โจทย์ชุด advanced stage 1
  stage2_advanced.json             โจทย์ชุด advanced stage 2
  stage3_advanced.json             โจทย์ชุด advanced stage 3
  stage4_advanced.json             โจทย์ชุด advanced stage 4
  stage1.json - stage4.json        โจทย์ชุดเดิม เก็บไว้เป็น reference

lib/
  backend-api.ts                   adapter เรียก backend API
  gameEngine.ts                    scoring/helper/next scene
  gameSave.ts                      localStorage progress
  research.ts                      map backend data ให้ frontend/admin
  research-contract.ts             shared types
  session.ts                       signed cookie session
  useGameSession.ts                game session hook

public/
  sw.js                            service worker
  offline.html                     offline fallback
  *.jpg / *.svg                    visual assets
```

## 5. Runtime Flow ฝั่ง Player

1. ผู้เล่นเปิด `/`
2. `app/page.tsx` เรียก `getCurrentPlayerState()`
3. ถ้าไม่มี player session จะแสดง `PlayerAccessScreen`
4. ฟอร์มส่ง `POST /api/player-session`
5. Next route เรียก backend `POST /api/v1/game/player-session`
6. Backend create/update player และคืน `player.id`, `uid`
7. Frontend set signed cookie `phet_player_session`
8. GameApp โหลด progress จาก localStorage หรือ backend
9. ผู้เล่นเลือก stage และตอบคำถาม
10. ระหว่างเล่นจะ sync progress ไปที่ `POST /api/player-progress`
11. เมื่อจบ stage จะส่งผลไปที่ `POST /api/stage-results`
12. Backend บันทึกลง `game_stage_results`

## 6. Stage และโจทย์

ตอนนี้เกมใช้โจทย์ชุด advanced จากไฟล์:

```ts
import stage1Data from "@/data/stage1_advanced.json";
import stage2Data from "@/data/stage2_advanced.json";
import stage3Data from "@/data/stage3_advanced.json";
import stage4Data from "@/data/stage4_advanced.json";
```

ไฟล์ `data/stages.ts` เป็นจุดเดียวที่กำหนดว่า app ใช้ชุดโจทย์ไหน

### Stage ปัจจุบัน

| Stage | File | Title | Focus |
| --- | --- | --- | --- |
| stage-1 | `stage1_advanced.json` | Temple Guide Adventure | etiquette / respectful tourism |
| stage-2 | `stage2_advanced.json` | Si Thep Historical Park | reading / heritage |
| stage-3 | `stage3_advanced.json` | Phu Thap Boek Market | speaking / vocabulary / bargaining |
| stage-4 | `stage4_advanced.json` | Lom Sak Walking Street | writing / grammar |

### JSON Schema โดยย่อ

```json
{
  "id": "stage-1",
  "stage": "Optional stage label",
  "title": "Stage title",
  "entrySceneId": "scene-1",
  "totalScenes": 5,
  "backgroundImage": "/image.jpg",
  "character": {
    "name": "Alex",
    "role": "Tourist",
    "avatar": "emoji",
    "avatarImage": "/alex-avatar.jpg"
  },
  "scenes": [
    {
      "sceneId": "scene-1",
      "id": 1,
      "type": "reading",
      "difficulty": "medium",
      "location": "Location",
      "context": "Context",
      "sceneImage": "/image.jpg",
      "story": {
        "title": "Scene title",
        "text": "Scene story"
      },
      "dialogue": {
        "speaker": "Alex",
        "mood": "emoji",
        "text": "Dialogue"
      },
      "question": "Question text",
      "choices": [
        {
          "text": "Correct answer",
          "correct": true,
          "feedback": {
            "status": "correct",
            "reaction": "Feedback text"
          },
          "xp": 20,
          "nextSceneId": "scene-2"
        }
      ]
    }
  ]
}
```

### กฎสำหรับเพิ่ม/แก้โจทย์

- `entrySceneId` ต้องชี้ไปหา `sceneId` ที่มีจริง
- แต่ละ scene ควรมี correct choice 1 ข้อ
- `nextSceneId` ต้องเป็น scene ที่มีจริง หรือ `null` เพื่อจบ stage
- choice ที่ผิดสามารถตั้งใจให้ grammar ผิดได้ ถ้าเป็นเป้าหมายของโจทย์
- image path ต้องมีไฟล์จริงใน `public/`
- หลังแก้ JSON ควรรัน validation, lint และ build

## 7. ระบบคะแนน

คะแนนคำนวณใน `lib/gameEngine.ts`, `lib/useGameSession.ts`, และ `components/GameScene.tsx`

### เมื่อเลือกคำตอบ

- ถ้าถูก: ได้ XP ตามค่า `choice.xp`
- ถ้าผิด: ได้ `0 XP`
- feedback แสดงจาก `choice.feedback.reaction`
- คำตอบถูก/ผิดถูกบันทึกเข้า `answerRecords`

### Answer Record ที่บันทึกต่อข้อ

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

### เมื่อจบ stage

ระบบส่งผลลัพธ์นี้ไป backend:

```ts
type StageResultInput = {
  answerRecords: StageAnswerRecordInput[];
  correctCount: number;
  incorrectCount: number;
  stageId: string;
  stageLabel: string;
  stageTitle: string;
  stageXp: number;
  stars: number;
  totalXp: number;
};
```

### สูตร Stage XP

```text
stageXp = totalXpAfterStage - xpAtStageStart
```

ระบบ fix ค่า `xpAtStageStart` ตอน stage เริ่ม เพื่อไม่ให้ state ที่เปลี่ยนระหว่างเล่นทำให้ stage XP เพี้ยน

### สูตร Stars

```text
maxXp = ผลรวม XP สูงสุดของ correct choice ในทุก scene ของ stage
ratio = stageXp / maxXp
```

- `3 stars` ถ้า `ratio >= 0.95`
- `2 stars` ถ้า `ratio >= 0.55`
- `1 star` ถ้าต่ำกว่านั้น

## 8. Progress และ Save

GameApp เก็บ progress 2 ที่:

1. localStorage ผ่าน `lib/gameSave.ts`
2. backend ผ่าน `POST /api/player-progress`

ข้อมูล progress:

```ts
type GameProgressInput = {
  completedStageIds: string[];
  currentSceneId: string | null;
  currentStageId: string;
  unlockedStageIds: string[];
  xp: number;
};
```

localStorage ช่วยให้เล่นต่อได้แม้ network write fail ชั่วคราว ส่วน backend ใช้สำหรับ report และ cross-session state

## 9. Admin Dashboard

หน้า `/admin` อยู่ที่ `app/admin/page.tsx`

### Login

- ใช้ `loginAdminAction`
- Next frontend ส่ง username/password ไป backend `/auth/login`
- ได้ JWT access token กลับมา
- เก็บ token ใน signed HTTP-only cookie `phet_admin_session`

### Filters

Dashboard filter ได้ด้วย:

- Search: nickname, participant code, UID, stage text
- Participant: เลือกดูรายคน
- Stage: เลือก stage
- Score Range: ช่วงคะแนน

### Sections สำคัญ

- Metric Cards: total filtered players, attempts, avg stars, avg correct/wrong, avg XP
- Attempts By Stage: graph จำนวน attempts ต่อ stage
- Stars Distribution: graph star split
- Stage Breakdown: average stage XP, stars, correct/wrong ต่อ stage
- Player XP Bands: distribution ตามช่วง XP
- Filtered Player Directory: รายชื่อผู้เล่น พร้อมปุ่ม `View Report`
- Player Stage Summary: สรุปว่าผู้เล่นแต่ละคนทำกี่ด่าน แต่ละด่านถูก/ผิดเท่าไร
- Result Explorer: ราย attempt พร้อม answer records รายข้อ

### ดูรายคน

1. เข้า `/admin`
2. เลือก `Participant`
3. รายงานทั้งหน้าจะเหลือเฉพาะผู้เล่นคนนั้น
4. ดู `Player Stage Summary`
5. กด `Latest Answer Records` เพื่อดูคำถาม, คำตอบที่เลือก, คำตอบที่ถูก และ XP รายข้อ

URL จะอยู่ในรูป:

```text
/admin?player=PLY-...
```

## 10. API ฝั่ง Next.js

### `POST /api/player-session`

รับ:

```json
{
  "username": "Player nickname",
  "phone": "Participant code"
}
```

ทำงาน:

- เรียก backend `/game/player-session`
- set cookie `phet_player_session`
- คืนข้อมูล player

### `DELETE /api/player-session`

ลบ player cookie เพื่อ switch player

### `POST /api/player-progress`

บันทึก progress ปัจจุบันของ player ที่ login อยู่

### `POST /api/stage-results`

บันทึกผลหลังจบ stage:

- stage ID/title/label
- stars
- stage XP
- total XP
- correct/wrong counts
- answer records รายข้อ

Route นี้ backward-compatible: ถ้า payload เก่าไม่มี `answerRecords`, `correctCount`, `incorrectCount` จะ default เป็น empty/0

## 11. Backend API ที่เกี่ยวข้อง

Backend API อยู่ในโปรเจกต์แยก `C:\databaseauth\server`

Endpoints หลัก:

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| POST | `/api/v1/auth/login` | username/password | admin login |
| POST | `/api/v1/game/player-session` | `X-API-Key` | create/update player |
| GET | `/api/v1/game/player-session/:uid` | `X-API-Key` | load player session |
| POST | `/api/v1/game/progress` | `X-API-Key` | upsert progress |
| POST | `/api/v1/game/results` | `X-API-Key` | insert stage result |
| GET | `/api/v1/game/dashboard` | Bearer JWT | admin dashboard data |

Frontend adapter อยู่ที่ `lib/backend-api.ts`

## 12. Database Tables

ตารางหลักใน backend:

### `game_players`

- `id`
- `uid`
- `username`
- `phone`
- `created_at`
- `updated_at`
- `last_active_at`

### `game_progress`

- `player_id`
- `current_stage_id`
- `current_scene_id`
- `unlocked_stage_ids` JSON
- `completed_stage_ids` JSON
- `xp`
- timestamps

### `game_stage_results`

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

Backend schema มี `ensureColumn` สำหรับเพิ่ม `correct_count`, `incorrect_count`, `answer_records` ให้ database เดิมอัตโนมัติเมื่อ backend start

## 13. Environment Variables

ไฟล์ตัวอย่างอยู่ที่ `.env.example`

```env
BACKEND_API_BASE_URL="https://api.alprasoft-corp.com/api/v1"
BACKEND_API_KEY="replace-with-backend-api-key"
APP_SESSION_SECRET="replace-with-a-long-random-session-secret"
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="replace-with-backend-admin-password"
```

### ความหมาย

- `BACKEND_API_BASE_URL`: backend API base URL
- `BACKEND_API_KEY`: key สำหรับ internal game endpoints
- `APP_SESSION_SECRET`: secret สำหรับ signed cookies
- `ADMIN_USERNAME`: username สำหรับ admin login
- `ADMIN_PASSWORD`: password ที่ frontend ส่งไป backend login

Production ควรตั้งค่าทั้งหมดใน Vercel

## 14. Local Development

### Start backend

```powershell
cd C:\databaseauth\server
npm start
```

Backend default port:

```text
http://127.0.0.1:4272/api/v1
```

### Start frontend

```powershell
cd C:\cerfmay\cefrmay
npm run dev
```

เปิด:

```text
http://localhost:3000
```

ถ้า port 3000 ถูกใช้อยู่ สามารถใช้ production preview หลัง build:

```powershell
npm run build
npm run start -- -p 3001
```

## 15. Verification Commands

Frontend:

```powershell
npm run lint
npm run build
```

Backend:

```powershell
cd C:\databaseauth\server
npm test
```

Validate advanced stage JSON แบบย่อ:

```powershell
node -e "for (const f of ['stage1_advanced.json','stage2_advanced.json','stage3_advanced.json','stage4_advanced.json']) { const d=require('./data/'+f); console.log(f, d.id, d.scenes.length); }"
```

## 16. Deployment Notes

### Frontend

- Push เข้า GitHub `main`
- Vercel build frontend จาก repository
- Frontend production ควรชี้ `BACKEND_API_BASE_URL` ไป production backend

### Backend

Backend แยกจาก repository frontend นี้ ถ้าแก้ backend ที่ `C:\databaseauth\server` ต้อง deploy/restart backend แยกต่างหาก

### ข้อควรระวัง

- อย่า commit `.env`
- อย่า commit log/temp files เช่น `.tmp-backend-restart-out.log`
- อย่าแก้ backend แล้วคิดว่า GitHub frontend จะ deploy backend ให้ เพราะเป็นคนละโปรเจกต์

## 17. วิธีอัปเดตโจทย์

1. แก้ไฟล์ JSON ใน `data/stage*_advanced.json`
2. ตรวจว่าแต่ละ scene มี correct answer 1 ข้อ
3. ตรวจ `nextSceneId`
4. ถ้าเพิ่ม image ใหม่ ให้วางใน `public/`
5. รัน validation
6. รัน `npm run lint`
7. รัน `npm run build`
8. commit และ push เข้า `main`

ถ้าต้องการสลับกลับไปโจทย์เก่า ให้แก้ `data/stages.ts` กลับไป import `stage1.json` ถึง `stage4.json`

## 18. Current Feature Status

### มีแล้ว

- Player nickname / Participant code login
- PWA shell และ offline fallback
- Stage select
- Advanced question set 4 stages
- XP scoring
- Stars per stage
- Correct/wrong counts
- Answer records รายข้อ
- Admin dashboard
- Participant filter รายคน
- Player stage summary
- Result explorer with answer details
- Backend persistence

### ยังไม่มีหรือควรระวัง

- ยังไม่มี adaptive algorithm ที่เปลี่ยน difficulty อัตโนมัติตาม performance ระหว่างเล่น
- ยังไม่มี export CSV จาก admin dashboard
- ถ้าโจทย์เก่าเล่นไปแล้ว admin report จะไม่มี answer records ย้อนหลังสำหรับ attempt เก่าที่เกิดก่อน feature นี้
- Production backend ต้องมี schema ใหม่และ restart แล้วจึงจะบันทึก answer records ได้ครบ

## 19. Git Workflow ที่ใช้กับโปรเจกต์นี้

ตรวจสถานะ:

```powershell
git status -sb
```

Commit เฉพาะไฟล์ที่เกี่ยวข้อง:

```powershell
git add <files>
git commit -m "Message"
```

Push workaround ที่เคยใช้บนเครื่องนี้:

```powershell
git -c http.sslBackend=schannel -c http.curloptResolve=github.com:443:20.205.243.166 push origin main
```

## 20. Troubleshooting

### หน้าเว็บยังไม่เปลี่ยนหลัง push

เช็กว่า Vercel deploy จาก commit ล่าสุดหรือยัง ไม่ใช่แค่ code เข้า GitHub แล้ว

### Admin dashboard ไม่มี answer records

สาเหตุที่เป็นไปได้:

- attempt นั้นเกิดก่อน feature answer records
- backend production ยังไม่ได้ deploy/restart schema ใหม่
- frontend ชี้ backend คนละตัวกับที่ตรวจอยู่

### Stage XP เป็น 0

ปัจจุบันแก้แล้วด้วย `stageStartXp` ใน `GameScene`; ถ้ายังพบอีกให้เช็กว่า production deploy ใช้ commit ล่าสุดหรือไม่

### Port 3000 ตอบ 500

เคยพบว่า port 3000 อาจเป็น dev server จาก project อื่น ให้เช็ก process:

```powershell
Get-NetTCPConnection -LocalPort 3000
Get-CimInstance Win32_Process -Filter "ProcessId=<PID>"
```

แล้วใช้ port อื่น เช่น 3001 สำหรับ preview ของ repo นี้
