import { Player } from '../App';

interface ScoreboardProps {
  player: Player;
  isActive: boolean;
  currentFrameIndex: number;
}

export default function Scoreboard({ player, isActive, currentFrameIndex }: ScoreboardProps) {
  const getRollDisplay = (frame: typeof player.frames[0], rollIndex: number, frameIndex: number): string => {
    const roll = frame.rolls[rollIndex];
    if (roll === undefined) return '';

    const isLastFrame = frameIndex === 9;

    // First roll
    if (rollIndex === 0) {
      if (roll === 10) return 'X';
      if (roll === 0) return '-';
      return roll.toString();
    }

    // Second roll
    if (rollIndex === 1) {
      if (isLastFrame) {
        if (roll === 10) return 'X';
        if (frame.rolls[0] !== 10 && frame.rolls[0] + roll === 10) return '/';
        if (roll === 0) return '-';
        return roll.toString();
      }
      if (frame.rolls[0] + roll === 10) return '/';
      if (roll === 0) return '-';
      return roll.toString();
    }

    // Third roll (10th frame only)
    if (rollIndex === 2) {
      if (roll === 10) return 'X';
      const prevRoll = frame.rolls[1];
      if (prevRoll !== 10 && prevRoll + roll === 10) return '/';
      if (roll === 0) return '-';
      return roll.toString();
    }

    return '';
  };

  const isStrike = (frame: typeof player.frames[0], rollIndex: number, frameIndex: number): boolean => {
    const roll = frame.rolls[rollIndex];
    if (roll !== 10) return false;
    if (frameIndex === 9) return true;
    return rollIndex === 0;
  };

  const isSpare = (frame: typeof player.frames[0], rollIndex: number, frameIndex: number): boolean => {
    if (rollIndex === 0) return false;
    const isLastFrame = frameIndex === 9;

    if (rollIndex === 1) {
      if (isLastFrame && frame.rolls[0] === 10) return false;
      return frame.rolls[0] + frame.rolls[1] === 10;
    }

    if (rollIndex === 2) {
      return frame.rolls[1] !== 10 && frame.rolls[1] + frame.rolls[2] === 10;
    }

    return false;
  };

  return (
    <div className={`rounded-xl border-2 transition-all duration-300 overflow-hidden ${
      isActive
        ? player.isBot
          ? 'border-[#ff2d95] shadow-[0_0_20px_rgba(255,45,149,0.3)]'
          : 'border-[#00f5ff] shadow-[0_0_20px_rgba(0,245,255,0.3)]'
        : 'border-[#2d2f4a] shadow-none'
    }`}>
      {/* Player name header */}
      <div className={`px-3 md:px-4 py-1.5 md:py-2 flex items-center justify-between ${
        player.isBot ? 'bg-[#ff2d95]/20' : 'bg-[#00f5ff]/20'
      }`}>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 md:w-3 md:h-3 rounded-full ${
            isActive ? 'animate-pulse' : ''
          } ${player.isBot ? 'bg-[#ff2d95]' : 'bg-[#00f5ff]'}`} />
          <span className="font-orbitron text-sm md:text-lg font-bold tracking-wider text-white">
            {player.name}
          </span>
        </div>
        <span className="font-rajdhani text-base md:text-xl font-bold text-white">
          {player.frames[9].score ?? '--'}
        </span>
      </div>

      {/* Frames */}
      <div className="bg-[#1a0a2e]/80 p-1.5 md:p-2">
        <div className="grid grid-cols-10 gap-0.5 md:gap-1">
          {player.frames.map((frame, frameIndex) => {
            const isLastFrame = frameIndex === 9;
            const isCurrentFrame = frameIndex === currentFrameIndex && isActive;

            return (
              <div
                key={frameIndex}
                className={`relative rounded transition-all duration-200 ${
                  isCurrentFrame
                    ? player.isBot
                      ? 'bg-[#ff2d95]/30 ring-1 md:ring-2 ring-[#ff2d95]'
                      : 'bg-[#00f5ff]/30 ring-1 md:ring-2 ring-[#00f5ff]'
                    : 'bg-[#2d1f4a]/50'
                }`}
              >
                {/* Frame number */}
                <div className="text-center py-0.5 border-b border-[#3d2f5a]/50">
                  <span className="font-rajdhani text-[8px] md:text-xs text-gray-500">
                    {frameIndex + 1}
                  </span>
                </div>

                {/* Rolls */}
                <div className={`flex ${isLastFrame ? 'justify-center' : 'justify-end'} gap-0 border-b border-[#3d2f5a]/50`}>
                  {isLastFrame ? (
                    // 10th frame - 3 boxes
                    <>
                      {[0, 1, 2].map(rollIdx => {
                        const display = getRollDisplay(frame, rollIdx, frameIndex);
                        const strike = isStrike(frame, rollIdx, frameIndex);
                        const spare = isSpare(frame, rollIdx, frameIndex);

                        return (
                          <div
                            key={rollIdx}
                            className={`w-4 h-4 md:w-6 md:h-7 flex items-center justify-center text-[10px] md:text-sm font-bold
                                       ${rollIdx < 2 ? 'border-r border-[#3d2f5a]/50' : ''}
                                       ${strike ? 'text-[#ff9500]' : spare ? 'text-[#00f5ff]' : 'text-white'}`}
                          >
                            {display}
                          </div>
                        );
                      })}
                    </>
                  ) : (
                    // Regular frame - 2 boxes stacked
                    <>
                      <div className="flex-1" />
                      <div className="flex flex-col">
                        {[0, 1].map(rollIdx => {
                          const display = getRollDisplay(frame, rollIdx, frameIndex);
                          const strike = isStrike(frame, rollIdx, frameIndex);
                          const spare = isSpare(frame, rollIdx, frameIndex);

                          return (
                            <div
                              key={rollIdx}
                              className={`w-4 h-3 md:w-5 md:h-4 flex items-center justify-center text-[9px] md:text-xs font-bold
                                         ${rollIdx === 0 ? 'border-b border-[#3d2f5a]/50' : ''}
                                         ${strike ? 'text-[#ff9500]' : spare ? 'text-[#00f5ff]' : 'text-white'}`}
                            >
                              {display}
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>

                {/* Frame score */}
                <div className="text-center py-0.5 md:py-1">
                  <span className="font-rajdhani text-[10px] md:text-sm font-bold text-white">
                    {frame.score ?? ''}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
