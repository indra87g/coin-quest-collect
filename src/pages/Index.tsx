import { useGameState } from '@/hooks/useGameState';
import { CoinClicker } from '@/components/CoinClicker';
import { UpgradePanel } from '@/components/UpgradePanel';
import { ShopPanel } from '@/components/ShopPanel';
import { StatsPanel } from '@/components/StatsPanel';
import { SeasonProgress } from '@/components/SeasonProgress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';


const Index = () => {
  const { gameState, clickCoin, buyUpgrade, buyCollectible } = useGameState();
  
  const ownedCollectibles = gameState.collectibles.filter(c => c.owned).length;
  const usedUpgradeSlots = gameState.upgrades.reduce((sum, u) => sum + u.owned, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-game-bg to-background">
      <div className="container mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Game Area */}
          <div className="lg:col-span-2 space-y-6">
            <CoinClicker 
              coins={gameState.coins}
              coinsPerClick={gameState.coinsPerClick}
              onCoinClick={clickCoin}
              gameCompleted={gameState.gameCompleted}
              currentSeason={gameState.currentSeason}
            />
            
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
                <UpgradePanel 
                  upgrades={gameState.upgrades}
                  coins={gameState.coins}
                  onBuyUpgrade={buyUpgrade}
                  gameCompleted={gameState.gameCompleted}
                  upgradeSlots={gameState.upgradeSlots}
                  usedUpgradeSlots={usedUpgradeSlots}
                />
              </TabsContent>
              
              <TabsContent value="shop" className="mt-4">
                <ShopPanel 
                  collectibles={gameState.collectibles}
                  coins={gameState.coins}
                  onBuyCollectible={buyCollectible}
                  gameCompleted={gameState.gameCompleted}
                  currentSeason={gameState.currentSeason}
                />
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            <StatsPanel 
              coins={gameState.coins}
              coinsPerClick={gameState.coinsPerClick}
              coinsPerSecond={gameState.coinsPerSecond}
              totalClicks={gameState.totalClicks}
              ownedCollectibles={ownedCollectibles}
              totalCollectibles={gameState.collectibles.length}
              currentSeason={gameState.currentSeason}
              upgradeSlots={gameState.upgradeSlots}
              usedUpgradeSlots={usedUpgradeSlots}
              gameCompleted={gameState.gameCompleted}
            />
            
            <SeasonProgress 
              currentSeason={gameState.currentSeason}
              gameCompleted={gameState.gameCompleted}
              ownedCollectibles={ownedCollectibles}
              totalCollectibles={gameState.collectibles.length}
            />
            
            {/* Auto-generation indicator */}
            {gameState.coinsPerSecond > 0 && !gameState.gameCompleted && (
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