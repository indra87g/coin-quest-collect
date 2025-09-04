import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Cloud, Download, Upload, Trash2, HardDrive } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useCloudSave, type CloudSave } from '@/hooks/useCloudSave';
import type { GameState } from '@/hooks/useGameState';

interface SavePanelProps {
  gameState: GameState;
  onLoadGameState: (newState: GameState) => void;
}

export const SavePanel = ({ gameState, onLoadGameState }: SavePanelProps) => {
  const { user } = useAuth();
  const { loading, saveToCloud, loadFromCloud, getCloudSaves, deleteCloudSave } = useCloudSave();
  const [cloudSaves, setCloudSaves] = useState<CloudSave[]>([]);
  const [saveName, setSaveName] = useState('');

  useEffect(() => {
    if (user) {
      loadCloudSaves();
    }
  }, [user]);

  const loadCloudSaves = async () => {
    const saves = await getCloudSaves();
    setCloudSaves(saves);
  };

  const handleSaveToCloud = async () => {
    if (!saveName.trim()) return;
    
    const success = await saveToCloud(gameState, saveName.trim());
    if (success) {
      setSaveName('');
      loadCloudSaves();
    }
  };

  const handleLoadFromCloud = async (name: string) => {
    const loadedState = await loadFromCloud(name);
    if (loadedState) {
      onLoadGameState(loadedState);
    }
  };

  const handleDeleteSave = async (name: string) => {
    const success = await deleteCloudSave(name);
    if (success) {
      loadCloudSaves();
    }
  };

  const exportSave = () => {
    const saveData = JSON.stringify(gameState, null, 2);
    const blob = new Blob([saveData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `idle-game-save-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importSave = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const saveData = JSON.parse(e.target?.result as string);
        onLoadGameState(saveData);
      } catch (error) {
        console.error('Invalid save file:', error);
      }
    };
    reader.readAsText(file);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HardDrive className="h-5 w-5" />
          Save Game
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Local Save Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <HardDrive className="h-4 w-4" />
            <h3 className="font-semibold">Local Save</h3>
            <Badge variant="secondary">Auto-saves</Badge>
          </div>
          <div className="flex gap-2">
            <Button onClick={exportSave} variant="outline" className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Label htmlFor="import-file" className="flex-1">
              <Button variant="outline" className="w-full" asChild>
                <span>
                  <Upload className="h-4 w-4 mr-2" />
                  Import
                </span>
              </Button>
              <Input
                id="import-file"
                type="file"
                accept=".json"
                onChange={importSave}
                className="hidden"
              />
            </Label>
          </div>
        </div>

        <Separator />

        {/* Cloud Save Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Cloud className="h-4 w-4" />
            <h3 className="font-semibold">Cloud Save</h3>
            {user && <Badge variant="default">Connected</Badge>}
            {!user && <Badge variant="destructive">Not signed in</Badge>}
          </div>

          {user ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="save-name">Save Name</Label>
                <div className="flex gap-2">
                  <Input
                    id="save-name"
                    value={saveName}
                    onChange={(e) => setSaveName(e.target.value)}
                    placeholder="Enter save name..."
                    disabled={loading}
                  />
                  <Button 
                    onClick={handleSaveToCloud}
                    disabled={loading || !saveName.trim()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                </div>
              </div>

              {cloudSaves.length > 0 && (
                <div className="space-y-2">
                  <Label>Your Cloud Saves</Label>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {cloudSaves.map((save) => (
                      <div key={save.id} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex-1">
                          <p className="font-medium">{save.save_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {save.is_auto_save && <Badge variant="outline" className="mr-1">Auto</Badge>}
                            {new Date(save.updated_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleLoadFromCloud(save.save_name)}
                            disabled={loading}
                          >
                            <Download className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteSave(save.save_name)}
                            disabled={loading}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              Sign in to save your game to the cloud and sync across devices.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};