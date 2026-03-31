import GameApp from "@/components/GameApp";
import { getAllStages } from "@/data/stages";

export default function Home() {
  const stages = getAllStages();
  const appSeed = crypto.randomUUID();

  return (
    <main className="min-h-[100dvh]">
      <GameApp appSeed={appSeed} stages={stages} />
    </main>
  );
}
