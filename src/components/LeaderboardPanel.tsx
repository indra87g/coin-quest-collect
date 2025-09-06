import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Trophy, Medal, Award, Crown, User } from 'lucide-react';

interface LeaderboardEntry {
  id: string;
  player_name: string;
  coins: number;
  level: number;
  season: number;
  created_at: string;
}

interface LeaderboardPanelProps {
  gameState: {
    coins: number;
    level: number;
    currentSeason: number;
  };
  isEndlessMode: boolean;
}

export const LeaderboardPanel = ({ gameState, isEndlessMode }: LeaderboardPanelProps) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [playerName, setPlayerName] = useState('');
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isEndlessMode) {
      fetchLeaderboard();
      checkIfSubmitted();
    }
  }, [isEndlessMode]);

  const fetchLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from('leaderboard')
        .select('*')
        .order('coins', { ascending: false })
        .limit(20);

      if (error) throw error;
      setLeaderboard(data || []);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
  };

  const checkIfSubmitted = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('leaderboard')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (data && !error) {
        setHasSubmitted(true);
        setPlayerName(data.player_name);
      }
    } catch (error) {
      console.error('Error checking submission:', error);
    }
  };

  const submitScore = async () => {
    if (!playerName.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter your name to submit your score.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to submit your score.",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase
        .from('leaderboard')
        .upsert({
          user_id: user.id,
          player_name: playerName.trim(),
          coins: gameState.coins,
          level: gameState.level,
          season: gameState.currentSeason
        });

      if (error) throw error;

      setHasSubmitted(true);
      fetchLeaderboard();
      toast({
        title: "Score Submitted!",
        description: "Your score has been added to the leaderboard.",
      });
    } catch (error) {
      console.error('Error submitting score:', error);
      toast({
        title: "Submission Failed",
        description: "Failed to submit your score. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateScore = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('leaderboard')
        .update({
          coins: gameState.coins,
          level: gameState.level,
          season: gameState.currentSeason
        })
        .eq('user_id', user.id);

      if (error) throw error;

      fetchLeaderboard();
      toast({
        title: "Score Updated!",
        description: "Your leaderboard score has been updated.",
      });
    } catch (error) {
      console.error('Error updating score:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update your score. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0: return <Crown className="w-5 h-5 text-yellow-500" />;
      case 1: return <Trophy className="w-5 h-5 text-gray-400" />;
      case 2: return <Medal className="w-5 h-5 text-amber-600" />;
      default: return <Award className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1e12) return (num / 1e12).toFixed(1) + 'T';
    if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
    return num.toString();
  };

  if (!isEndlessMode) {
    return (
      <Card className="bg-game-card border-border/50">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-primary flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-2">
            <div className="text-4xl">🔒</div>
            <div className="text-muted-foreground">
              Complete all 5 seasons to unlock Endless Mode and access the global leaderboard!
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-game-card border-border/50">
      <CardHeader>
        <CardTitle className="text-lg font-bold text-primary flex items-center gap-2">
          <Trophy className="w-5 h-5" />
          Global Leaderboard
          <Badge className="bg-endless text-endless-foreground">ENDLESS</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!hasSubmitted ? (
          <div className="space-y-3">
            <div className="text-sm text-muted-foreground">
              Submit your score to compete with other players!
            </div>
            <div className="space-y-2">
              <Input
                placeholder="Enter your name"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                maxLength={20}
              />
              <Button 
                onClick={submitScore}
                disabled={loading || !playerName.trim()}
                className="w-full"
              >
                {loading ? 'Submitting...' : 'Submit Score'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="bg-muted/30 p-3 rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">Your Score</div>
              <div className="flex justify-between items-center">
                <span className="font-semibold">{playerName}</span>
                <div className="text-right">
                  <div className="text-primary font-bold">{formatNumber(gameState.coins)} coins</div>
                  <div className="text-xs text-muted-foreground">Level {gameState.level}</div>
                </div>
              </div>
            </div>
            <Button 
              onClick={updateScore}
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              {loading ? 'Updating...' : 'Update Score'}
            </Button>
          </div>
        )}

        <div className="space-y-2">
          <div className="text-sm font-semibold text-primary">Top Players</div>
          <div className="max-h-60 overflow-y-auto space-y-1">
            {leaderboard.map((entry, index) => (
              <div
                key={entry.id}
                className={`flex items-center justify-between p-2 rounded-lg ${
                  index < 3 ? 'bg-primary/10' : 'bg-muted/30'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    {getRankIcon(index)}
                    <span className="text-sm font-bold">#{index + 1}</span>
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{entry.player_name}</div>
                    <div className="text-xs text-muted-foreground">Level {entry.level}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-primary">{formatNumber(entry.coins)}</div>
                  <div className="text-xs text-muted-foreground">coins</div>
                </div>
              </div>
            ))}
            {leaderboard.length === 0 && (
              <div className="text-center py-4 text-muted-foreground">
                <User className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <div className="text-sm">No scores yet. Be the first!</div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};