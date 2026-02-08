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
    <div className="relative min-h-screen overflow-hidden bg-slate-900 text-white font-sans selection:bg-indigo-500/30">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[100px] animate-float opacity-70"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[100px] animate-float-delayed opacity-70"></div>
        <div className="absolute top-[20%] right-[20%] w-[30%] h-[30%] bg-cyan-600/10 rounded-full blur-[80px] animate-pulse opacity-50"></div>
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
