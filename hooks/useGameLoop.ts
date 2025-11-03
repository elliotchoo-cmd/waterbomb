
import { useState, useEffect, useRef, useCallback } from 'react';
import { GameState, AIDifficulty, Coordinates, ProjectileData, Phase } from '../types';
import {
  INITIAL_GAME_STATE,
  MAX_ROUNDS,
  PLAYER_POSITION,
  AI_POSITION,
  INITIAL_BOMBS,
  INITIAL_CHARGE,
  INITIAL_DRYNESS,
  GRAVITY,
  WIND_FACTOR,
  AIM_POWER_FACTOR,
  MAX_AIM_DISTANCE,
  GAME_WIDTH,
  GROUND_HEIGHT,
  DIRECT_HIT_DAMAGE,
  SPLASH_RADIUS,
  MAX_SPLASH_DAMAGE,
  MIN_SPLASH_DAMAGE,
  PLAYER_FLAG_POSITION,
  AI_FLAG_POSITION,
  FLAG_WIDTH,
  FLAG_HEIGHT,
  SHIELD_COST,
  AIR_SHIELD_SPEED,
  AIR_SHIELD_EXPLOSION_RADIUS,
  AI_DIFFICULTY_SETTINGS,
  CHARGE_REGEN
} from '../constants';

