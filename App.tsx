
import React, { useState, useCallback } from 'react';
import Game from './components/Game';
import MainMenu from './components/MainMenu';
import { AIDifficulty, GameState } from './types';

const App: React.FC = () => {
  const [gameStatus, setGameStatus] = useState<GameState['status']>('main-menu');
  const [difficulty, setDifficulty] = useState<AIDifficulty>(AIDifficulty.LEVEL_1);

  const handleStartGame = useCallback((selectedDifficulty: AIDifficulty) => {
    setDifficulty(selectedDifficulty);
    setGameStatus('playing');
  }, []);
  
  const handleGameOver = useCallback(() => {
    // This function is now called by the Game Over screen to return to the menu
    setGameStatus('main-menu');
  }, []);

  return (
    <div className="app">
      <style>{`
        @keyframes explode {
          from { transform: scale(0.2); opacity: 1; }
          to { transform: scale(1); opacity: 0; }
        }
        @keyframes fade-out-up {
          from { transform: translateY(0); opacity: 1; }
          to { transform: translateY(-50px); opacity: 0; }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
      {gameStatus === 'main-menu' && <MainMenu onStartGame={handleStartGame} />}
      {gameStatus === 'playing' && <Game difficulty={difficulty} onGameOver={handleGameOver} />}
    </div>
  );
};

export default App;
