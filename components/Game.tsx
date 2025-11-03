
import React, { useRef, useMemo } from 'react';
import { useGameLoop } from '../hooks/useGameLoop';
import { AIDifficulty, GameState, ProjectileData, Coordinates } from '../types';
import { PlayerPanel, AIPanel, TopBar } from './GameUI';
import { TutorialOverlay } from './Tutorial';
import { GAME_WIDTH, GAME_HEIGHT, MAX_ROUNDS, GROUND_HEIGHT, PLAYER_FLAG_POSITION, AI_FLAG_POSITION, FLAG_HEIGHT, FLAG_WIDTH } from '../constants';
import { BombIcon } from './Icons';

interface GameProps {
  difficulty: AIDifficulty;
  onGameOver: () => void;
}

const Catapult: React.FC<{position: Coordinates, owner: 'player' | 'ai'}> = ({ position, owner }) => {
    const color = owner === 'player' ? 'bg-blue-600' : 'bg-red-600';
    const borderColor = owner === 'player' ? 'border-blue-300' : 'border-red-300';
    const armTransform = owner === 'player' ? 'rotate-45' : '-rotate-45';

    return (
        <div className="absolute drop-shadow-lg" style={{ left: position.x - 25, top: position.y - 50, width: 50, height: 50 }}>
            {/* Base */}
            <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-4 ${color} rounded-t-md border-2 ${borderColor}`}></div>
            <div className={`absolute bottom-4 left-1/2 -translate-x-1/2 w-5 h-8 ${color} border-x-2 ${borderColor}`}></div>
            {/* Arm */}
            <div className={`absolute bottom-8 left-1/2 -translate-x-1/2 w-3 h-12 origin-bottom transform ${armTransform} border-2 ${borderColor} rounded-md bg-gray-600`}>
                {/* Bucket */}
                <div className={`absolute -top-1 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full border-2 ${borderColor} ${color}`}></div>
            </div>
        </div>
    );
};


const Flag: React.FC<{ position: Coordinates, dryness: number, owner: 'player' | 'ai' }> = ({ position, dryness, owner }) => {
    const color = owner === 'player' ? 'blue' : 'red';
    const saturation = dryness / 100;
    const droop = (100 - dryness) / 100 * 10;

    return (
        <div className="absolute" style={{ left: position.x - (FLAG_WIDTH / 2), top: position.y - FLAG_HEIGHT }}>
            <div className="w-2 h-24 bg-gray-600 rounded-t-sm shadow-md" />
            <div
                className={`w-16 h-12 bg-${color}-500 transition-all duration-300 origin-top-left`}
                style={{ 
                    filter: `saturate(${saturation})`,
                    clipPath: `polygon(0 0, 100% ${droop}px, 100% 100%, 0 100%)`
                }}
            />
        </div>
    );
};

const Projectile: React.FC<{ data: ProjectileData }> = ({ data }) => {
  if (data.type === 'water-bomb') {
    return (
      <div className="absolute w-6 h-6 bg-gradient-to-br from-cyan-300 to-blue-500 rounded-full border-2 border-white/80 shadow-lg"
        style={{ left: data.position.x - 12, top: data.position.y - 12 }}>
      </div>
    );
  }
  if (data.type === 'air-shield') {
    if (data.exploded) {
      return (
        <div className="absolute rounded-full bg-green-400/50 border-2 border-white"
             style={{ left: data.position.x - data.explosionRadius!, top: data.position.y - data.explosionRadius!, width: data.explosionRadius! * 2, height: data.explosionRadius! * 2, animation: 'explode 0.2s forwards' }}>
        </div>
      );
    }
    return (
      <div className="absolute w-4 h-4 bg-gradient-to-br from-green-300 to-lime-400 rounded-full border-2 border-white shadow-lg"
        style={{ left: data.position.x - 8, top: data.position.y - 8 }}>
      </div>
    );
  }
  return null;
};

const NotificationOverlay: React.FC<{ text: string }> = ({ text }) => (
    <div className="absolute top-28 left-1/2 -translate-x-1/2 bg-black/60 p-4 px-8 rounded-lg text-3xl font-bold text-yellow-300 shadow-2xl z-20 border-2 border-yellow-400/50" style={{ animation: 'fade-in 0.3s ease-out' }}>
        {text}
    </div>
);

const GameOverOverlay: React.FC<{ winner: GameState['winner'], onRestart: () => void }> = ({ winner, onRestart }) => {
    let message = "IT'S A DRAW!";
    let color = "text-yellow-300";
    if (winner === 'player') {
        message = "PLAYER WINS!";
        color = "text-cyan-300";
    } else if (winner === 'ai') {
        message = "AI WINS!";
        color = "text-red-300";
    }

    return (
        <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-50" style={{ animation: 'fade-in 0.5s' }}>
            <h2 className={`text-8xl font-bold ${color} drop-shadow-lg`}>{message}</h2>
            <button
                onClick={onRestart}
                className="mt-8 px-8 py-4 bg-sky-600 text-white rounded-lg text-2xl font-bold hover:bg-sky-500 transition-all duration-200 transform hover:scale-105 shadow-lg border-2 border-sky-400"
            >
                Back to Menu
            </button>
        </div>
    );
};

const Game: React.FC<GameProps> = ({ difficulty, onGameOver }) => {
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const { gameState, actions } = useGameLoop(difficulty, onGameOver);
  const { player, ai, wind, round, projectiles, status, aiming, phase, effects, notification, tutorialStep, winner } = gameState;

  const isInputDisabled = tutorialStep > 0 || status === 'game-over';

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isInputDisabled || phase !== 'aiming' || gameState.currentTurn !== 'player' || player.bombs <= 0) return;
    const rect = gameAreaRef.current?.getBoundingClientRect();
    if (!rect) return;
    actions.startAim({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isInputDisabled || !aiming.active) return;
    const rect = gameAreaRef.current?.getBoundingClientRect();
    if (!rect) return;
    actions.updateAim({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isInputDisabled || !aiming.active) return;
    const rect = gameAreaRef.current?.getBoundingClientRect();
    if (!rect) return;
    actions.fire({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleDefenseClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isInputDisabled || phase !== 'defending' || gameState.currentTurn !== 'ai' || player.charge < 25) return;
    const rect = gameAreaRef.current?.getBoundingClientRect();
    if (!rect) return;
    actions.defend({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div className="w-full h-screen bg-gray-800 flex items-center justify-center">
      <div
        ref={gameAreaRef}
        className="relative overflow-hidden bg-gradient-to-b from-sky-400 to-sky-600 cursor-crosshair"
        style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onClick={handleDefenseClick}
      >
        {/* Background Elements */}
        <div className="absolute top-20 left-40 w-32 h-16 bg-white/20 rounded-full opacity-50 blur-sm"></div>
        <div className="absolute top-32 left-32 w-24 h-12 bg-white/10 rounded-full opacity-50 blur-sm"></div>
        <div className="absolute top-24 right-40 w-40 h-20 bg-white/20 rounded-full opacity-50 blur-sm"></div>
        <div className="absolute top-40 right-32 w-28 h-14 bg-white/10 rounded-full opacity-50 blur-sm"></div>
        
        {/* Game World */}
        <div className="absolute bottom-0 left-0 w-full bg-yellow-200" style={{height: GAME_HEIGHT - GROUND_HEIGHT}}></div>
        <div className="absolute bottom-0 left-0 w-full h-2 bg-green-600" style={{top: GROUND_HEIGHT-2}}></div>

        {/* Characters & Flags */}
        <Catapult position={player.position} owner="player" />
        <Catapult position={ai.position} owner="ai" />
        <Flag position={PLAYER_FLAG_POSITION} dryness={player.dryness} owner="player" />
        <Flag position={AI_FLAG_POSITION} dryness={ai.dryness} owner="ai" />
        
        {/* Projectiles */}
        {projectiles.map(p => <Projectile key={p.id} data={p} />)}
        
        {/* Aiming Trajectory */}
        {aiming.active && aiming.trajectory.map((p, i) => (
            <div key={i} className="absolute w-1 h-1 bg-white/50 rounded-full" style={{ left: p.x, top: p.y }} />
        ))}

        {/* Game Effects */}
        {effects.map(effect => (
            <React.Fragment key={effect.id}>
                {effect.type === 'SPLOOSH' && (
                    <div className="absolute rounded-full"
                         style={{ 
                             left: effect.position.x - 50, 
                             top: effect.position.y - 50, 
                             width: 100, 
                             height: 100, 
                             animation: 'explode 0.4s forwards',
                             background: 'radial-gradient(circle, rgba(96,165,250,0.8) 0%, rgba(59,130,246,0) 70%)' 
                         }}>
                    </div>
                )}
                <div className="absolute text-white font-bold text-2xl drop-shadow-lg flex items-center gap-1" style={{ left: effect.position.x, top: effect.position.y, animation: 'fade-out-up 1.5s forwards' }}>
                    {effect.type === '+1 BOMB' && <BombIcon className="w-6 h-6 text-yellow-300" />}
                    <span className={effect.type === '+1 BOMB' ? 'text-yellow-300' : ''}>{effect.text}</span>
                </div>
            </React.Fragment>
        ))}
        
        {/* UI Panels */}
        <PlayerPanel player={player} />
        <AIPanel ai={ai} />
        <TopBar wind={wind} round={round} maxRounds={MAX_ROUNDS} />

        {/* Overlays */}
        {notification && <NotificationOverlay text={notification} />}
        {tutorialStep > 0 && <TutorialOverlay step={tutorialStep} onNext={actions.advanceTutorial} />}
        {status === 'game-over' && <GameOverOverlay winner={winner} onRestart={onGameOver} />}

      </div>
    </div>
  );
};

export default Game;