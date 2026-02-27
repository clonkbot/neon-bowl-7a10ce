import { useMemo } from 'react';

interface BowlingLaneProps {
  pinsRemaining: number;
  isRolling: boolean;
  pinsKnocked: number | null;
  showResult: boolean;
}

const PIN_POSITIONS = [
  { row: 0, col: 0 }, // Pin 1 (front)
  { row: 1, col: -0.5 }, // Pin 2
  { row: 1, col: 0.5 }, // Pin 3
  { row: 2, col: -1 }, // Pin 4
  { row: 2, col: 0 }, // Pin 5
  { row: 2, col: 1 }, // Pin 6
  { row: 3, col: -1.5 }, // Pin 7
  { row: 3, col: -0.5 }, // Pin 8
  { row: 3, col: 0.5 }, // Pin 9
  { row: 3, col: 1.5 }, // Pin 10
];

export default function BowlingLane({ pinsRemaining, isRolling, pinsKnocked, showResult }: BowlingLaneProps) {
  const standingPins = useMemo(() => {
    // Determine which pins are standing based on pinsRemaining
    const standing = new Array(10).fill(false);
    let count = pinsRemaining;

    // Fill from back to front for realistic appearance
    const fillOrder = [9, 8, 7, 6, 5, 4, 3, 2, 1, 0];
    for (const idx of fillOrder) {
      if (count > 0) {
        standing[idx] = true;
        count--;
      }
    }
    return standing;
  }, [pinsRemaining]);

  const getResultText = () => {
    if (pinsKnocked === null) return '';
    if (pinsKnocked === 10 && pinsRemaining === 10) return 'STRIKE!';
    if (pinsKnocked === pinsRemaining && pinsRemaining < 10) return 'SPARE!';
    if (pinsKnocked === 0) return 'GUTTER!';
    return `${pinsKnocked} PINS`;
  };

  const isStrike = pinsKnocked === 10 && pinsRemaining === 10;
  const isSpare = pinsKnocked === pinsRemaining && pinsRemaining < 10 && pinsKnocked !== 0;

  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Lane container */}
      <div className="relative bg-gradient-to-b from-[#1a0a2e] to-[#2d1f4a] rounded-2xl p-3 md:p-6 border border-[#3d2f5a] shadow-[inset_0_0_60px_rgba(0,0,0,0.5)]">
        {/* Lane surface */}
        <div className="relative bg-gradient-to-b from-[#8B4513] via-[#A0522D] to-[#8B4513] rounded-xl overflow-hidden">
          {/* Lane arrows */}
          <div className="absolute top-8 md:top-12 left-1/2 -translate-x-1/2 flex gap-2 md:gap-3">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-1.5 h-3 md:w-2 md:h-4 bg-gradient-to-b from-[#ff2d95] to-transparent opacity-60"
                style={{ transform: 'perspective(100px) rotateX(45deg)' }}
              />
            ))}
          </div>

          {/* Lane dots */}
          <div className="absolute top-16 md:top-24 left-1/2 -translate-x-1/2 flex gap-3 md:gap-4">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-[#2d1f4a] opacity-40" />
            ))}
          </div>

          {/* Gutters */}
          <div className="absolute inset-y-0 left-0 w-2 md:w-3 bg-gradient-to-r from-[#1a0a2e] to-transparent" />
          <div className="absolute inset-y-0 right-0 w-2 md:w-3 bg-gradient-to-l from-[#1a0a2e] to-transparent" />

          {/* Pin deck */}
          <div className="relative h-48 md:h-72 flex flex-col items-center justify-end pb-4 md:pb-8">
            {/* Pins */}
            <div className="relative w-32 h-24 md:w-48 md:h-36">
              {PIN_POSITIONS.map((pos, idx) => {
                const isStanding = standingPins[idx];
                const pinSize = 'w-4 h-6 md:w-6 md:h-10';
                const left = `calc(50% + ${pos.col * 14}px)`;
                const leftMd = `calc(50% + ${pos.col * 20}px)`;
                const top = `${pos.row * 20}px`;
                const topMd = `${pos.row * 28}px`;

                return (
                  <div
                    key={idx}
                    className={`absolute ${pinSize} transition-all duration-500 ${
                      isStanding ? 'opacity-100 scale-100' : 'opacity-0 scale-0 rotate-45'
                    }`}
                    style={{
                      left: left,
                      top: top,
                      transform: 'translateX(-50%)',
                    }}
                  >
                    {/* Pin shape */}
                    <div className="relative w-full h-full">
                      {/* Pin head */}
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 md:w-3 md:h-3 rounded-full bg-gradient-to-br from-white to-gray-200 shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
                      {/* Pin neck */}
                      <div className="absolute top-1.5 md:top-2 left-1/2 -translate-x-1/2 w-1 h-1 md:w-1.5 md:h-1.5 bg-gradient-to-b from-white to-gray-300" />
                      {/* Pin body */}
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-3 md:w-4 md:h-5 rounded-b-full bg-gradient-to-br from-white to-gray-200 shadow-[0_0_15px_rgba(255,255,255,0.6)]">
                        {/* Red stripe */}
                        <div className="absolute top-0.5 left-0.5 right-0.5 h-0.5 md:h-1 bg-[#ff2d95] rounded-full" />
                      </div>
                      {/* Glow effect */}
                      <div className="absolute inset-0 rounded-full bg-white/20 blur-sm" />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bowling ball animation */}
            {isRolling && (
              <div className="absolute bottom-0 animate-roll-ball">
                <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-[#1a1a2e] via-[#2d2d4a] to-[#0a0a12] shadow-[0_0_20px_rgba(0,245,255,0.5),inset_-2px_-2px_4px_rgba(255,255,255,0.1)]">
                  {/* Finger holes */}
                  <div className="absolute top-1.5 md:top-2 left-2 md:left-3 w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-[#0a0a12]" />
                  <div className="absolute top-1.5 md:top-2 right-2 md:right-3 w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-[#0a0a12]" />
                  <div className="absolute top-3 md:top-4 left-1/2 -translate-x-1/2 w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-[#0a0a12]" />
                </div>
                {/* Ball trail */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 md:w-24 md:h-24 rounded-full bg-gradient-to-t from-[#00f5ff] to-transparent opacity-30 blur-md -z-10" />
              </div>
            )}
          </div>
        </div>

        {/* Result display */}
        {showResult && pinsKnocked !== null && (
          <div className={`absolute inset-0 flex items-center justify-center z-20 pointer-events-none ${
            isStrike || isSpare ? 'animate-result-flash' : 'animate-fade-in'
          }`}>
            <div className={`font-orbitron text-2xl md:text-4xl font-bold tracking-wider px-4 md:px-6 py-2 md:py-3 rounded-lg ${
              isStrike
                ? 'text-[#ff9500] bg-[#ff9500]/20 border-2 border-[#ff9500] shadow-[0_0_40px_rgba(255,149,0,0.6)]'
                : isSpare
                ? 'text-[#00f5ff] bg-[#00f5ff]/20 border-2 border-[#00f5ff] shadow-[0_0_40px_rgba(0,245,255,0.6)]'
                : 'text-white bg-white/10 border-2 border-white/30'
            }`}>
              {getResultText()}
            </div>
          </div>
        )}

        {/* Strike/Spare celebration effects */}
        {showResult && isStrike && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-8 md:w-2 md:h-12 bg-gradient-to-b from-[#ff9500] to-transparent animate-confetti"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 500}ms`,
                  transform: `rotate(${Math.random() * 360}deg)`,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
