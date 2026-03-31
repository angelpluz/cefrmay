import { NextResponse } from "next/server";

import { createBackendStageResult } from "@/lib/backend-api";
import type { StageResultInput } from "@/lib/research-contract";
import { getPlayerSession } from "@/lib/session";

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

    await createBackendStageResult({
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
