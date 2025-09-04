import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface StatsPanelProps {
  coins: number;
  coinsPerClick: number;
  coinsPerSecond: number;
  totalClicks: number;
  ownedCollectibles: number;
  totalCollectibles: number;
  currentSeason: number;
  upgradeSlots: number;
  usedUpgradeSlots: number;
  gameCompleted: boolean;
  level: number;
  experience: number;
}

export const StatsPanel = ({ 
  coins, 
  coinsPerClick, 
  coinsPerSecond, 
  totalClicks, 
  ownedCollectibles, 
  totalCollectibles, 
  currentSeason, 
  upgradeSlots, 
  usedUpgradeSlots, 
  gameCompleted,
  level,
  experience
}: StatsPanelProps) => {
  const stats = [
    { label: 'Season', value: gameCompleted ? 'COMPLETED!' : `${currentSeason}/5` },
    { label: 'Player Level', value: level.toString() },
    { label: 'Experience', value: experience.toLocaleString() },
    { label: 'Total Coins', value: coins.toLocaleString() },
    { label: 'Per Click', value: `+${coinsPerClick}` },
    { label: 'Per Second', value: `+${coinsPerSecond}` },
    { label: 'Total Clicks', value: totalClicks.toLocaleString() },
    { label: 'Collection', value: `${ownedCollectibles}/${totalCollectibles}` },
    { label: 'Upgrade Slots', value: `${usedUpgradeSlots}/${upgradeSlots}` }
  ];

  return (
    <Card className="bg-game-card border-border/50">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-primary">
          {gameCompleted ? 'Game Completed!' : 'Stats'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {stats.map((stat, index) => (
          <div key={index} className="flex justify-between items-center py-1">
            <span className="text-sm text-muted-foreground">{stat.label}</span>
            <span className={`font-semibold ${gameCompleted && stat.label === 'Season' ? 'text-gold animate-pulse' : 'text-foreground'}`}>
              {stat.value}
            </span>
          </div>
        ))}
        {gameCompleted && (
          <div className="mt-4 p-3 bg-gold/20 border border-gold/30 rounded-lg text-center">
            <div className="text-gold font-bold">🎉 Congratulations! 🎉</div>
            <div className="text-sm text-muted-foreground mt-1">
              You've completed all 5 seasons!
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};