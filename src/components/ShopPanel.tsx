import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Collectible {
  id: string;
  name: string;
  description: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  cost: number;
  owned: boolean;
  image: string;
}

interface ShopPanelProps {
  collectibles: Collectible[];
  coins: number;
  onBuyCollectible: (collectibleId: string) => void;
  gameCompleted: boolean;
  currentSeason: number;
}

const rarityColors = {
  common: 'bg-muted text-muted-foreground',
  rare: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  epic: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  legendary: 'bg-gold/20 text-gold border-gold/30'
};

export const ShopPanel = ({ collectibles, coins, onBuyCollectible, gameCompleted, currentSeason }: ShopPanelProps) => {
  return (
    <Card className="bg-game-card border-border/50">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-primary">
          {gameCompleted ? 'Final Collection' : `Season ${currentSeason} NFT Shop`}
        </CardTitle>
        <CardDescription>
          {gameCompleted 
            ? 'Your complete collection across all seasons' 
            : 'Collect all NFTs to advance to the next season'
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {collectibles.map((collectible) => {
          const canAfford = coins >= collectible.cost && !collectible.owned && !gameCompleted;
          
          return (
            <Card 
              key={collectible.id} 
              className={`bg-background/50 border-border/30 transition-all duration-300 ${
                collectible.owned ? 'ring-2 ring-success/50' : ''
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start space-x-4">
                  <div className="text-4xl">{collectible.image}</div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-semibold text-foreground">{collectible.name}</h3>
                      <Badge 
                        className={`text-xs ${rarityColors[collectible.rarity]}`}
                        variant="outline"
                      >
                        {collectible.rarity}
                      </Badge>
                      {collectible.owned && (
                        <Badge variant="default" className="bg-success text-success-foreground">
                          Owned
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{collectible.description}</p>
                    
                    <div className="flex justify-between items-center">
                      <div className="text-sm font-medium text-coin">
                        {collectible.cost.toLocaleString()} Coins
                      </div>
                      <Button
                        onClick={() => onBuyCollectible(collectible.id)}
                        disabled={!canAfford}
                        size="sm"
                        variant={canAfford ? "default" : "secondary"}
                      >
                        {collectible.owned ? 'Owned' : gameCompleted ? 'Final' : 'Buy'}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </CardContent>
    </Card>
  );
};