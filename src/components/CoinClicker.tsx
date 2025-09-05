import { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Buff } from '@/hooks/useGameState';

interface CoinClickerProps {
  coins: number;
  coinsPerClick: number;
  onCoinClick: () => void;
  gameCompleted: boolean;
  currentSeason: number;
  buffs: Buff[];
}

export const CoinClicker = ({ coins, coinsPerClick, onCoinClick, gameCompleted, currentSeason, buffs }: CoinClickerProps) => {
  const [isClicking, setIsClicking] = useState(false);
  const [isHolding, setIsHolding] = useState(false);
  const holdIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const holdTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const rapidFireBuff = buffs.find(b => b.id === 'hold-to-generate' && b.isActive);
  
  const handleClick = () => {
    setIsClicking(true);
    onCoinClick();
    setTimeout(() => setIsClicking(false), 300);
  };

  const startHolding = useCallback(() => {
    if (!rapidFireBuff || !rapidFireBuff.isActive || gameCompleted) return;
    
    setIsHolding(true);
    holdTimeoutRef.current = setTimeout(() => {
      // Double check buff is still active before starting interval
      if (rapidFireBuff && rapidFireBuff.isActive) {
        holdIntervalRef.current = setInterval(() => {
          onCoinClick();
        }, 100); // Generate coins every 100ms while holding
      }
    }, 200); // Start after 200ms hold
  }, [rapidFireBuff, gameCompleted, onCoinClick]);

  const stopHolding = useCallback(() => {
    setIsHolding(false);
    if (holdTimeoutRef.current) {
      clearTimeout(holdTimeoutRef.current);
      holdTimeoutRef.current = null;
    }
    if (holdIntervalRef.current) {
      clearInterval(holdIntervalRef.current);
      holdIntervalRef.current = null;
    }
  }, []);

  // Stop holding when rapid fire buff becomes inactive
  useEffect(() => {
    if (!rapidFireBuff || !rapidFireBuff.isActive) {
      stopHolding();
    }
  }, [rapidFireBuff, stopHolding]);

  useEffect(() => {
    return () => {
      if (holdTimeoutRef.current) clearTimeout(holdTimeoutRef.current);
      if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
    };
  }, []);

  return (
    <div className="flex flex-col items-center space-y-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-coin to-gold bg-clip-text text-transparent mb-2">
          {gameCompleted ? 'Game Completed!' : 'Idle Coin Clicker'}
        </h1>
        {gameCompleted ? (
          <div className="text-lg text-gold animate-pulse">
            🎉 All 5 Seasons Conquered! 🎉
          </div>
        ) : (
          <>
            <div className="text-sm text-muted-foreground mb-1">
              Season {currentSeason}/5
            </div>
            <div className="text-2xl font-semibold text-foreground">
              {coins.toLocaleString()} Coins
            </div>
            <div className="text-sm text-muted-foreground">
              +{coinsPerClick} per click
            </div>
          </>
        )}
      </div>
      
      <div className="relative">
        <Button
          onClick={rapidFireBuff && rapidFireBuff.isActive ? undefined : handleClick}
          onMouseDown={rapidFireBuff && rapidFireBuff.isActive ? startHolding : undefined}
          onMouseUp={rapidFireBuff && rapidFireBuff.isActive ? stopHolding : undefined}
          onMouseLeave={rapidFireBuff && rapidFireBuff.isActive ? stopHolding : undefined}
          onTouchStart={rapidFireBuff && rapidFireBuff.isActive ? startHolding : undefined}
          onTouchEnd={rapidFireBuff && rapidFireBuff.isActive ? stopHolding : undefined}
          size="lg"
          disabled={gameCompleted}
          className={`
            w-32 h-32 rounded-full text-6xl
            bg-gradient-to-br from-coin to-gold
            hover:from-gold hover:to-coin
            border-4 border-gold/50
            shadow-2xl hover:shadow-coin/50
            transition-all duration-200
            ${gameCompleted ? 'opacity-50 cursor-not-allowed' : ''}
            ${isClicking || isHolding ? 'animate-bounce-coin' : 'animate-float'}
            ${rapidFireBuff && rapidFireBuff.isActive ? 'animate-pulse' : ''}
          `}
        >
          {gameCompleted ? '👑' : '🪙'}
        </Button>
        
        {rapidFireBuff && rapidFireBuff.isActive && (
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs text-warning bg-warning/20 px-2 py-1 rounded animate-pulse">
            Hold to generate!
          </div>
        )}
      </div>
      
      <div className="text-center text-muted-foreground">
        {gameCompleted 
          ? 'Congratulations! You\'ve mastered the art of coin collecting!' 
          : 'Click the coin to earn money!'
        }
      </div>
    </div>
  );
};