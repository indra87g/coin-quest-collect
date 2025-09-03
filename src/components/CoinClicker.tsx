import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface CoinClickerProps {
  coins: number;
  coinsPerClick: number;
  onCoinClick: () => void;
}

export const CoinClicker = ({ coins, coinsPerClick, onCoinClick }: CoinClickerProps) => {
  const [isClicking, setIsClicking] = useState(false);

  const handleClick = () => {
    setIsClicking(true);
    onCoinClick();
    setTimeout(() => setIsClicking(false), 300);
  };

  return (
    <div className="flex flex-col items-center space-y-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-coin to-gold bg-clip-text text-transparent mb-2">
          Idle Coin Clicker
        </h1>
        <div className="text-2xl font-semibold text-foreground">
          {coins.toLocaleString()} Coins
        </div>
        <div className="text-sm text-muted-foreground">
          +{coinsPerClick} per click
        </div>
      </div>
      
      <Button
        onClick={handleClick}
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
  );
};