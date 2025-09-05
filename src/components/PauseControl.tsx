import { Button } from '@/components/ui/button';
import { Pause, Play } from 'lucide-react';

interface PauseControlProps {
  isPaused: boolean;
  onTogglePause: () => void;
  gameCompleted: boolean;
  level: number;
  levelRequirement: number;
}

export const PauseControl = ({ 
  isPaused, 
  onTogglePause, 
  gameCompleted, 
  level,
  levelRequirement 
}: PauseControlProps) => {
  const isUnlocked = level >= levelRequirement;

  if (!isUnlocked) {
    return (
      <div className="flex items-center gap-2 opacity-50">
        <Button 
          size="sm" 
          variant="outline" 
          disabled
          className="cursor-not-allowed"
        >
          <Pause className="h-4 w-4 mr-2" />
          Pause
        </Button>
        <span className="text-xs text-muted-foreground">
          Unlocks at Level {levelRequirement}
        </span>
      </div>
    );
  }

  return (
    <Button 
      onClick={onTogglePause} 
      size="sm" 
      variant={isPaused ? "default" : "outline"}
      disabled={gameCompleted}
      className={`transition-all duration-200 ${
        isPaused ? 'bg-destructive hover:bg-destructive/80' : ''
      }`}
    >
      {isPaused ? (
        <>
          <Play className="h-4 w-4 mr-2" />
          Resume
        </>
      ) : (
        <>
          <Pause className="h-4 w-4 mr-2" />
          Pause
        </>
      )}
    </Button>
  );
};