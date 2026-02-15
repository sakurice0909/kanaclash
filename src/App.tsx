import { useGameStore } from './store/gameStore';
import { LobbyScreen } from './components/LobbyScreen';
import { InputScreen } from './components/InputScreen';
import { BattleScreen } from './components/BattleScreen';
import { GameOverScreen } from './components/GameOverScreen';

function App() {
  const phase = useGameStore((state) => state.phase);
  const roomId = useGameStore((state) => state.roomId);

  // If not in a room, show lobby (which handles create/join)
  const showLobby = !roomId || phase === 'LOBBY';

  return (
    <div className="relative min-h-screen overflow-hidden bg-ai text-kinari font-sans selection:bg-shu/30">
      {/* 和柄背景 */}
      <div className="fixed inset-0 z-0 asanoha-pattern">
        {/* 墨のにじみ風グラデーション */}
        <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] bg-kon/40 rounded-full blur-[120px] animate-float opacity-60"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] bg-shu/10 rounded-full blur-[120px] animate-float-delayed opacity-50"></div>
        <div className="absolute top-[30%] right-[10%] w-[30%] h-[30%] bg-kin/5 rounded-full blur-[100px] animate-sway opacity-40"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen">
        {showLobby && <LobbyScreen />}
        {roomId && phase === 'INPUT' && <InputScreen />}
        {roomId && phase === 'BATTLE' && <BattleScreen />}
        {roomId && phase === 'GAMEOVER' && <GameOverScreen />}
      </div>
    </div>
  );
}

export default App;
