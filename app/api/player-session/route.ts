import { NextResponse } from "next/server";

import { upsertBackendPlayer } from "@/lib/backend-api";
import { clearPlayerSession, setPlayerSession } from "@/lib/session";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      phone?: string;
      username?: string;
    };

    const { player } = await upsertBackendPlayer({
      phone: body.phone ?? "",
      username: body.username ?? "",
    });

    await setPlayerSession({
      playerId: player.id,
      uid: player.uid,
    });

    return NextResponse.json({
      player: {
        id: player.id,
        phone: player.phone,
        uid: player.uid,
        username: player.username,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to create player session.";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE() {
  await clearPlayerSession();

  return NextResponse.json({ ok: true });
}
