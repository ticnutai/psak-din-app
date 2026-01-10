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
import { PsakDin } from './types';
import { parsePsakFile } from './utils/psakUtils';

const STORAGE_KEY = 'psak-din-storage';

function App() {
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
          newPsakim.push(psak);
        }
      }
      setPsakim(prev => [...prev, ...newPsakim]);
    } catch (error) {
      console.error('Error uploading files:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleDelete = useCallback((id: string) => {
    setPsakim(prev => prev.filter(p => p.id !== id));
  }, []);

  return (
    <Router>
      <div className="flex min-h-screen bg-cream-gradient">
        <Sidebar psakCount={psakim.length} />
        <main className="flex-1 mr-72 p-8 bg-gradient-to-br from-cream-100 to-cream-200">
          {/* Debug info */}
          {process.env.NODE_ENV === 'development' && (
            <div className="fixed bottom-4 left-4 bg-navy-900 text-gold-400 px-4 py-2 rounded-xl shadow-lg text-sm z-50 border border-gold-500/30">
              📊 פסקים בזיכרון: {psakim.length}
            </div>
          )}
          <Routes>
            <Route path="/" element={<Dashboard psakim={psakim} />} />
            <Route 
              path="/psakim" 
              element={<PsakimList psakim={psakim} onDelete={handleDelete} />} 
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
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
