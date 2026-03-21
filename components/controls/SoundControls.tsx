import { ChevronDown, Volume2, VolumeX } from 'lucide-react';
import type { SoundPreset } from '@/app/lib/algorithm-sound';
import { SOUND_PRESET_LABELS, SOUND_PRESETS } from '@/app/lib/algorithm-sound';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type SoundControlsProps = {
  soundEnabled: boolean;
  soundPreset: SoundPreset;
  onSoundChange: (enabled: boolean) => void;
  onSoundPresetChange?: (preset: SoundPreset) => void;
};

export function SoundControls({
  soundEnabled,
  soundPreset,
  onSoundChange,
  onSoundPresetChange,
}: SoundControlsProps) {
  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={() => onSoundChange(!soundEnabled)}
        className={`
                flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium
                transition-all duration-150 hover:scale-105 active:scale-95
                ${
                  soundEnabled
                    ? 'border-primary bg-primary/15 text-primary'
                    : 'border-border bg-secondary text-muted-foreground hover:bg-secondary/80'
                }
              `}
        title={soundEnabled ? 'Sound on' : 'Sound off'}
      >
        {soundEnabled ? (
          <Volume2 className="h-4 w-4" aria-hidden />
        ) : (
          <VolumeX className="h-4 w-4" aria-hidden />
        )}
        <span>{soundEnabled ? 'Sound' : 'Mute'}</span>
      </button>
      {soundEnabled && onSoundPresetChange && (
        <DropdownMenu>
          <DropdownMenuTrigger
            className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-border bg-secondary px-3 py-2 text-xs font-medium text-foreground transition-all hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-primary/50"
            title="Synthesizer sound"
          >
            {SOUND_PRESET_LABELS[soundPreset]}
            <ChevronDown className="h-3.5 w-3.5 opacity-70" aria-hidden />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuRadioGroup
              value={soundPreset}
              onValueChange={(value) =>
                onSoundPresetChange(value as SoundPreset)
              }
            >
              {SOUND_PRESETS.map((p) => (
                <DropdownMenuRadioItem key={p} value={p}>
                  {SOUND_PRESET_LABELS[p]}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
