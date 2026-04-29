import { GameScreen } from "@/components/game-screen";
import { practiceMode } from "@/game/modes";

export default function PracticeRoute() {
  return <GameScreen mode={practiceMode} />;
}
