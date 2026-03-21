import { SPEED_OPTIONS } from '@/components/controls/constants';

type SpeedSelectorProps = {
  speed: number;
  onSpeedChange: (speed: number) => void;
};

export function SpeedSelector({ speed, onSpeedChange }: SpeedSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground">Speed</span>
      <div className="flex gap-1">
        {SPEED_OPTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onSpeedChange(s)}
            className={`
                  cursor-pointer rounded px-2 py-1 text-xs font-medium
                  transition-all duration-150
                  hover:scale-110 active:scale-95
                  ${
                    speed === s
                      ? 'bg-primary text-primary-foreground shadow-md shadow-primary/30'
                      : 'bg-secondary text-muted-foreground border border-border hover:bg-secondary/80 hover:text-foreground'
                  }
                `}
          >
            {s}x
          </button>
        ))}
      </div>
    </div>
  );
}
