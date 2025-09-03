import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Upgrade {
  id: string;
  name: string;
  description: string;
  cost: number;
  multiplier: number;
  owned: number;
  maxOwned?: number;
}

interface UpgradePanelProps {
  upgrades: Upgrade[];
  coins: number;
  onBuyUpgrade: (upgradeId: string) => void;
  gameCompleted: boolean;
  upgradeSlots: number;
  usedUpgradeSlots: number;
}

export const UpgradePanel = ({ upgrades, coins, onBuyUpgrade, gameCompleted, upgradeSlots, usedUpgradeSlots }: UpgradePanelProps) => {
  return (
    <Card className="bg-game-card border-border/50">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-primary">
          {gameCompleted ? 'Upgrades (Final)' : 'Upgrades'}
        </CardTitle>
        <CardDescription>
          {gameCompleted 
            ? 'Your final upgrade configuration' 
            : `Improve your coin generation (${usedUpgradeSlots}/${upgradeSlots} slots used)`
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {upgrades.map((upgrade) => {
          const canAfford = coins >= upgrade.cost && !gameCompleted;
          const isMaxed = upgrade.maxOwned && upgrade.owned >= upgrade.maxOwned;
          const slotsExhausted = usedUpgradeSlots >= upgradeSlots;
          
          return (
            <Card key={upgrade.id} className="bg-background/50 border-border/30">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{upgrade.name}</h3>
                    <p className="text-sm text-muted-foreground">{upgrade.description}</p>
                  </div>
                  {upgrade.owned > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      Owned: {upgrade.owned}
                      {upgrade.maxOwned && `/${upgrade.maxOwned}`}
                    </Badge>
                  )}
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="text-sm font-medium text-coin">
                    {upgrade.cost.toLocaleString()} Coins
                  </div>
                  <Button
                    onClick={() => onBuyUpgrade(upgrade.id)}
                    disabled={!canAfford || isMaxed || slotsExhausted}
                    size="sm"
                    variant={canAfford && !isMaxed && !slotsExhausted ? "default" : "secondary"}
                  >
                    {gameCompleted ? 'Final' : isMaxed ? 'MAX' : slotsExhausted ? 'Full' : 'Buy'}
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