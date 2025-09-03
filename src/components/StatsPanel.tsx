import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface StatsPanelProps {
  coins: number;
  coinsPerClick: number;
  coinsPerSecond: number;
  totalClicks: number;
  ownedCollectibles: number;
  totalCollectibles: number;
}

export const StatsPanel = ({ 
  coins, 
  coinsPerClick, 
  coinsPerSecond, 
  totalClicks,
  ownedCollectibles,
  totalCollectibles 
}: StatsPanelProps) => {
  const stats = [
    { label: 'Total Coins', value: coins.toLocaleString() },
    { label: 'Per Click', value: `+${coinsPerClick}` },
    { label: 'Per Second', value: `+${coinsPerSecond}` },
    { label: 'Total Clicks', value: totalClicks.toLocaleString() },
    { label: 'Collection', value: `${ownedCollectibles}/${totalCollectibles}` }
  ];

  return (
    <Card className="bg-game-card border-border/50">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-primary">Stats</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {stats.map((stat, index) => (
          <div key={index} className="flex justify-between items-center py-1">
            <span className="text-sm text-muted-foreground">{stat.label}</span>
            <span className="font-semibold text-foreground">{stat.value}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};