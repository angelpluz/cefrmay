import { NextResponse } from "next/server";

import { createBackendStageResult } from "@/lib/backend-api";
import type {
  StageAnswerRecordInput,
  StageResultInput,
} from "@/lib/research-contract";
import { getPlayerSession } from "@/lib/session";

function isAnswerRecord(value: unknown): value is StageAnswerRecordInput {
  if (!value || typeof value !== "object") {
    return false;
  }

  const record = value as Partial<StageAnswerRecordInput>;

  return (
    typeof record.answeredAt === "string" &&
    typeof record.correctAnswer === "string" &&
    typeof record.isCorrect === "boolean" &&
    typeof record.question === "string" &&
    typeof record.sceneId === "string" &&
    typeof record.selectedAnswer === "string" &&
    typeof record.xpAwarded === "number"
  );
}

function isAnswerRecordList(value: unknown): value is StageAnswerRecordInput[] {
  return Array.isArray(value) && value.every(isAnswerRecord);
}

export async function POST(request: Request) {
  const session = await getPlayerSession();

  if (!session) {
    return NextResponse.json({ error: "Player session expired." }, { status: 401 });
  }

  try {
    const body = (await request.json()) as Partial<StageResultInput>;

    if (
      typeof body.stageId !== "string" ||
      typeof body.stageLabel !== "string" ||
      typeof body.stageTitle !== "string" ||
      typeof body.stageXp !== "number" ||
      typeof body.stars !== "number" ||
      typeof body.totalXp !== "number"
    ) {
      return NextResponse.json({ error: "Invalid result payload." }, { status: 400 });
    }

    if (
      body.answerRecords !== undefined &&
      !isAnswerRecordList(body.answerRecords)
    ) {
      return NextResponse.json({ error: "Invalid result payload." }, { status: 400 });
    }

    if (
      body.correctCount !== undefined &&
      typeof body.correctCount !== "number"
    ) {
      return NextResponse.json({ error: "Invalid result payload." }, { status: 400 });
    }

    if (
      body.incorrectCount !== undefined &&
      typeof body.incorrectCount !== "number"
    ) {
      return NextResponse.json({ error: "Invalid result payload." }, { status: 400 });
    }

    const answerRecords = body.answerRecords ?? [];
    const correctCount =
      body.correctCount ??
      answerRecords.filter((record) => record.isCorrect).length;
    const incorrectCount =
      body.incorrectCount ?? answerRecords.length - correctCount;

    await createBackendStageResult({
      answerRecords,
      correctCount,
      incorrectCount,
      playerId: session.playerId,
      stageId: body.stageId,
      stageLabel: body.stageLabel,
      stageTitle: body.stageTitle,
      stageXp: body.stageXp,
      stars: body.stars,
      totalXp: body.totalXp,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Unable to save stage result right now." },
      { status: 500 },
    );
  }
}
