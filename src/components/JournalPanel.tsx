import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collectible } from '@/hooks/useGameState';
import { BookOpen, Star, Trophy } from 'lucide-react';

interface JournalPanelProps {
  allCollectedNFTs: Collectible[];
  currentSeason: number;
  gameCompleted: boolean;
  level: number;
  levelRequirement: number;
}

export const JournalPanel = ({ 
  allCollectedNFTs, 
  currentSeason, 
  gameCompleted,
  level,
  levelRequirement 
}: JournalPanelProps) => {
  const isUnlocked = level >= levelRequirement;

  if (!isUnlocked) {
    return (
      <Card className="h-[400px] flex items-center justify-center">
        <CardContent className="text-center">
          <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <CardTitle className="text-xl mb-2">Journal Locked</CardTitle>
          <CardDescription>
            Reach Level {levelRequirement} to unlock the NFT Journal
          </CardDescription>
        </CardContent>
      </Card>
    );
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'bg-gradient-to-r from-yellow-400 to-orange-500';
      case 'epic': return 'bg-gradient-to-r from-purple-500 to-pink-500';
      case 'rare': return 'bg-gradient-to-r from-blue-500 to-cyan-500';
      case 'common': return 'bg-gradient-to-r from-gray-500 to-gray-600';
      default: return 'bg-gray-500';
    }
  };

  const getSeasonName = (nftId: string) => {
    if (nftId.includes('-s1')) return 'Season 1: Coins';
    if (nftId.includes('-s2')) return 'Season 2: Gems';
    if (nftId.includes('-s3')) return 'Season 3: Celestial';
    if (nftId.includes('-s4')) return 'Season 4: Elements';
    if (nftId.includes('-s5')) return 'Season 5: Ancient';
    return 'Unknown Season';
  };

  const groupedNFTs = allCollectedNFTs.reduce((acc, nft) => {
    const season = getSeasonName(nft.id);
    if (!acc[season]) acc[season] = [];
    acc[season].push(nft);
    return acc;
  }, {} as Record<string, Collectible[]>);

  const totalCollected = allCollectedNFTs.length;
  const totalPossible = 20; // 4 NFTs per season × 5 seasons

  return (
    <Card className="h-[400px]">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <CardTitle>NFT Journal</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-gold" />
            <span className="text-sm font-medium">
              {totalCollected}/{totalPossible}
            </span>
          </div>
        </div>
        <CardDescription>
          Collection progress across all seasons
        </CardDescription>
        
        {/* Progress Bar */}
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-primary to-gold h-2 rounded-full transition-all duration-500"
            style={{ width: `${(totalCollected / totalPossible) * 100}%` }}
          />
        </div>
      </CardHeader>
      
      <CardContent>
        <ScrollArea className="h-[280px]">
          {Object.keys(groupedNFTs).length === 0 ? (
            <div className="text-center py-8">
              <Star className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-muted-foreground">No NFTs collected yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Start collecting NFTs to fill your journal!
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedNFTs).map(([season, nfts]) => (
                <div key={season} className="space-y-3">
                  <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary" />
                    {season}
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {nfts.map(nft => (
                      <div 
                        key={nft.id}
                        className="relative bg-card border rounded-lg p-3 hover:shadow-md transition-all duration-200"
                      >
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">{nft.image}</div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm truncate">
                              {nft.name}
                            </h4>
                            <p className="text-xs text-muted-foreground truncate">
                              {nft.description}
                            </p>
                            <Badge 
                              variant="secondary" 
                              className={`mt-1 text-xs ${getRarityColor(nft.rarity)} text-white`}
                            >
                              {nft.rarity}
                            </Badge>
                          </div>
                        </div>
                        
                        {/* Rarity glow effect */}
                        {nft.rarity === 'legendary' && (
                          <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-yellow-400/20 to-orange-500/20 animate-pulse" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              
              {gameCompleted && (
                <div className="text-center py-4 border-t">
                  <div className="text-lg font-bold bg-gradient-to-r from-gold to-yellow-500 bg-clip-text text-transparent">
                    🎉 Master Collector! 🎉
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    You've collected all NFTs across all seasons!
                  </p>
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};