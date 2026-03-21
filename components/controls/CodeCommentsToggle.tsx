import { MessageSquare } from 'lucide-react';
import type { CodeCommentsControl } from '@/components/controls/types';

type CodeCommentsToggleProps = {
  control: CodeCommentsControl;
};

export function CodeCommentsToggle({ control }: CodeCommentsToggleProps) {
  const { show, onChange } = control;
  return (
    <button
      type="button"
      onClick={() => onChange(!show)}
      className={`
              flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium
              transition-all duration-150 hover:scale-105 active:scale-95
              ${
                show
                  ? 'border-primary bg-primary/15 text-primary'
                  : 'border-border bg-secondary text-muted-foreground hover:bg-secondary/80'
              }
            `}
      title={
        show
          ? 'Hide // and block comments in code'
          : 'Show comments in code'
      }
    >
      <MessageSquare className="h-4 w-4 shrink-0" aria-hidden />
      <span>{show ? 'Comments' : 'No comments'}</span>
    </button>
  );
}
