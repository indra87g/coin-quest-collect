import { useEffect, useState } from 'react';
import { Collectible } from '@/hooks/useGameState';

interface NFTEffectsProps {
  collectibles: Collectible[];
  allCollectedNFTs: Collectible[];
}

// NFT special effects based on rarity
const getEffectByRarity = (rarity: string) => {
  switch (rarity) {
    case 'legendary':
      return 'animate-glow';
    case 'epic':
      return 'animate-pulse';
    case 'rare':
      return 'hover:scale-110';
    case 'common':
    default:
      return 'hover:scale-105';
  }
};

const getEffectByNFT = (nftId: string) => {
  // Special effects for specific NFTs
  const specialEffects: Record<string, string> = {
    'diamond-coin-s1': 'animate-bounce-coin bg-gradient-to-r from-blue-400 to-purple-500',
    'crystal-shard-s2': 'animate-glow bg-gradient-to-r from-purple-400 to-pink-500',
    'galaxy-core-s3': 'animate-pulse bg-gradient-to-r from-indigo-500 to-purple-600',
    'void-essence-s4': 'animate-float bg-gradient-to-r from-gray-800 to-black',
    'infinity-stone-s5': 'animate-glow animate-pulse bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500',
  };
  
  return specialEffects[nftId] || '';
};

export const NFTEffects = ({ collectibles, allCollectedNFTs }: NFTEffectsProps) => {
  const [showEffect, setShowEffect] = useState(false);
  
  // Show effect when new NFT is collected
  useEffect(() => {
    if (allCollectedNFTs.length > 0) {
      setShowEffect(true);
      const timer = setTimeout(() => setShowEffect(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [allCollectedNFTs.length]);

  // Get active effects from owned collectibles
  const activeEffects = collectibles
    .filter(nft => nft.owned)
    .map(nft => ({
      id: nft.id,
      name: nft.name,
      rarity: nft.rarity,
      rarityEffect: getEffectByRarity(nft.rarity),
      specialEffect: getEffectByNFT(nft.id)
    }));

  if (activeEffects.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 pointer-events-none">
      {showEffect && (
        <div className="bg-card/80 backdrop-blur-sm rounded-lg p-3 border shadow-lg animate-slide-up">
          <div className="text-sm font-medium text-success mb-2">
            ✨ NFT Effects Active
          </div>
          <div className="space-y-2">
            {activeEffects.map(effect => (
              <div 
                key={effect.id}
                className={`flex items-center gap-2 p-2 rounded-md ${effect.specialEffect} ${effect.rarityEffect} transition-all duration-300`}
              >
                <div className={`w-2 h-2 rounded-full bg-${effect.rarity === 'legendary' ? 'gold' : effect.rarity === 'epic' ? 'purple-500' : effect.rarity === 'rare' ? 'blue-500' : 'gray-500'}`} />
                <span className="text-xs text-foreground font-medium">
                  {effect.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};