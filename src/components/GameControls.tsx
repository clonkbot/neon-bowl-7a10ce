interface GameControlsProps {
  pinsRemaining: number;
  onRoll: (pins: number) => void;
  disabled: boolean;
}

export default function GameControls({ pinsRemaining, onRoll, disabled }: GameControlsProps) {
  const pins = Array.from({ length: pinsRemaining + 1 }, (_, i) => i);

  return (
    <div className="w-full max-w-md mx-auto px-2">
      <p className="font-rajdhani text-center text-gray-400 text-xs md:text-sm mb-2 md:mb-3 uppercase tracking-wider">
        Select pins to knock down
      </p>

      <div className="flex flex-wrap justify-center gap-1.5 md:gap-2">
        {pins.map(pinCount => {
          const isStrikeChance = pinCount === 10 && pinsRemaining === 10;
          const isSpareChance = pinCount === pinsRemaining && pinsRemaining < 10 && pinsRemaining > 0;
          const isGutter = pinCount === 0;

          return (
            <button
              key={pinCount}
              onClick={() => onRoll(pinCount)}
              disabled={disabled}
              className={`
                relative w-9 h-9 md:w-12 md:h-12 rounded-lg font-orbitron text-sm md:text-lg font-bold
                transition-all duration-200 transform
                disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                ${isStrikeChance
                  ? 'bg-gradient-to-br from-[#ff9500] to-[#ff2d95] text-white shadow-[0_0_20px_rgba(255,149,0,0.5)] hover:shadow-[0_0_30px_rgba(255,149,0,0.8)] hover:scale-110'
                  : isSpareChance
                  ? 'bg-gradient-to-br from-[#00f5ff] to-[#7b2dff] text-white shadow-[0_0_20px_rgba(0,245,255,0.5)] hover:shadow-[0_0_30px_rgba(0,245,255,0.8)] hover:scale-110'
                  : isGutter
                  ? 'bg-[#2d1f4a] text-gray-400 border border-[#3d2f5a] hover:bg-[#3d2f5a] hover:scale-105'
                  : 'bg-[#1a0a2e] text-white border border-[#00f5ff]/30 hover:border-[#00f5ff] hover:bg-[#00f5ff]/10 hover:scale-105 hover:shadow-[0_0_15px_rgba(0,245,255,0.3)]'
                }
              `}
            >
              {pinCount}

              {/* Special labels */}
              {isStrikeChance && (
                <span className="absolute -top-5 md:-top-6 left-1/2 -translate-x-1/2 text-[8px] md:text-[10px] text-[#ff9500] font-rajdhani tracking-wider whitespace-nowrap">
                  STRIKE
                </span>
              )}
              {isSpareChance && (
                <span className="absolute -top-5 md:-top-6 left-1/2 -translate-x-1/2 text-[8px] md:text-[10px] text-[#00f5ff] font-rajdhani tracking-wider whitespace-nowrap">
                  SPARE
                </span>
              )}

              {/* Glow ring for special buttons */}
              {(isStrikeChance || isSpareChance) && !disabled && (
                <span className={`absolute inset-0 rounded-lg animate-ping opacity-30 ${
                  isStrikeChance ? 'bg-[#ff9500]' : 'bg-[#00f5ff]'
                }`} />
              )}
            </button>
          );
        })}
      </div>

      {/* Quick action hints */}
      <div className="flex justify-center gap-4 md:gap-6 mt-3 md:mt-4">
        <div className="flex items-center gap-1.5 md:gap-2">
          <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-[#ff9500]" />
          <span className="font-rajdhani text-[10px] md:text-xs text-gray-400">Strike</span>
        </div>
        <div className="flex items-center gap-1.5 md:gap-2">
          <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-[#00f5ff]" />
          <span className="font-rajdhani text-[10px] md:text-xs text-gray-400">Spare</span>
        </div>
        <div className="flex items-center gap-1.5 md:gap-2">
          <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-[#2d1f4a] border border-[#3d2f5a]" />
          <span className="font-rajdhani text-[10px] md:text-xs text-gray-400">Gutter</span>
        </div>
      </div>
    </div>
  );
}
