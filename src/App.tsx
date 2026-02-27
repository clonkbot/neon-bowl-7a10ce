import { useState, useCallback, useEffect } from 'react';
import BowlingLane from './components/BowlingLane';
import Scoreboard from './components/Scoreboard';
import GameControls from './components/GameControls';
import './styles.css';

export type Frame = {
  rolls: number[];
  score: number | null;
};

export type Player = {
  name: string;
  frames: Frame[];
  isBot: boolean;
};

const createEmptyFrames = (): Frame[] =>
  Array(10).fill(null).map(() => ({ rolls: [], score: null }));

const calculateScore = (frames: Frame[]): Frame[] => {
  const scoredFrames = frames.map(f => ({ ...f, rolls: [...f.rolls] }));
  let runningScore = 0;

  for (let i = 0; i < 10; i++) {
    const frame = scoredFrames[i];
    if (frame.rolls.length === 0) break;

    const isLastFrame = i === 9;
    const roll1 = frame.rolls[0] || 0;
    const roll2 = frame.rolls[1] || 0;
    const roll3 = frame.rolls[2] || 0;

    if (isLastFrame) {
      if (frame.rolls.length === 3 ||
          (frame.rolls.length === 2 && roll1 < 10 && roll1 + roll2 < 10)) {
        runningScore += roll1 + roll2 + roll3;
        frame.score = runningScore;
      }
    } else {
      const isStrike = roll1 === 10;
      const isSpare = !isStrike && roll1 + roll2 === 10;

      if (isStrike) {
        const nextFrame = scoredFrames[i + 1];
        const frameAfter = scoredFrames[i + 2];
        if (nextFrame && nextFrame.rolls.length > 0) {
          const bonus1 = nextFrame.rolls[0] || 0;
          let bonus2 = nextFrame.rolls[1];
          if (bonus2 === undefined && bonus1 === 10 && frameAfter) {
            bonus2 = frameAfter.rolls[0] || 0;
          }
          if (bonus2 !== undefined) {
            runningScore += 10 + bonus1 + bonus2;
            frame.score = runningScore;
          }
        }
      } else if (isSpare) {
        const nextFrame = scoredFrames[i + 1];
        if (nextFrame && nextFrame.rolls.length > 0) {
          runningScore += 10 + (nextFrame.rolls[0] || 0);
          frame.score = runningScore;
        }
      } else if (frame.rolls.length === 2) {
        runningScore += roll1 + roll2;
        frame.score = runningScore;
      }
    }
  }

  return scoredFrames;
};

const isFrameComplete = (frame: Frame, frameIndex: number): boolean => {
  const isLastFrame = frameIndex === 9;
  if (isLastFrame) {
    if (frame.rolls.length === 3) return true;
    if (frame.rolls.length === 2) {
      const isStrike = frame.rolls[0] === 10;
      const isSpare = frame.rolls[0] + frame.rolls[1] === 10;
      return !isStrike && !isSpare;
    }
    return false;
  }
  return frame.rolls[0] === 10 || frame.rolls.length === 2;
};

const getCurrentFrameIndex = (frames: Frame[]): number => {
  for (let i = 0; i < 10; i++) {
    if (!isFrameComplete(frames[i], i)) return i;
  }
  return 9;
};

const getPinsRemaining = (frame: Frame, frameIndex: number): number => {
  const isLastFrame = frameIndex === 9;
  if (frame.rolls.length === 0) return 10;

  if (isLastFrame) {
    if (frame.rolls.length === 1) {
      return frame.rolls[0] === 10 ? 10 : 10 - frame.rolls[0];
    }
    if (frame.rolls.length === 2) {
      const r1 = frame.rolls[0];
      const r2 = frame.rolls[1];
      if (r1 === 10) {
        return r2 === 10 ? 10 : 10 - r2;
      }
      return 10;
    }
    return 0;
  }

  if (frame.rolls[0] === 10) return 0;
  return 10 - frame.rolls[0];
};

