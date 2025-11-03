
import React from 'react';
import { Player, AI, Wind } from '../types';
import { WaterDropIcon, BombIcon, ShieldIcon, WindIcon } from './Icons';

interface PlayerPanelProps {
  player: Player;
}

export const PlayerPanel: React.FC<PlayerPanelProps> = ({ player }) => (
  <div className="absolute top-4 left-4 bg-black/30 text-white p-4 rounded-lg shadow-lg backdrop-blur-sm border border-white/20">
    <h2 className="text-xl font-bold text-cyan-300">Player</h2>
    <div className="flex items-center mt-2">
      <WaterDropIcon className="w-6 h-6 text-blue-400 mr-2" />
      <div className="w-40 bg-gray-600 rounded-full h-4 border border-blue-300">
        <div className="bg-blue-500 h-full rounded-full transition-all duration-300" style={{ width: `${player.dryness}%` }}></div>
      </div>
      <span className="ml-2 font-semibold">{player.dryness}%</span>
    </div>
    <div className="flex items-center mt-2">
      <BombIcon className="w-6 h-6 text-red-400 mr-2" />
      <span className="text-lg font-bold">Ammo: {player.bombs}</span>
    </div>
    <div className="flex items-center mt-2">
      <ShieldIcon className="w-6 h-6 text-green-400 mr-2" />
      <div className="w-40 bg-gray-600 rounded-full h-4 border border-green-300">
        <div className="bg-green-500 h-full rounded-full transition-all duration-300" style={{ width: `${player.charge}%` }}></div>
      </div>
      <span className="ml-2 font-semibold">{player.charge}/100</span>
    </div>
  </div>
);

interface AIPanelProps {
  ai: AI;
}

export const AIPanel: React.FC<AIPanelProps> = ({ ai }) => (
  <div className="absolute top-4 right-4 bg-black/30 text-white p-4 rounded-lg shadow-lg backdrop-blur-sm border border-white/20">
    <h2 className="text-xl font-bold text-red-300">{ai.difficulty}</h2>
    <div className="flex items-center mt-2">
      <WaterDropIcon className="w-6 h-6 text-blue-400 mr-2" />
      <div className="w-40 bg-gray-600 rounded-full h-4 border border-blue-300">
        <div className="bg-blue-500 h-full rounded-full transition-all duration-300" style={{ width: `${ai.dryness}%` }}></div>
      </div>
      <span className="ml-2 font-semibold">{ai.dryness}%</span>
    </div>
    <div className="flex items-center mt-2">
      <BombIcon className="w-6 h-6 text-red-400 mr-2" />
      <span className="text-lg font-bold">Ammo: {ai.bombs}</span>
    </div>
  </div>
);

interface TopBarProps {
  wind: Wind;
  round: number;
  maxRounds: number;
}

export const TopBar: React.FC<TopBarProps> = ({ wind, round, maxRounds }) => (
  <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/30 text-white p-3 rounded-lg shadow-lg backdrop-blur-sm border border-white/20 flex flex-col items-center">
    <div className="text-2xl font-bold">Round {round}/{maxRounds}</div>
    <div className="flex items-center mt-1 text-lg">
      <WindIcon className={`w-6 h-6 mr-2 ${wind.direction === 'West' ? 'transform scale-x-[-1]' : ''}`} />
      <span>{wind.direction} {wind.speed.toFixed(1)} km/h</span>
    </div>
  </div>
);
