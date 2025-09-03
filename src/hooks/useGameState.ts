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
    setGameState(prev => ({
      ...prev,
      coins: prev.coins + prev.coinsPerClick,
      totalClicks: prev.totalClicks + 1
    }));
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

  return {
    gameState,
    clickCoin,
    buyUpgrade,
    buyCollectible
  };
};