export default function App() {
  const [players, setPlayers] = useState<Player[]>([
    { name: 'YOU', frames: createEmptyFrames(), isBot: false },
    { name: 'BOT', frames: createEmptyFrames(), isBot: true },
  ]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [isRolling, setIsRolling] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [pinsKnocked, setPinsKnocked] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  const currentPlayer = players[currentPlayerIndex];
  const currentFrameIndex = getCurrentFrameIndex(currentPlayer.frames);
  const currentFrame = currentPlayer.frames[currentFrameIndex];
  const pinsRemaining = getPinsRemaining(currentFrame, currentFrameIndex);

  const checkGameOver = useCallback((updatedPlayers: Player[]) => {
    return updatedPlayers.every(player => {
      const lastFrame = player.frames[9];
      return isFrameComplete(lastFrame, 9);
    });
  }, []);

  const switchPlayer = useCallback(() => {
    setCurrentPlayerIndex(prev => (prev + 1) % 2);
  }, []);

  const roll = useCallback((pins: number) => {
    if (isRolling || gameOver) return;

    setIsRolling(true);
    setPinsKnocked(pins);
    setShowResult(true);

    setTimeout(() => {
      setPlayers(prev => {
        const newPlayers = prev.map((player, idx) => {
          if (idx !== currentPlayerIndex) return player;

          const newFrames = player.frames.map((frame, fIdx) => {
            if (fIdx !== currentFrameIndex) return frame;
            return { ...frame, rolls: [...frame.rolls, pins] };
          });

          return { ...player, frames: calculateScore(newFrames) };
        });

        const updatedPlayer = newPlayers[currentPlayerIndex];
        const updatedFrame = updatedPlayer.frames[currentFrameIndex];

        if (isFrameComplete(updatedFrame, currentFrameIndex)) {
          if (checkGameOver(newPlayers)) {
            setGameOver(true);
          } else {
            setTimeout(() => switchPlayer(), 500);
          }
        }

        return newPlayers;
      });

      setIsRolling(false);
      setTimeout(() => {
        setShowResult(false);
        setPinsKnocked(null);
      }, 800);
    }, 1500);
  }, [currentPlayerIndex, currentFrameIndex, isRolling, gameOver, checkGameOver, switchPlayer]);

  const botRoll = useCallback(() => {
    const skill = Math.random();
    let pins: number;

    if (skill > 0.7) {
      pins = pinsRemaining;
    } else if (skill > 0.3) {
      pins = Math.floor(pinsRemaining * (0.6 + Math.random() * 0.4));
    } else {
      pins = Math.floor(Math.random() * (pinsRemaining + 1));
    }

    roll(pins);
  }, [pinsRemaining, roll]);

  useEffect(() => {
    if (currentPlayer.isBot && !isRolling && !gameOver) {
      const timer = setTimeout(botRoll, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentPlayer.isBot, isRolling, gameOver, botRoll]);

  const resetGame = () => {
    setPlayers([
      { name: 'YOU', frames: createEmptyFrames(), isBot: false },
      { name: 'BOT', frames: createEmptyFrames(), isBot: true },
    ]);
    setCurrentPlayerIndex(0);
    setGameOver(false);
    setPinsKnocked(null);
    setShowResult(false);
  };

  const getWinner = () => {
    const p1Score = players[0].frames[9].score || 0;
    const p2Score = players[1].frames[9].score || 0;
    if (p1Score > p2Score) return 'YOU WIN!';
    if (p2Score > p1Score) return 'BOT WINS!';
    return "IT'S A TIE!";
  };

  return (
    <div className="min-h-screen bg-[#0a0a12] relative overflow-hidden flex flex-col">
      {/* Animated background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#ff2d95] opacity-10 blur-[150px] animate-pulse-slow" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#00f5ff] opacity-10 blur-[150px] animate-pulse-slow animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#7b2dff] opacity-5 blur-[200px]" />
      </div>

      {/* Scan lines overlay */}
      <div className="absolute inset-0 pointer-events-none scanlines opacity-20" />

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <header className="text-center py-4 md:py-6 px-4">
          <h1 className="font-orbitron text-3xl md:text-5xl lg:text-6xl font-bold tracking-wider">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff2d95] via-[#ff9500] to-[#00f5ff] animate-gradient">
              NEON BOWL
            </span>
          </h1>
          <p className="font-rajdhani text-[#00f5ff] text-sm md:text-lg mt-1 md:mt-2 tracking-widest uppercase opacity-80">
            Challenge the Machine
          </p>
        </header>

        {/* Game area */}
        <main className="flex-1 flex flex-col items-center justify-start px-2 md:px-4 pb-4 gap-3 md:gap-6">
          {/* Current turn indicator */}
          <div className="w-full max-w-4xl">
            <div className={`text-center py-2 md:py-3 px-4 md:px-6 rounded-lg border-2 transition-all duration-300 ${
              currentPlayer.isBot
                ? 'border-[#ff2d95] bg-[#ff2d95]/10 shadow-[0_0_30px_rgba(255,45,149,0.3)]'
                : 'border-[#00f5ff] bg-[#00f5ff]/10 shadow-[0_0_30px_rgba(0,245,255,0.3)]'
            }`}>
              <span className="font-orbitron text-base md:text-xl tracking-wider text-white">
                {gameOver ? getWinner() : `${currentPlayer.name}'S TURN`}
              </span>
              {!gameOver && (
                <span className="font-rajdhani text-xs md:text-sm ml-2 md:ml-4 opacity-70 text-gray-300">
                  Frame {currentFrameIndex + 1}
                </span>
              )}
            </div>
          </div>

          {/* Bowling lane visualization */}
          <BowlingLane
            pinsRemaining={pinsRemaining}
            isRolling={isRolling}
            pinsKnocked={pinsKnocked}
            showResult={showResult}
          />

          {/* Game controls */}
          {!gameOver && !currentPlayer.isBot && (
            <GameControls
              pinsRemaining={pinsRemaining}
              onRoll={roll}
              disabled={isRolling}
            />
          )}

          {/* Bot thinking indicator */}
          {!gameOver && currentPlayer.isBot && !isRolling && (
            <div className="flex items-center gap-3 py-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 md:w-3 md:h-3 bg-[#ff2d95] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 md:w-3 md:h-3 bg-[#ff2d95] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 md:w-3 md:h-3 bg-[#ff2d95] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="font-rajdhani text-[#ff2d95] text-sm md:text-base tracking-wide">Bot is calculating...</span>
            </div>
          )}

          {/* Game over / restart */}
          {gameOver && (
            <button
              onClick={resetGame}
              className="font-orbitron text-base md:text-lg px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-[#ff2d95] to-[#ff9500]
                         text-white rounded-lg shadow-[0_0_30px_rgba(255,45,149,0.5)]
                         hover:shadow-[0_0_50px_rgba(255,45,149,0.8)] transition-all duration-300
                         hover:scale-105 active:scale-95"
            >
              PLAY AGAIN
            </button>
          )}

          {/* Scoreboards */}
          <div className="w-full max-w-4xl grid grid-cols-1 gap-3 md:gap-4 mt-2">
            {players.map((player, idx) => (
              <Scoreboard
                key={player.name}
                player={player}
                isActive={idx === currentPlayerIndex && !gameOver}
                currentFrameIndex={getCurrentFrameIndex(player.frames)}
              />
            ))}
          </div>
        </main>

        {/* Footer */}
        <footer className="py-3 md:py-4 text-center">
          <p className="font-rajdhani text-[10px] md:text-xs text-gray-500 tracking-wide">
            Requested by @trustnoneisakey · Built by @clonkbot
          </p>
        </footer>
      </div>
    </div>
  );
}
