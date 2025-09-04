import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface LevelPanelProps {
  level: number;
  experience: number;
  gameCompleted: boolean;
}

export const LevelPanel = ({ level, experience, gameCompleted }: LevelPanelProps) => {
  const expToNext = level * 100;
  const expProgress = (experience / expToNext) * 100;
  
  return (
    <Card className="bg-game-card border-border/50">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold text-primary">
            Player Level
          </CardTitle>
          <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30">
            Level {level}
          </Badge>
        </div>
        <CardDescription>
          {gameCompleted 
            ? 'Maximum level achieved!' 
            : 'Gain experience by clicking and auto-generation'
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!gameCompleted && (
          <>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Experience</span>
                <span className="font-medium text-foreground">
                  {experience.toLocaleString()} / {expToNext.toLocaleString()} XP
                </span>
              </div>
              <Progress value={expProgress} className="h-3" />
            </div>
            
            <div className="text-center">
              <div className="text-sm text-muted-foreground mb-1">
                XP to next level
              </div>
              <div className="text-lg font-semibold text-primary">
                {(expToNext - experience).toLocaleString()} XP
              </div>
            </div>
          </>
        )}
        
        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border/30">
          <div className="text-center">
            <div className="text-sm text-muted-foreground">Click XP</div>
            <div className="text-lg font-semibold text-success">+1</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-muted-foreground">Auto XP Rate</div>
            <div className="text-lg font-semibold text-info">+10%</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};