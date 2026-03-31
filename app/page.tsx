import GameApp from "@/components/GameApp";
import PlayerAccessScreen from "@/components/PlayerAccessScreen";
import { getAllStages } from "@/data/stages";
import { getCurrentPlayerState } from "@/lib/research";

export default async function Home() {
  const stages = getAllStages();
  const appSeed = crypto.randomUUID();
  const playerState = await getCurrentPlayerState();

  return (
    <main className="min-h-[100dvh]">
      {playerState ? (
        <GameApp
          appSeed={appSeed}
          initialProgress={playerState.progress}
          player={playerState.player}
          stages={stages}
        />
      ) : (
        <PlayerAccessScreen />
      )}
    </main>
  );
}
