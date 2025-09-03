import { useState, useEffect, useCallback } from 'react';

export interface Upgrade {
  id: string;
  name: string;
  description: string;
  cost: number;
  multiplier: number;
  owned: number;
  maxOwned?: number;
}

export interface Collectible {
  id: string;
  name: string;
  description: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  cost: number;
  owned: boolean;
  image: string;
}

export interface GameState {
  coins: number;
  coinsPerClick: number;
  coinsPerSecond: number;
  totalClicks: number;
  upgrades: Upgrade[];
  collectibles: Collectible[];
  currentSeason: number;
  gameCompleted: boolean;
  upgradeSlots: number;
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

const SEASONS_DATA = {
  1: [
    { id: 'bronze-coin-s1', name: 'Bronze Coin', description: 'A simple bronze coin', rarity: 'common' as const, cost: 50, image: '🥉' },
    { id: 'silver-coin-s1', name: 'Silver Coin', description: 'A shiny silver coin', rarity: 'rare' as const, cost: 250, image: '🥈' },
    { id: 'gold-coin-s1', name: 'Gold Coin', description: 'A precious gold coin', rarity: 'epic' as const, cost: 1000, image: '🥇' },
    { id: 'diamond-coin-s1', name: 'Diamond Coin', description: 'The ultimate treasure', rarity: 'legendary' as const, cost: 5000, image: '💎' }
  ],
  2: [
    { id: 'emerald-gem-s2', name: 'Emerald Gem', description: 'A mystical emerald gem', rarity: 'common' as const, cost: 100, image: '💚' },
    { id: 'ruby-gem-s2', name: 'Ruby Gem', description: 'A fiery ruby gem', rarity: 'rare' as const, cost: 500, image: '❤️' },
    { id: 'sapphire-gem-s2', name: 'Sapphire Gem', description: 'A deep blue sapphire', rarity: 'epic' as const, cost: 2000, image: '💙' },
    { id: 'crystal-shard-s2', name: 'Crystal Shard', description: 'A fragment of pure energy', rarity: 'legendary' as const, cost: 10000, image: '🔮' }
  ],
  3: [
    { id: 'star-fragment-s3', name: 'Star Fragment', description: 'A piece of fallen star', rarity: 'common' as const, cost: 200, image: '⭐' },
    { id: 'moon-stone-s3', name: 'Moon Stone', description: 'Glowing lunar stone', rarity: 'rare' as const, cost: 1000, image: '🌙' },
    { id: 'sun-orb-s3', name: 'Sun Orb', description: 'Radiant solar energy', rarity: 'epic' as const, cost: 4000, image: '☀️' },
    { id: 'galaxy-core-s3', name: 'Galaxy Core', description: 'The heart of a galaxy', rarity: 'legendary' as const, cost: 20000, image: '🌌' }
  ],
  4: [
    { id: 'fire-essence-s4', name: 'Fire Essence', description: 'Pure elemental fire', rarity: 'common' as const, cost: 400, image: '🔥' },
    { id: 'ice-crystal-s4', name: 'Ice Crystal', description: 'Eternal frozen crystal', rarity: 'rare' as const, cost: 2000, image: '❄️' },
    { id: 'lightning-bolt-s4', name: 'Lightning Bolt', description: 'Captured thunder', rarity: 'epic' as const, cost: 8000, image: '⚡' },
    { id: 'void-essence-s4', name: 'Void Essence', description: 'Power from the void', rarity: 'legendary' as const, cost: 40000, image: '🕳️' }
  ],
  5: [
    { id: 'ancient-rune-s5', name: 'Ancient Rune', description: 'Forgotten magical symbol', rarity: 'common' as const, cost: 800, image: '🔺' },
    { id: 'time-crystal-s5', name: 'Time Crystal', description: 'Crystallized time itself', rarity: 'rare' as const, cost: 4000, image: '⏳' },
    { id: 'reality-orb-s5', name: 'Reality Orb', description: 'Controls the fabric of reality', rarity: 'epic' as const, cost: 16000, image: '🔮' },
    { id: 'infinity-stone-s5', name: 'Infinity Stone', description: 'The ultimate artifact', rarity: 'legendary' as const, cost: 80000, image: '♾️' }
  ]
};

const getSeasonCollectibles = (season: number): Collectible[] => {
  const seasonData = SEASONS_DATA[season as keyof typeof SEASONS_DATA] || SEASONS_DATA[1];
  return seasonData.map(item => ({
    ...item,
    owned: false
  }));
};

const SAVE_KEY = 'idle-coin-clicker-save';

export const useGameState = () => {
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
          collectibles: getSeasonCollectibles(parsed.currentSeason || 1).map(collectible => {
            const savedCollectible = parsed.collectibles?.find((c: Collectible) => c.id === collectible.id);
            return savedCollectible ? { ...collectible, owned: savedCollectible.owned } : collectible;
          }),
          currentSeason: parsed.currentSeason || 1,
          gameCompleted: parsed.gameCompleted || false,
          upgradeSlots: parsed.upgradeSlots || 10
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
      collectibles: getSeasonCollectibles(1),
      currentSeason: 1,
      gameCompleted: false,
      upgradeSlots: 10
    };
  });

  // Save to localStorage whenever gameState changes
  useEffect(() => {
    localStorage.setItem(SAVE_KEY, JSON.stringify(gameState));
  }, [gameState]);

  // Auto-clicker effect
  useEffect(() => {
    if (gameState.coinsPerSecond > 0 && !gameState.gameCompleted) {
      const interval = setInterval(() => {
        setGameState(prev => {
          if (prev.gameCompleted) return prev;
          
          return {
            ...prev,
            coins: prev.coins + prev.coinsPerSecond
          };
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [gameState.coinsPerSecond, gameState.gameCompleted]);

  const clickCoin = useCallback(() => {
    setGameState(prev => {
      if (prev.gameCompleted) return prev;
      
      return {
        ...prev,
        coins: prev.coins + prev.coinsPerClick,
        totalClicks: prev.totalClicks + 1
      };
    });
  }, []);

  const buyUpgrade = useCallback((upgradeId: string) => {
    setGameState(prev => {
      if (prev.gameCompleted) return prev;
      
      const upgrade = prev.upgrades.find(u => u.id === upgradeId);
      const totalOwned = prev.upgrades.reduce((sum, u) => sum + u.owned, 0);
      
      if (!upgrade || prev.coins < upgrade.cost || 
          (upgrade.maxOwned && upgrade.owned >= upgrade.maxOwned) ||
          totalOwned >= prev.upgradeSlots) {
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
      if (prev.gameCompleted) return prev;
      
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

      // Check if all collectibles are owned
      const allOwned = newCollectibles.every(c => c.owned);
      
      if (allOwned && prev.currentSeason < 5) {
        // Advance to next season
        const nextSeason = prev.currentSeason + 1;
        return {
          ...prev,
          coins: 0, // Reset coins
          collectibles: getSeasonCollectibles(nextSeason),
          currentSeason: nextSeason,
          upgradeSlots: prev.upgradeSlots + 5 // Add 5 more upgrade slots
        };
      } else if (allOwned && prev.currentSeason === 5) {
        // Game completed
        return {
          ...prev,
          coins: prev.coins - collectible.cost,
          collectibles: newCollectibles,
          gameCompleted: true
        };
      }

      return {
        ...prev,
        coins: prev.coins - collectible.cost,
        collectibles: newCollectibles
      };
    });
  }, []);

  return {
    gameState,
    clickCoin,
    buyUpgrade,
    buyCollectible
  };
};