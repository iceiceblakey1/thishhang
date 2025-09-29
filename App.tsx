import React, { useState, useCallback, useEffect } from 'react';
import { Page, Source, Script, ArchivedEpisode, FavoriteChannel } from './types';
import SourceGathering from './components/pages/SourceGathering';
import SourcesAndNotes from './components/pages/SourcesAndNotes';
import WritersRoom from './components/pages/WritersRoom';
import Header from './components/layout/Header';
import Settings from './components/pages/Settings';
import Publish from './components/pages/Publish';
import Archive from './components/pages/Archive';
import VoiceLab from './components/pages/VoiceLab';
import ErrorBoundary from './components/ui/ErrorBoundary';

export type Theme = 'dark' | 'light';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('SOURCE_GATHERING');
  const [selectedSources, setSelectedSources] = useState<Source[]>([]);
  const [script, setScript] = useState<Script | null>(null);
  const [archivedEpisodes, setArchivedEpisodes] = useState<ArchivedEpisode[]>([]);
  const [favoriteChannels, setFavoriteChannels] = useState<FavoriteChannel[]>([]);
  const [blockedChannels, setBlockedChannels] = useState<FavoriteChannel[]>([]);
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      const savedTheme = localStorage.getItem('unlikely-housewives-theme') as Theme;
      return savedTheme || 'dark';
    } catch {
      return 'dark';
    }
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('unlikely-housewives-theme', theme);
    } catch (e) {
      console.error("Could not save theme to localStorage", e);
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark');
  }, []);

  useEffect(() => {
    try {
      const savedEpisodes = localStorage.getItem('unlikely-housewives-archived-episodes');
      if (savedEpisodes) {
        setArchivedEpisodes(JSON.parse(savedEpisodes));
      }
    } catch (error) {
      console.error("Failed to load archived episodes from localStorage", error);
    }
    
    try {
        const storedSettings = localStorage.getItem('unlikely-housewives-app-settings');
        if (storedSettings) {
            const parsed = JSON.parse(storedSettings);
            if (parsed.youtube?.favoriteChannels) {
                setFavoriteChannels(parsed.youtube.favoriteChannels);
            }
            if (parsed.youtube?.blockedChannels) {
                setBlockedChannels(parsed.youtube.blockedChannels);
            }
        }
    } catch(e) { console.error("Could not load settings", e); }
  }, []);

  const updateStoredChannels = useCallback((key: 'favoriteChannels' | 'blockedChannels', channels: FavoriteChannel[]) => {
    try {
        const storedSettings = localStorage.getItem('unlikely-housewives-app-settings');
        const settings = storedSettings ? JSON.parse(storedSettings) : {};
        settings.youtube = { ...settings.youtube, [key]: channels };
        localStorage.setItem('unlikely-housewives-app-settings', JSON.stringify(settings));
    } catch (e) {
        console.error(`Failed to save ${key}:`, e);
    }
  }, []);

  const addFavoriteChannel = useCallback((channel: FavoriteChannel) => {
    setFavoriteChannels(prev => {
      if (prev.some(c => c.id === channel.id)) return prev;
      const newChannels = [...prev, channel];
      updateStoredChannels('favoriteChannels', newChannels);
      return newChannels;
    });
  }, [updateStoredChannels]);

  const removeFavoriteChannel = useCallback((channelId: string) => {
    setFavoriteChannels(prev => {
        const newChannels = prev.filter(c => c.id !== channelId);
        updateStoredChannels('favoriteChannels', newChannels);
        return newChannels;
    });
  }, [updateStoredChannels]);

  const addBlockedChannel = useCallback((channel: FavoriteChannel) => {
    setBlockedChannels(prev => {
      if (prev.some(c => c.id === channel.id)) return prev;
      const newChannels = [...prev, channel];
      updateStoredChannels('blockedChannels', newChannels);
      return newChannels;
    });
  }, [updateStoredChannels]);

  const removeBlockedChannel = useCallback((channelId: string) => {
    setBlockedChannels(prev => {
        const newChannels = prev.filter(c => c.id !== channelId);
        updateStoredChannels('blockedChannels', newChannels);
        return newChannels;
    });
  }, [updateStoredChannels]);

  const archiveEpisode = useCallback((episode: ArchivedEpisode) => {
    setArchivedEpisodes((prev) => {
      const newEpisodes = [...prev, episode].sort((a, b) => b.episodeNumber - a.episodeNumber);
      try {
        localStorage.setItem('unlikely-housewives-archived-episodes', JSON.stringify(newEpisodes));
      } catch (error) {
        console.error("Failed to save archived episodes to localStorage", error);
      }
      return newEpisodes;
    });
  }, []);

  const addSource = useCallback((source: Source) => {
    setSelectedSources((prev) => {
      if (prev.find((s) => s.id === source.id)) {
        return prev;
      }
      return [...prev, source];
    });
  }, []);

  const addCustomNote = useCallback((noteContent: string) => {
    if (!noteContent.trim()) return;

    const newNote: Source = {
        id: `custom-note-${crypto.randomUUID()}`,
        type: 'note',
        title: 'Host Note',
        content: noteContent.substring(0, 100), // Snippet for context in UI if needed
        url: '',
        imageUrl: '',
        userNote: noteContent, // Full content goes into userNote for the AI
    };

    setSelectedSources(prev => [...prev, newNote]);
  }, []);

  const removeSource = useCallback((sourceId: string) => {
    setSelectedSources((prev) => prev.filter((s) => s.id !== sourceId));
  }, []);

  const updateSourceNote = useCallback((sourceId: string, note: string) => {
    setSelectedSources((prev) =>
      prev.map((s) => (s.id === sourceId ? { ...s, userNote: note } : s))
    );
  }, []);
  
  const goToWritersRoom = useCallback(() => setCurrentPage('WRITERS_ROOM'), []);
  const goToPublish = useCallback(() => setCurrentPage('PUBLISH'), []);

  const renderPage = () => {
    switch (currentPage) {
      case 'SOURCE_GATHERING':
        return <SourceGathering 
                    addSource={addSource} 
                    selectedSources={selectedSources} 
                    favoriteChannels={favoriteChannels} 
                    addFavoriteChannel={addFavoriteChannel}
                    removeFavoriteChannel={removeFavoriteChannel}
                    blockedChannels={blockedChannels}
                    addBlockedChannel={addBlockedChannel}
               />;
      case 'SOURCES_AND_NOTES':
        return <SourcesAndNotes sources={selectedSources} removeSource={removeSource} updateSourceNote={updateSourceNote} goToWritersRoom={goToWritersRoom} addCustomNote={addCustomNote} />;
      case 'WRITERS_ROOM':
        return <WritersRoom sources={selectedSources} setScript={setScript} goToPublish={() => setCurrentPage('PUBLISH')} />;
      case 'VOICE_LAB':
        return <VoiceLab />;
      case 'PUBLISH':
        return <Publish script={script} setScript={setScript} archiveEpisode={archiveEpisode} setCurrentPage={setCurrentPage} />;
      case 'ARCHIVE':
        return <Archive episodes={archivedEpisodes} />;
      case 'SETTINGS':
        return <Settings 
                    favoriteChannels={favoriteChannels} 
                    addFavoriteChannel={addFavoriteChannel} 
                    removeFavoriteChannel={removeFavoriteChannel}
                    blockedChannels={blockedChannels}
                    removeBlockedChannel={removeBlockedChannel}
                />;
      default:
        return <SourceGathering 
                    addSource={addSource} 
                    selectedSources={selectedSources} 
                    favoriteChannels={favoriteChannels} 
                    addFavoriteChannel={addFavoriteChannel}
                    removeFavoriteChannel={removeFavoriteChannel}
                    blockedChannels={blockedChannels}
                    addBlockedChannel={addBlockedChannel}
                />;
    }
  };

  return (
    <div 
      className="bg-transparent text-[var(--color-text-primary)] min-h-screen"
    >
      <Header currentPage={currentPage} setCurrentPage={setCurrentPage} theme={theme} toggleTheme={toggleTheme} />
      <main className="flex-grow p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        {renderPage()}
      </main>
    </div>
  );
};

export default App;

// In your render:
<ErrorBoundary>
  {/* Your components */}
</ErrorBoundary>