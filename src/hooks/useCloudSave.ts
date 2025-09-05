import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import type { GameState } from './useGameState';

export interface CloudSave {
  id: string;
  save_name: string;
  game_data: GameState;
  is_auto_save: boolean;
  created_at: string;
  updated_at: string;
}

export const useCloudSave = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const saveToCloud = async (gameState: GameState, saveName: string = 'Main Save', isAutoSave: boolean = false) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Not authenticated');
      }

      // Pause the game before saving
      const pausedGameState = { ...gameState, isPaused: true };

      const { error } = await supabase
        .from('game_saves')
        .upsert({
          user_id: user.id,
          save_name: saveName,
          game_data: pausedGameState as any,
          is_auto_save: isAutoSave,
        }, {
          onConflict: 'user_id,save_name'
        });

      if (error) throw error;

      if (!isAutoSave) {
        toast({
          title: "Save successful",
          description: `Game saved to cloud as "${saveName}"`,
        });
      }

      return true;
    } catch (error: any) {
      console.error('Error saving to cloud:', error);
      if (!isAutoSave) {
        toast({
          title: "Save failed",
          description: error.message,
          variant: "destructive",
        });
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  const loadFromCloud = async (saveName: string = 'Main Save'): Promise<GameState | null> => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Not authenticated');
      }

      const { data, error } = await supabase
        .from('game_saves')
        .select('*')
        .eq('user_id', user.id)
        .eq('save_name', saveName)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No save found
          return null;
        }
        throw error;
      }

      toast({
        title: "Load successful",
        description: `Game loaded from cloud save "${saveName}"`,
      });

      return data.game_data as unknown as GameState;
    } catch (error: any) {
      console.error('Error loading from cloud:', error);
      toast({
        title: "Load failed",
        description: error.message,
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getCloudSaves = async (): Promise<CloudSave[]> => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Not authenticated');
      }

      const { data, error } = await supabase
        .from('game_saves')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      return data as unknown as CloudSave[];
    } catch (error: any) {
      console.error('Error fetching cloud saves:', error);
      toast({
        title: "Failed to fetch saves",
        description: error.message,
        variant: "destructive",
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  const deleteCloudSave = async (saveName: string) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Not authenticated');
      }

      const { error } = await supabase
        .from('game_saves')
        .delete()
        .eq('user_id', user.id)
        .eq('save_name', saveName);

      if (error) throw error;

      toast({
        title: "Save deleted",
        description: `Cloud save "${saveName}" has been deleted`,
      });

      return true;
    } catch (error: any) {
      console.error('Error deleting cloud save:', error);
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    saveToCloud,
    loadFromCloud,
    getCloudSaves,
    deleteCloudSave,
  };
};