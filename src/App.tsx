import { useState, useCallback, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import PsakimList from './pages/PsakimList';
import PsakView from './pages/PsakView';
import Upload from './pages/Upload';
import SmartIndex from './pages/SmartIndex';
import SourceView from './pages/SourceView';
import Connections from './pages/Connections';
import GemaraExplorer from './pages/GemaraExplorer';
import ShulchanAruchExplorer from './pages/ShulchanAruchExplorer';
import SefarimExplorer from './pages/SefarimExplorer';
import Favorites from './pages/Favorites';
import { PsakDin } from './types';
import { parsePsakFile } from './utils/psakUtils';
import { TalmudNavigator } from './components/TalmudNavigator';
import { ThemeProvider } from './context/ThemeContext';

const STORAGE_KEY = 'psak-din-storage';

function App() {
  // Sidebar pinned state
  const [sidebarPinned, setSidebarPinned] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(288); // 72 * 4 = 288px (w-72)
  
  // Load from localStorage on startup
  const [psakim, setPsakim] = useState<PsakDin[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      console.log('Loading from localStorage:', stored ? `Found ${JSON.parse(stored).length} psakim` : 'No data found');
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convert date strings back to Date objects
        return parsed.map((p: any) => ({
          ...p,
          dateAdded: new Date(p.dateAdded),
        }));
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
    }
    return [];
  });
  
  const [isLoading, setIsLoading] = useState(false);

  // Expose sidebar offset as a CSS variable for pages that use fixed panels.
  useEffect(() => {
    const offsetPx = sidebarPinned ? sidebarWidth : 0;
    document.documentElement.style.setProperty('--app-sidebar-offset', `${offsetPx}px`);
  }, [sidebarPinned, sidebarWidth]);

  // Save to localStorage whenever psakim changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(psakim));
      console.log('Saved to localStorage:', psakim.length, 'psakim');
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }, [psakim]);

  const handleUpload = useCallback(async (files: FileList) => {
    setIsLoading(true);
    try {
      const newPsakim: PsakDin[] = [];
      for (const file of Array.from(files)) {
        if (file.name.endsWith('.html')) {
          const psak = await parsePsakFile(file);
          
          // Check if psak already exists (by number and title)
          const isDuplicate = psakim.some(
            existingPsak => 
              existingPsak.number === psak.number && 
              existingPsak.title === psak.title
          );
          
          if (!isDuplicate) {
            newPsakim.push(psak);
          } else {
            console.log(`Skipping duplicate psak: ${psak.number} - ${psak.title}`);
          }
        }
      }
      
      if (newPsakim.length > 0) {
        setPsakim(prev => [...prev, ...newPsakim]);
        console.log(`Added ${newPsakim.length} new psakim, skipped ${Array.from(files).length - newPsakim.length} duplicates`);
      }
    } catch (error) {
      console.error('Error uploading files:', error);
    } finally {
      setIsLoading(false);
    }
  }, [psakim]);

  const handleDelete = useCallback((id: string) => {
    setPsakim(prev => prev.filter(p => p.id !== id));
  }, []);

  const handleRemoveDuplicates = useCallback(() => {
    const seen = new Map<string, PsakDin>();
    const unique: PsakDin[] = [];
    let duplicatesCount = 0;

    for (const psak of psakim) {
      const key = `${psak.number}-${psak.title}`;
      if (!seen.has(key)) {
        seen.set(key, psak);
        unique.push(psak);
      } else {
        duplicatesCount++;
      }
    }

    if (duplicatesCount > 0) {
      setPsakim(unique);
      console.log(`Removed ${duplicatesCount} duplicate psakim`);
      alert(`הוסרו ${duplicatesCount} פסקי דין כפולים`);
    } else {
      alert('לא נמצאו פסקים כפולים');
    }
  }, [psakim]);

  return (
    <ThemeProvider>
    <Router>
      <div className="flex min-h-screen bg-cream-gradient">
        <Sidebar 
          psakCount={psakim.length} 
          onPinnedChange={setSidebarPinned}
          onWidthChange={setSidebarWidth}
        />
        <main 
          className="flex-1 p-8 bg-gradient-to-br from-cream-100 to-cream-200 transition-all duration-300"
          style={{
            marginRight: sidebarPinned ? `${sidebarWidth}px` : '0px'
          }}
        >
          {/* Talmud Quick Navigator */}
          <TalmudNavigator />
          
          <Routes>
            <Route path="/" element={<Dashboard psakim={psakim} />} />
            <Route 
              path="/psakim" 
              element={<PsakimList psakim={psakim} onDelete={handleDelete} onRemoveDuplicates={handleRemoveDuplicates} />} 
            />
            <Route 
              path="/psak/:id" 
              element={<PsakView psakim={psakim} />} 
            />
            <Route 
              path="/upload" 
              element={<Upload onUpload={handleUpload} isLoading={isLoading} />} 
            />
            <Route 
              path="/gemara" 
              element={<GemaraExplorer />} 
            />
            <Route 
              path="/shulchan-aruch" 
              element={<ShulchanAruchExplorer />} 
            />
            <Route 
              path="/sefarim" 
              element={<SefarimExplorer />} 
            />
            <Route 
              path="/smart-index" 
              element={<SmartIndex psakim={psakim} />} 
            />
            <Route 
              path="/source/:source" 
              element={<SourceView psakim={psakim} />} 
            />
            <Route 
              path="/connections" 
              element={<Connections psakim={psakim} />} 
            />
            <Route 
              path="/favorites" 
              element={<Favorites />} 
            />
          </Routes>
        </main>
      </div>
    </Router>
    </ThemeProvider>
  );
}

export default App;
