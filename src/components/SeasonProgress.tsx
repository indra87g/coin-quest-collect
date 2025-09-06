import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface SeasonProgressProps {
  currentSeason: number;
  gameCompleted: boolean;
  ownedCollectibles: number;
  totalCollectibles: number;
}

export const SeasonProgress = ({ 
  currentSeason, 
  gameCompleted, 
  ownedCollectibles, 
  totalCollectibles 
}: SeasonProgressProps) => {
  const progress = (ownedCollectibles / totalCollectibles) * 100;
  const isEndlessMode = currentSeason === 999;
  
  return (
    <Card className="bg-game-card border-border/50">
      <CardHeader>
        <CardTitle className="text-lg font-bold text-primary flex items-center gap-2">
          Season Progress
          {isEndlessMode ? (
            <Badge className="bg-endless text-endless-foreground">ENDLESS</Badge>
          ) : gameCompleted ? (
            <Badge className="bg-gold text-gold-foreground">COMPLETED</Badge>
          ) : (
            <Badge variant="outline">{currentSeason}/5</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isEndlessMode ? (
          <div className="text-center space-y-2">
            <div className="text-2xl">♾️</div>
            <div className="text-sm text-muted-foreground">
              Endless Mode Unlocked!
            </div>
            <div className="text-xs text-muted-foreground">
              Compete globally for the highest coin count!
            </div>
          </div>
        ) : gameCompleted ? (
          <div className="text-center space-y-2">
            <div className="text-2xl">👑</div>
            <div className="text-sm text-muted-foreground">
              All seasons conquered!
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Collection Progress</span>
              <span className="font-semibold">{ownedCollectibles}/{totalCollectibles}</span>
            </div>
            
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-primary to-primary-glow h-2 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            
            {progress === 100 && (
              <div className="text-center text-success font-semibold animate-pulse">
                Ready to advance! Complete your collection!
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};