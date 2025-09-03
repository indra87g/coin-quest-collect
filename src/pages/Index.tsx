import { useState, useEffect, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

interface Collectible {
  id: string;
  name: string;
  description: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  cost: number;
  owned: boolean;
  image: string;
}

interface GameState {
  coins: number;
  coinsPerClick: number;
  coinsPerSecond: number;
  totalClicks: number;
  upgrades: Upgrade[];
  collectibles: Collectible[];
}

const INITIAL_UPGRADES: Upgrade[] = [
  {
    id: 'click-multiplier',
    name: 'Better Cursor',
    description: 'Doubles your clicking power',
    cost: 10,
    multiplier: 2,
    owned: 0,
    maxOwned: 10
  },
  {
    id: 'auto-clicker',
    name: 'Auto Clicker',
    description: 'Generates 1 coin per second',
    cost: 100,
    multiplier: 1,
    owned: 0,
    maxOwned: 5
  },
  {
    id: 'coin-factory',
    name: 'Coin Factory',
    description: 'Generates 10 coins per second',
    cost: 1000,
    multiplier: 10,
    owned: 0,
    maxOwned: 3
  }
];

const INITIAL_COLLECTIBLES: Collectible[] = [
  {
    id: 'bronze-coin',
    name: 'Bronze Coin',
    description: 'A simple bronze coin',
    rarity: 'common',
    cost: 50,
    owned: false,
    image: '🥉'
  },
  {
    id: 'silver-coin',
    name: 'Silver Coin',
    description: 'A shiny silver coin',
    rarity: 'rare',
    cost: 250,
    owned: false,
    image: '🥈'
  },
  {
    id: 'gold-coin',
    name: 'Gold Coin',
    description: 'A precious gold coin',
    rarity: 'epic',
    cost: 1000,
    owned: false,
    image: '🥇'
  },
  {
    id: 'diamond-coin',
    name: 'Diamond Coin',
    description: 'The ultimate treasure',
    rarity: 'legendary',
    cost: 5000,
    owned: false,
    image: '💎'
  }
];

const rarityColors = {
  common: 'bg-muted text-muted-foreground',
  rare: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  epic: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  legendary: 'bg-gold/20 text-gold border-gold/30'
};

const SAVE_KEY = 'idle-coin-clicker-save';

const Index = () => {
  const [gameState, setGameState] = useState<GameState>(() => {
    const saved = localStorage.getItem(SAVE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          upgrades: INITIAL_UPGRADES.map(upgrade => {
            const savedUpgrade = parsed.upgrades?.find((u: Upgrade) => u.id === upgrade.id);
            return savedUpgrade ? { ...upgrade, owned: savedUpgrade.owned } : upgrade;
          }),
          collectibles: INITIAL_COLLECTIBLES.map(collectible => {
            const savedCollectible = parsed.collectibles?.find((c: Collectible) => c.id === collectible.id);
            return savedCollectible ? { ...collectible, owned: savedCollectible.owned } : collectible;
          })
        };
      } catch (e) {
        console.error('Failed to load save:', e);
      }
    }
    return {
      coins: 0,
      coinsPerClick: 1,
      coinsPerSecond: 0,
      totalClicks: 0,
      upgrades: INITIAL_UPGRADES,
      collectibles: INITIAL_COLLECTIBLES
    };
  });

  const [isClicking, setIsClicking] = useState(false);

  // Save to localStorage whenever gameState changes
  useEffect(() => {
    localStorage.setItem(SAVE_KEY, JSON.stringify(gameState));
  }, [gameState]);

  // Auto-clicker effect
  useEffect(() => {
    if (gameState.coinsPerSecond > 0) {
      const interval = setInterval(() => {
        setGameState(prev => ({
          ...prev,
          coins: prev.coins + prev.coinsPerSecond
        }));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [gameState.coinsPerSecond]);

  const clickCoin = useCallback(() => {
    setIsClicking(true);
    setGameState(prev => ({
      ...prev,
      coins: prev.coins + prev.coinsPerClick,
      totalClicks: prev.totalClicks + 1
    }));
    setTimeout(() => setIsClicking(false), 300);
  }, []);

  const buyUpgrade = useCallback((upgradeId: string) => {
    setGameState(prev => {
      const upgrade = prev.upgrades.find(u => u.id === upgradeId);
      if (!upgrade || prev.coins < upgrade.cost || (upgrade.maxOwned && upgrade.owned >= upgrade.maxOwned)) {
        return prev;
      }

      const newUpgrades = prev.upgrades.map(u => {
        if (u.id === upgradeId) {
          return {
            ...u,
            owned: u.owned + 1,
            cost: Math.floor(u.cost * 1.5)
          };
        }
        return u;
      });

      let newCoinsPerClick = prev.coinsPerClick;
      let newCoinsPerSecond = prev.coinsPerSecond;

      if (upgradeId === 'click-multiplier') {
        newCoinsPerClick = prev.coinsPerClick + upgrade.multiplier;
      } else if (upgradeId === 'auto-clicker' || upgradeId === 'coin-factory') {
        newCoinsPerSecond = prev.coinsPerSecond + upgrade.multiplier;
      }

      return {
        ...prev,
        coins: prev.coins - upgrade.cost,
        coinsPerClick: newCoinsPerClick,
        coinsPerSecond: newCoinsPerSecond,
        upgrades: newUpgrades
      };
    });
  }, []);

  const buyCollectible = useCallback((collectibleId: string) => {
    setGameState(prev => {
      const collectible = prev.collectibles.find(c => c.id === collectibleId);
      if (!collectible || prev.coins < collectible.cost || collectible.owned) {
        return prev;
      }

      const newCollectibles = prev.collectibles.map(c => {
        if (c.id === collectibleId) {
          return { ...c, owned: true };
        }
        return c;
      });

      return {
        ...prev,
        coins: prev.coins - collectible.cost,
        collectibles: newCollectibles
      };
    });
  }, []);

  const ownedCollectibles = gameState.collectibles.filter(c => c.owned).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-game-bg to-background">
      <div className="container mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Game Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Coin Clicker */}
            <div className="flex flex-col items-center space-y-6">
              <div className="text-center">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-coin to-gold bg-clip-text text-transparent mb-2">
                  Idle Coin Clicker
                </h1>
                <div className="text-2xl font-semibold text-foreground">
                  {gameState.coins.toLocaleString()} Coins
                </div>
                <div className="text-sm text-muted-foreground">
                  +{gameState.coinsPerClick} per click
                </div>
              </div>
              
              <Button
                onClick={clickCoin}
                size="lg"
                className={`
                  w-32 h-32 rounded-full text-6xl
                  bg-gradient-to-br from-coin to-gold
                  hover:from-gold hover:to-coin
                  border-4 border-gold/50
                  shadow-2xl hover:shadow-coin/50
                  transition-all duration-200
                  ${isClicking ? 'animate-bounce-coin' : 'animate-float'}
                `}
              >
                🪙
              </Button>
              
              <div className="text-center text-muted-foreground">
                Click the coin to earn money!
              </div>
            </div>
            
            {/* Tabs for Upgrades and Shop */}
            <Tabs defaultValue="upgrades" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-game-card">
                <TabsTrigger value="upgrades" className="data-[state=active]:bg-primary">
                  Upgrades
                </TabsTrigger>
                <TabsTrigger value="shop" className="data-[state=active]:bg-primary">
                  NFT Shop
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="upgrades" className="mt-4">
                <Card className="bg-game-card border-border/50">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-primary">Upgrades</CardTitle>
                    <CardDescription>Improve your coin generation</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {gameState.upgrades.map((upgrade) => {
                      const canAfford = gameState.coins >= upgrade.cost;
                      const isMaxed = upgrade.maxOwned && upgrade.owned >= upgrade.maxOwned;
                      
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
                                onClick={() => buyUpgrade(upgrade.id)}
                                disabled={!canAfford || isMaxed}
                                size="sm"
                                variant={canAfford && !isMaxed ? "default" : "secondary"}
                              >
                                {isMaxed ? 'MAX' : 'Buy'}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="shop" className="mt-4">
                <Card className="bg-game-card border-border/50">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-primary">NFT Shop</CardTitle>
                    <CardDescription>Collect unique digital treasures</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {gameState.collectibles.map((collectible) => {
                      const canAfford = gameState.coins >= collectible.cost && !collectible.owned;
                      
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
                                    onClick={() => buyCollectible(collectible.id)}
                                    disabled={!canAfford}
                                    size="sm"
                                    variant={canAfford ? "default" : "secondary"}
                                  >
                                    {collectible.owned ? 'Owned' : 'Buy'}
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
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats Panel */}
            <Card className="bg-game-card border-border/50">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-primary">Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center py-1">
                  <span className="text-sm text-muted-foreground">Total Coins</span>
                  <span className="font-semibold text-foreground">{gameState.coins.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-sm text-muted-foreground">Per Click</span>
                  <span className="font-semibold text-foreground">+{gameState.coinsPerClick}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-sm text-muted-foreground">Per Second</span>
                  <span className="font-semibold text-foreground">+{gameState.coinsPerSecond}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-sm text-muted-foreground">Total Clicks</span>
                  <span className="font-semibold text-foreground">{gameState.totalClicks.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-sm text-muted-foreground">Collection</span>
                  <span className="font-semibold text-foreground">{ownedCollectibles}/{gameState.collectibles.length}</span>
                </div>
              </CardContent>
            </Card>
            
            {/* Auto-generation indicator */}
            {gameState.coinsPerSecond > 0 && (
              <div className="text-center p-4 bg-game-card rounded-lg border border-border/50">
                <div className="text-sm text-muted-foreground mb-1">Auto Generation</div>
                <div className="text-lg font-semibold text-success animate-pulse">
                  +{gameState.coinsPerSecond}/sec
                </div>
              </div>
            )}
            
            {/* Collection Progress */}
            <div className="text-center p-4 bg-game-card rounded-lg border border-border/50">
              <div className="text-sm text-muted-foreground mb-2">Collection Progress</div>
              <div className="grid grid-cols-2 gap-2">
                {gameState.collectibles.map((collectible) => (
                  <div 
                    key={collectible.id}
                    className={`text-2xl p-2 rounded ${
                      collectible.owned 
                        ? 'bg-success/20 animate-glow' 
                        : 'bg-muted/20 grayscale opacity-50'
                    }`}
                  >
                    {collectible.image}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;