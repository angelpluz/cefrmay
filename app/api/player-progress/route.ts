import { NextResponse } from "next/server";

import { saveBackendPlayerProgress } from "@/lib/backend-api";
import type { GameProgressInput } from "@/lib/research-contract";
import { getPlayerSession } from "@/lib/session";

function isStringList(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

export async function POST(request: Request) {
  const session = await getPlayerSession();

  if (!session) {
    return NextResponse.json({ error: "Player session expired." }, { status: 401 });
  }

  try {
    const body = (await request.json()) as Partial<GameProgressInput>;

    if (
      typeof body.currentStageId !== "string" ||
      typeof body.xp !== "number" ||
      !isStringList(body.unlockedStageIds) ||
      !isStringList(body.completedStageIds) ||
      (body.currentSceneId !== null && typeof body.currentSceneId !== "string")
    ) {
      return NextResponse.json({ error: "Invalid progress payload." }, { status: 400 });
    }

    await saveBackendPlayerProgress({
      completedStageIds: body.completedStageIds,
      currentSceneId: body.currentSceneId,
      currentStageId: body.currentStageId,
      playerId: session.playerId,
      unlockedStageIds: body.unlockedStageIds,
      xp: body.xp,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Unable to save progress right now." },
      { status: 500 },
    );
  }
}
