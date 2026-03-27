import GameCampaign from "@/components/GameCampaign";
import { getAllStages } from "@/data/stages";

export default function Home() {
  const stages = getAllStages();
  const campaignSeed = crypto.randomUUID();

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-6 sm:px-6">
      <div className="w-full max-w-md">
        <GameCampaign campaignSeed={campaignSeed} stages={stages} />
      </div>
    </main>
  );
}
