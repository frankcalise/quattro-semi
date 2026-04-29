import { GameScreen } from "@/components/game-screen";
import { classicMode } from "@/game/modes";

export default function ClassicRoute() {
  return <GameScreen mode={classicMode} />;
}
