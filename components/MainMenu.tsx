
import React from 'react';
import { AIDifficulty } from '../types';
import { AI_DIFFICULTY_SETTINGS } from '../constants';

interface MainMenuProps {
  onStartGame: (difficulty: AIDifficulty) => void;
}

const MainMenu: React.FC<MainMenuProps> = ({ onStartGame }) => {
  const unlockedLevel = parseInt(localStorage.getItem('waterbomb_unlocked_level') || '1');
  
  return (
    <div className="w-full h-screen bg-gradient-to-br from-sky-500 to-indigo-600 flex flex-col items-center justify-center text-white p-8">
      <h1 className="text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-400 drop-shadow-lg" style={{ fontFamily: 'monospace' }}>
        WATERBOMB
      </h1>
      <p className="mt-4 text-xl text-sky-100 max-w-2xl text-center">
        A physics-based artillery game of soaking strategy. Intercept enemy water bombs to build your arsenal. Outlast and out-soak your opponent!
      </p>
      <div className="mt-12 bg-black/30 p-8 rounded-xl shadow-2xl border border-white/20 backdrop-blur-md">
        <h2 className="text-3xl font-semibold text-center mb-6">Select Difficulty</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {Object.values(AI_DIFFICULTY_SETTINGS).map((level) => {
            const isLocked = level.level > unlockedLevel;
            return (
              <button
                key={level.name}
                onClick={() => onStartGame(level.name)}
                disabled={isLocked}
                className={`px-6 py-3 rounded-lg text-lg font-bold transition-all duration-200 transform shadow-lg border-2 
                  ${isLocked 
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed border-gray-600' 
                    : 'bg-sky-600 hover:bg-sky-500 hover:scale-105 border-sky-400'
                  }`}
              >
                {level.name}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  );
};

export default MainMenu;