import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Buff } from '@/hooks/useGameState';

interface BuffPanelProps {
  buffs: Buff[];
  coins: number;
  onBuyBuff: (buffId: string) => void;
  gameCompleted: boolean;
}

export const BuffPanel = ({ buffs, coins, onBuyBuff, gameCompleted }: BuffPanelProps) => {
  const formatTime = (ms: number) => {
    const seconds = Math.ceil(ms / 1000);
    return `${seconds}s`;
  };

  const getCooldownPercentage = (buff: Buff) => {
    if (!buff.lastUsed) return 100;
    const now = Date.now();
    const timeSinceLastUse = now - buff.lastUsed;
    const percentage = Math.min(100, (timeSinceLastUse / buff.cooldown) * 100);
    return percentage;
  };

  return (
    <Card className="bg-game-card border-border/50">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-primary">
          {gameCompleted ? 'Buffs (Final)' : 'Power Buffs'}
        </CardTitle>
        <CardDescription>
          {gameCompleted 
            ? 'Your final buff configuration' 
            : 'Temporary boosts to enhance your coin generation'
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {buffs.map((buff) => {
          const canAfford = coins >= buff.cost && !gameCompleted;
          const isOnCooldown = buff.lastUsed && (Date.now() - buff.lastUsed) < buff.cooldown;
          const cooldownPercentage = getCooldownPercentage(buff);
          
          return (
            <Card key={buff.id} className="bg-background/50 border-border/30">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-foreground">{buff.name}</h3>
                      {buff.isActive && (
                        <Badge variant="default" className="bg-success/20 text-success border-success/30 animate-pulse">
                          Active
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{buff.description}</p>
                    
                    {buff.isActive && buff.duration > 0 && (
                      <div className="mb-2">
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                          <span>Time remaining</span>
                          <span>{formatTime(buff.remainingTime)}</span>
                        </div>
                        <Progress 
                          value={(buff.remainingTime / buff.duration) * 100} 
                          className="h-2"
                        />
                      </div>
                    )}
                    
                    {buff.isActive && buff.effect === 'mega-click' && (
                      <div className="mb-2">
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                          <span>Clicks remaining</span>
                          <span>{buff.remainingTime}</span>
                        </div>
                        <Progress 
                          value={(buff.remainingTime / 10) * 100} 
                          className="h-2"
                        />
                      </div>
                    )}
                    
                    {isOnCooldown && !buff.isActive && (
                      <div className="mb-2">
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                          <span>Cooldown</span>
                          <span>{formatTime(buff.cooldown - (Date.now() - buff.lastUsed))}</span>
                        </div>
                        <Progress 
                          value={cooldownPercentage} 
                          className="h-2"
                        />
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="text-sm font-medium text-coin">
                    {buff.cost.toLocaleString()} Coins
                  </div>
                  <Button
                    onClick={() => onBuyBuff(buff.id)}
                    disabled={!canAfford || isOnCooldown || buff.isActive}
                    size="sm"
                    variant={canAfford && !isOnCooldown && !buff.isActive ? "default" : "secondary"}
                  >
                    {gameCompleted 
                      ? 'Final' 
                      : buff.isActive 
                        ? 'Active' 
                        : isOnCooldown 
                          ? 'Cooldown' 
                          : 'Activate'
                    }
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </CardContent>
    </Card>
  );
};