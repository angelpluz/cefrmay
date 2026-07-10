import { getResearchDashboardData } from "@/lib/research";
import type { StageAnswerRecordInput } from "@/lib/research-contract";
import { getAdminSession } from "@/lib/session";
import { isInScoreRange } from "@/app/admin/dashboard-utils";

const CSV_COLUMNS = [
  "completed_at",
  "player_username",
  "participant_code",
  "player_uid",
  "stage_id",
  "stage_label",
  "stage_title",
  "stars",
  "stage_xp",
  "total_xp",
  "correct_count",
  "incorrect_count",
  "answer_index",
  "activity_type",
  "hidden_prompt",
  "audio_text",
  "question",
  "scene_id",
  "selected_answer",
  "correct_answer",
  "is_correct",
  "xp_awarded",
  "target_word",
  "meaning_th",
  "recognized_text",
  "is_pronunciation_correct",
  "attempt_count",
];

function csvValue(value: unknown) {
  if (value === undefined || value === null) {
    return "";
  }

  return `"${String(value).replace(/"/g, '""')}"`;
}

function getActivityType(record: StageAnswerRecordInput | null) {
  return record?.activityType ?? "multiple-choice";
}

export async function GET(request: Request) {
  const adminSession = await getAdminSession();

  if (!adminSession) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const selectedPlayerUid = searchParams.get("player") || "all";
  const selectedStage = searchParams.get("stage") || "all";
  const selectedScore = searchParams.get("score") || "all";
  const query = (searchParams.get("q") || "").trim().toLowerCase();
  const dashboard = await getResearchDashboardData(adminSession.accessToken);

  const filteredResults = dashboard.allResults.filter((result) => {
    const matchesPlayer =
      selectedPlayerUid === "all" || result.playerUid === selectedPlayerUid;
    const matchesStage =
      selectedStage === "all" || result.stageId === selectedStage;
    const matchesScore = isInScoreRange(result.totalXp, selectedScore);
    const searchable =
      `${result.playerUsername} ${result.playerPhone} ${result.playerUid} ${result.stageTitle} ${result.stageLabel}`.toLowerCase();

    return (
      matchesPlayer &&
      matchesStage &&
      matchesScore &&
      (!query || searchable.includes(query))
    );
  });

  const rows = filteredResults.flatMap((result) => {
    const answerRecords = result.answerRecords.length
      ? result.answerRecords
      : [null];

    return answerRecords.map((record, recordIndex) => [
      result.completedAt.toISOString(),
      result.playerUsername,
      result.playerPhone,
      result.playerUid,
      result.stageId,
      result.stageLabel,
      result.stageTitle,
      result.stars,
      result.stageXp,
      result.totalXp,
      result.correctCount,
      result.incorrectCount,
      record ? recordIndex + 1 : "",
      getActivityType(record),
      record?.hiddenPrompt ?? "",
      record?.audioText ?? "",
      record?.question ?? "",
      record?.sceneId ?? "",
      record?.selectedAnswer ?? "",
      record?.correctAnswer ?? "",
      record?.isCorrect ?? "",
      record?.xpAwarded ?? "",
      record?.targetWord ?? "",
      record?.meaningTh ?? "",
      record?.recognizedText ?? "",
      record?.isPronunciationCorrect ?? "",
      record?.attemptCount ?? "",
    ]);
  });

  const csv = [
    CSV_COLUMNS.map(csvValue).join(","),
    ...rows.map((row) => row.map(csvValue).join(",")),
  ].join("\r\n");

  return new Response(`\uFEFF${csv}`, {
    headers: {
      "Content-Disposition": 'attachment; filename="phetchabun-results.csv"',
      "Content-Type": "text/csv; charset=utf-8",
    },
  });
}