export const useGameLoop = (difficulty: AIDifficulty, onGameOver: () => void) => {
  const [gameState, setGameState] = useState<GameState>(INITIAL_GAME_STATE);
  const animationFrameId = useRef<number>();
  const notificationTimeout = useRef<number>();
  const isTransitioning = useRef(false);

  const setNotification = useCallback((text: string | null, duration: number = 2000) => {
    if (notificationTimeout.current) clearTimeout(notificationTimeout.current);
    
    setGameState(prev => ({ ...prev, notification: text }));
    
    if (text !== null && duration > 0) {
        notificationTimeout.current = window.setTimeout(() => {
            setGameState(prev => ({ ...prev, notification: null }));
        }, duration);
    }
  }, []);

  const createEffect = useCallback((type: 'SPLOOSH' | 'INTERCEPT' | '+1 BOMB' | 'MISS', position: Coordinates, text: string) => {
    const newEffect = { id: Date.now().toString() + Math.random(), type, position, text };
    setGameState(prev => ({
        ...prev,
        effects: [...prev.effects, newEffect]
    }));

    if (type === 'SPLOOSH') setNotification('FLAG HIT!', 1500);
    if (type === 'INTERCEPT') setNotification('INTERCEPTED!', 1500);

    setTimeout(() => {
        setGameState(prev => ({
            ...prev,
            effects: prev.effects.filter(e => e.id !== newEffect.id)
        }));
    }, 1500);
  }, [setNotification]);
  
  const startGame = useCallback(() => {
    const tutorialCompleted = localStorage.getItem('waterbomb_tutorial_completed');
    const settings = AI_DIFFICULTY_SETTINGS[difficulty];
    
    const isTutorialActive = !tutorialCompleted;
    
    setGameState({
      ...INITIAL_GAME_STATE,
      status: 'playing',
      ai: {
        ...INITIAL_GAME_STATE.ai,
        difficulty: difficulty,
        bombs: INITIAL_BOMBS + settings.bombBonus,
        charge: INITIAL_CHARGE,
      },
      player: {
          ...INITIAL_GAME_STATE.player,
          charge: INITIAL_CHARGE,
          bombs: INITIAL_BOMBS,
      },
      wind: {
          direction: Math.random() > 0.5 ? 'East' : 'West',
          speed: Math.random() * 20,
      },
      tutorialStep: isTutorialActive ? 1 : 0,
    });
    
    if (isTutorialActive) {
      setNotification(null, -1); // Clear any lingering notifications
    } else {
      setNotification("YOUR TURN", 2000);
    }

  }, [difficulty, setNotification]);
  
  useEffect(() => {
    startGame();
  }, [startGame]);

  const nextTurn = useCallback(() => {
    if (isTransitioning.current) return;
    isTransitioning.current = true;

    setGameState(prev => {
      if (prev.status !== 'playing') return prev;

      const isGameOver = prev.player.dryness <= 0 || prev.ai.dryness <= 0 || (prev.currentTurn === 'ai' && prev.round >= MAX_ROUNDS);
      if (isGameOver) {
        let winner: 'player' | 'ai' | 'draw' = 'draw';

        if (prev.player.dryness <= 0 && prev.ai.dryness > 0) winner = 'ai';
        else if (prev.ai.dryness <= 0 && prev.player.dryness > 0) winner = 'player';
        else { // Round limit reached or both flags at 0
            if (prev.player.dryness > prev.ai.dryness) winner = 'player';
            else if (prev.ai.dryness > prev.player.dryness) winner = 'ai';
            else { // Dryness is tied
                if (prev.player.bombs > prev.ai.bombs) winner = 'player';
                else if (prev.ai.bombs > prev.player.bombs) winner = 'ai';
                else winner = 'draw';
            }
        }

        if (winner === 'player') {
            const difficulties = Object.values(AIDifficulty);
            const currentDifficultyIndex = difficulties.indexOf(prev.ai.difficulty);
            
            if (currentDifficultyIndex !== -1 && currentDifficultyIndex < difficulties.length - 1) {
                const nextLevel = currentDifficultyIndex + 2; // +1 for 0-index to 1-index level, +1 for next level
                const currentUnlocked = parseInt(localStorage.getItem('waterbomb_unlocked_level') || '1');
                if (nextLevel > currentUnlocked) {
                    localStorage.setItem('waterbomb_unlocked_level', nextLevel.toString());
                }
            }
        }
        
        return { ...prev, status: 'game-over', winner: winner, notification: null };
      }

      const nextRound = prev.currentTurn === 'ai' ? prev.round + 1 : prev.round;
      const nextTurn = prev.currentTurn === 'player' ? 'ai' : 'player';
      
      const settings = AI_DIFFICULTY_SETTINGS[prev.ai.difficulty];
      const newPlayerCharge = nextTurn === 'player' ? Math.min(INITIAL_CHARGE, prev.player.charge + CHARGE_REGEN) : prev.player.charge;
      const newAiCharge = nextTurn === 'ai' ? Math.min(INITIAL_CHARGE, prev.ai.charge + CHARGE_REGEN + settings.chargeRegenBonus) : prev.ai.charge;

      return {
        ...prev,
        currentTurn: nextTurn,
        round: nextRound,
        phase: 'transition',
        projectiles: [],
        wind: {
          direction: Math.random() > 0.5 ? 'East' : 'West',
          speed: Math.max(0, prev.wind.speed + (Math.random() - 0.5) * 5),
        },
        player: { ...prev.player, charge: newPlayerCharge },
        ai: { ...prev.ai, charge: newAiCharge },
      };
    });
    setTimeout(() => { isTransitioning.current = false; }, 100);
  }, []);

  const gameLoop = useCallback(() => {
    setGameState(prev => {
        if (prev.status !== 'playing' || prev.tutorialStep > 0) return prev;

        const newProjectiles: ProjectileData[] = [];
        let hitOccurred = false;

        for (const p of prev.projectiles) {
            let newPos = { ...p.position };
            let newVel = { ...p.velocity };
            let copy = { ...p };

            if (copy.type === 'water-bomb') {
                newVel.y += GRAVITY;
                const windForce = (prev.wind.direction === 'East' ? 1 : -1) * prev.wind.speed * WIND_FACTOR;
                newVel.x += windForce;
                newPos.x += newVel.x;
                newPos.y += newVel.y;
            } else { // air-shield
                if(copy.exploded) {
                    copy.explosionTimer = (copy.explosionTimer || 0) + 1;
                    if(copy.explosionTimer > 10) continue; // remove after short duration
                    newProjectiles.push(copy);
                    continue;
                }
                newPos.x += newVel.x;
                newPos.y += newVel.y;
            }
            
            copy.position = newPos;
            copy.velocity = newVel;

            if (newPos.y > GROUND_HEIGHT || newPos.x < 0 || newPos.x > GAME_WIDTH) { // Hit ground or out of bounds
                 if(copy.type === 'water-bomb') {
                    hitOccurred = true;
                    const targetFlagPos = copy.owner === 'player' ? AI_FLAG_POSITION : PLAYER_FLAG_POSITION;
                    const distance = Math.hypot(newPos.x - targetFlagPos.x, GROUND_HEIGHT - (targetFlagPos.y - FLAG_HEIGHT/2));
                    
                    if (distance < SPLASH_RADIUS) {
                        const damage = MAX_SPLASH_DAMAGE - (distance / SPLASH_RADIUS) * (MAX_SPLASH_DAMAGE - MIN_SPLASH_DAMAGE);
                        createEffect('SPLOOSH', newPos, `${Math.round(damage)}%`);
                        if(copy.owner === 'player') prev.ai.dryness = Math.max(0, prev.ai.dryness - damage);
                        else prev.player.dryness = Math.max(0, prev.player.dryness - damage);
                    } else {
                        createEffect('MISS', newPos, 'Miss!');
                    }
                 } else { 
                    hitOccurred = true;
                 }
            } else { 
                if (copy.type === 'water-bomb') {
                    const targetFlagRect = copy.owner === 'player' ? 
                        { x: AI_FLAG_POSITION.x - FLAG_WIDTH / 2, y: AI_FLAG_POSITION.y - FLAG_HEIGHT, w: FLAG_WIDTH, h: FLAG_HEIGHT } :
                        { x: PLAYER_FLAG_POSITION.x - FLAG_WIDTH / 2, y: PLAYER_FLAG_POSITION.y - FLAG_HEIGHT, w: FLAG_WIDTH, h: FLAG_HEIGHT };
                    
                    if (newPos.x > targetFlagRect.x && newPos.x < targetFlagRect.x + targetFlagRect.w && newPos.y > targetFlagRect.y && newPos.y < targetFlagRect.y + targetFlagRect.h) {
                        hitOccurred = true;
                        createEffect('SPLOOSH', newPos, `${DIRECT_HIT_DAMAGE}%`);
                        if (copy.owner === 'player') prev.ai.dryness = Math.max(0, prev.ai.dryness - DIRECT_HIT_DAMAGE);
                        else prev.player.dryness = Math.max(0, prev.player.dryness - DIRECT_HIT_DAMAGE);
                    } else {
                        newProjectiles.push(copy);
                    }
                } else { // air-shield
                    const bomb = prev.projectiles.find(proj => proj.type === 'water-bomb' && proj.owner !== copy.owner);
                    if(bomb && Math.hypot(newPos.x - bomb.position.x, newPos.y - bomb.position.y) < AIR_SHIELD_EXPLOSION_RADIUS) {
                        hitOccurred = true;
                        createEffect('INTERCEPT', newPos, 'Intercept!');
                        createEffect('+1 BOMB', {x: newPos.x, y: newPos.y + 30}, '+1 Bomb');

                        if (prev.tutorialStep === 2 && copy.owner === 'player') {
                           setTimeout(() => setGameState(g => ({...g, tutorialStep: 3})), 1000);
                        }

                        if(copy.owner === 'player') prev.player.bombs++;
                        else prev.ai.bombs++;
                    } else {
                        const distToTarget = copy.target ? Math.hypot(newPos.x - copy.target.x, newPos.y - copy.target.y) : Infinity;
                        if (distToTarget < 10) { 
                            copy.exploded = true;
                            copy.explosionRadius = AIR_SHIELD_EXPLOSION_RADIUS;
                            newProjectiles.push(copy);
                        } else {
                            newProjectiles.push(copy);
                        }
                    }
                }
            }
        }
        
        if(hitOccurred && prev.projectiles.some(p => p.type === 'water-bomb')) {
            setTimeout(() => nextTurn(), 2000);
            return { ...prev, projectiles: [], phase: 'resolving' };
        }

        return { ...prev, projectiles: newProjectiles };
    });

    animationFrameId.current = requestAnimationFrame(gameLoop);
  }, [nextTurn, createEffect]);

  useEffect(() => {
    if (gameState.status === 'playing') {
      animationFrameId.current = requestAnimationFrame(gameLoop);
    }
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      if (notificationTimeout.current) {
        clearTimeout(notificationTimeout.current);
      }
    };
  }, [gameState.status, gameLoop]);

  // Turn transition logic
  useEffect(() => {
    if (gameState.status !== 'playing' || gameState.phase !== 'transition' || gameState.tutorialStep > 0) return;

    if (gameState.currentTurn === 'player') {
      if (gameState.player.bombs <= 0) {
        setNotification("NO AMMO!", 2000);
        setTimeout(() => nextTurn(), 2000);
      } else {
        setNotification("YOUR TURN", 2000);
        setGameState(prev => ({ ...prev, phase: 'aiming' }));
      }
    } else { // AI Turn
      setNotification("AI'S TURN", 1500);
      setTimeout(() => {
        setGameState(prev => ({...prev, phase: 'aiming'}));
        if(gameState.ai.bombs <= 0) {
          setNotification("AI HAS NO AMMO!", 2000);
          setTimeout(() => nextTurn(), 2000);
          return;
        }
      
        const settings = AI_DIFFICULTY_SETTINGS[difficulty];
        const targetX = PLAYER_FLAG_POSITION.x + (Math.random() - 0.5) * settings.accuracyError;
        const targetY = PLAYER_FLAG_POSITION.y - FLAG_HEIGHT/2 + (Math.random() - 0.5) * settings.accuracyError;

        const dx = targetX - AI_POSITION.x;
        const dy = targetY - AI_POSITION.y;
        const angle = Math.atan2(dy, dx);
        
        let power = Math.hypot(dx, dy) * 0.1;
        power = Math.min(power, MAX_AIM_DISTANCE * AIM_POWER_FACTOR);
        
        const velX = Math.cos(angle) * power;
        const velY = Math.sin(angle) * power;

        const windEffect = (gameState.wind.direction === 'East' ? 1 : -1) * gameState.wind.speed * WIND_FACTOR;
        const adjustedVelX = velX - windEffect * 50 * (1 - settings.windErrorFactor); 
        
        const newBomb: ProjectileData = {
            id: Date.now().toString(), type: 'water-bomb', owner: 'ai',
            position: { ...AI_POSITION }, velocity: { x: adjustedVelX, y: velY },
        };

        setGameState(prev => ({
            ...prev,
            projectiles: [newBomb],
            ai: { ...prev.ai, bombs: prev.ai.bombs - 1},
            phase: 'defending',
        }));
        
        if (gameState.tutorialStep === 1) {
          setTimeout(() => setGameState(g => ({...g, tutorialStep: 2})), 1000);
        }

      }, 2000); // AI thinking time
    }
  }, [gameState.phase, gameState.currentTurn, gameState.status, difficulty, nextTurn, setNotification, gameState.player.bombs, gameState.ai.bombs, gameState.wind, gameState.tutorialStep]);
  
  // AI Defense Logic
  useEffect(() => {
    if (gameState.status !== 'playing' || gameState.currentTurn !== 'player' || gameState.phase !== 'defending' || gameState.tutorialStep > 0) return;
    
    const playerBomb = gameState.projectiles.find(p => p.type === 'water-bomb' && p.owner === 'player');
    if (!playerBomb) return;
    
    const settings = AI_DIFFICULTY_SETTINGS[difficulty];
    if (Math.random() > settings.defenseProbability || gameState.ai.charge < SHIELD_COST) return;

    setTimeout(() => {
        setGameState(prev => {
            if (prev.ai.charge < SHIELD_COST) return prev;
            
            const pBomb = prev.projectiles.find(p => p.type === 'water-bomb' && p.owner === 'player');
            if (!pBomb) return prev;
            
            let simBomb = { ...pBomb, position: {...pBomb.position}, velocity: {...pBomb.velocity} };
            let targetPoint: Coordinates | null = null;
            // Predict where the bomb will be in 30 frames
            for (let i = 0; i < 30; i++) {
                simBomb.velocity.y += GRAVITY;
                const windForce = (prev.wind.direction === 'East' ? 1 : -1) * prev.wind.speed * WIND_FACTOR;
                simBomb.velocity.x += windForce;
                simBomb.position.x += simBomb.velocity.x;
                simBomb.position.y += simBomb.velocity.y;
            }
            targetPoint = simBomb.position;
            
            const dx = targetPoint.x - AI_POSITION.x;
            const dy = targetPoint.y - AI_POSITION.y;
            const angle = Math.atan2(dy, dx);

            const newShield: ProjectileData = {
                id: Date.now().toString() + 'ai-shield', type: 'air-shield', owner: 'ai',
                position: { ...AI_POSITION },
                velocity: { x: Math.cos(angle) * AIR_SHIELD_SPEED, y: Math.sin(angle) * AIR_SHIELD_SPEED },
                target: targetPoint,
            };
            
            return {
                ...prev,
                projectiles: [...prev.projectiles, newShield],
                ai: { ...prev.ai, charge: prev.ai.charge - SHIELD_COST },
            };
        });
    }, 300 + Math.random() * 400); // AI reaction time

  }, [gameState.phase, gameState.currentTurn, gameState.projectiles, difficulty, gameState.ai.charge, gameState.wind, gameState.status, gameState.tutorialStep]);

  const actions = {
    startAim: (pos: Coordinates) => {
        if(gameState.player.bombs <= 0) return;
        setGameState(prev => ({ ...prev, aiming: { ...prev.aiming, start: pos, active: true } }));
    },
    updateAim: (pos: Coordinates) => {
        setGameState(prev => {
            if (!prev.aiming.start) return prev;
            const dx = pos.x - prev.aiming.start.x;
            const dy = pos.y - prev.aiming.start.y;
            let dist = Math.hypot(dx, dy);
            dist = Math.min(dist, MAX_AIM_DISTANCE);
            const angle = Math.atan2(dy, dx);
            
            const power = dist * AIM_POWER_FACTOR;
            
            let p: ProjectileData = { id: 'traj', type: 'water-bomb', owner: 'player', position: {...PLAYER_POSITION}, velocity: { x: -Math.cos(angle) * power, y: -Math.sin(angle) * power } };
            
            const trajectory: Coordinates[] = [];
            for (let i=0; i<100; i++) {
                p.velocity.y += GRAVITY;
                const windForce = (prev.wind.direction === 'East' ? 1 : -1) * prev.wind.speed * WIND_FACTOR;
                p.velocity.x += windForce;
                p.position.x += p.velocity.x;
                p.position.y += p.velocity.y;
                if(i % 2 === 0) trajectory.push({...p.position});
            }

            return { ...prev, aiming: { ...prev.aiming, end: pos, trajectory } };
        });
    },
    fire: (pos: Coordinates) => {
        setGameState(prev => {
            if (!prev.aiming.start || prev.player.bombs <= 0) return prev;
            
            const dx = pos.x - prev.aiming.start.x;
            const dy = pos.y - prev.aiming.start.y;
            let dist = Math.hypot(dx, dy);
            dist = Math.min(dist, MAX_AIM_DISTANCE);
            const angle = Math.atan2(dy, dx);
            const power = dist * AIM_POWER_FACTOR;
            
            const newBomb: ProjectileData = {
                id: Date.now().toString(), type: 'water-bomb', owner: 'player',
                position: { ...PLAYER_POSITION },
                velocity: { x: -Math.cos(angle) * power, y: -Math.sin(angle) * power },
            };
            
            return {
                ...prev,
                projectiles: [newBomb],
                player: { ...prev.player, bombs: prev.player.bombs - 1 },
                aiming: { start: null, end: null, active: false, trajectory: [] },
                phase: 'defending',
            };
        });
    },
    defend: (pos: Coordinates) => {
        setGameState(prev => {
            if (prev.player.charge < SHIELD_COST) return prev;
            const dx = pos.x - prev.player.position.x;
            const dy = pos.y - prev.player.position.y;
            const angle = Math.atan2(dy, dx);
            
            const newShield: ProjectileData = {
                id: Date.now().toString(), type: 'air-shield', owner: 'player',
                position: { ...prev.player.position },
                velocity: { x: Math.cos(angle) * AIR_SHIELD_SPEED, y: Math.sin(angle) * AIR_SHIELD_SPEED },
                target: pos,
            };
            
            return {
                ...prev,
                projectiles: [...prev.projectiles, newShield],
                player: { ...prev.player, charge: prev.player.charge - SHIELD_COST },
            };
        });
    },
    advanceTutorial: () => {
        setGameState(prev => {
            const nextStep = prev.tutorialStep + 1;
            if (nextStep > 4) {
                localStorage.setItem('waterbomb_tutorial_completed', 'true');
                setNotification("YOUR TURN", 2000);
                return { ...prev, tutorialStep: 0 };
            }
            return { ...prev, tutorialStep: nextStep };
        });
    },
  };

  return { gameState, actions };
};