import { NavLink } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Settings } from 'lucide-react';
import SettingsPanel from './SettingsPanel';

interface SidebarProps {
  psakCount: number;
  onPinnedChange?: (isPinned: boolean) => void;
  onWidthChange?: (width: number) => void;
}

const Sidebar = ({ psakCount, onPinnedChange, onWidthChange }: SidebarProps) => {
  const [isPinned, setIsPinned] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [width, setWidth] = useState(288); // 72 * 4 = 288px (w-72)
  const [isResizing, setIsResizing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Mouse tracking for auto-show
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isPinned) return;
      
      const threshold = 50;
      
      // Show when mouse near right edge
      if (e.clientX >= window.innerWidth - threshold) {
        setIsVisible(true);
      } else if (e.clientX < window.innerWidth - width - 50) { // Hide when far from sidebar
        if (!isHovering) {
          setIsVisible(false);
        }
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isPinned, isHovering, width]);

  // Handle resize
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      
      const newWidth = window.innerWidth - e.clientX;
      if (newWidth >= 200 && newWidth <= 500) { // Min 200px, Max 500px
        setWidth(newWidth);
        onWidthChange?.(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, onWidthChange]);

  const navItems = [
    { path: '/', label: 'לוח בקרה' },
    { path: '/psakim', label: 'פסקי דין', badge: psakCount },
    { path: '/favorites', label: 'מועדפים' },
    { path: '/upload', label: 'העלאת פסקים' },
    { path: '/gemara', label: 'גמרא', highlight: true },
    { path: '/shulchan-aruch', label: 'שולחן ערוך', highlight: true },
    { path: '/smart-index', label: 'אינדקס חכם', highlight: true },
    { path: '/connections', label: 'קישור לספרים' },
  ];

  return (
    <aside 
      className={`fixed right-0 top-0 h-full bg-cream-100 border-l-2 border-gold-400 shadow-elegant z-50 transition-transform duration-300 ${
        isPinned || isVisible ? 'translate-x-0' : 'translate-x-full'
      }`}
      style={{ width: `${width}px` }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Resize Handle */}
      {isPinned && (
        <div
          className="absolute left-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-gold-400 transition-colors z-50 group"
          onMouseDown={() => setIsResizing(true)}
          title="גרור לשינוי רוחב"
        >
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-12 bg-gold-300 rounded-full group-hover:bg-gold-500 transition-colors" />
        </div>
      )}
      
      {/* Pin Button - appears when hovering */}
      <div className="absolute top-4 left-4 z-10 group">
        <button
          onClick={() => {
            const newPinned = !isPinned;
            setIsPinned(newPinned);
            onPinnedChange?.(newPinned);
          }}
          className={`
            w-8 h-8 rounded-full shadow-lg
            flex items-center justify-center
            transition-all duration-300
            ${isPinned 
              ? 'bg-gold-500 text-white hover:bg-gold-600' 
              : 'bg-white text-gold-600 hover:bg-gold-50 border-2 border-gold-400'
            }
          `}
          title={isPinned ? 'בטל הצמדה' : 'הצמד סיידבר'}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        </button>
        {/* Tooltip on hover */}
        <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
          <div className="bg-navy-900 text-white px-3 py-1.5 rounded-lg text-sm shadow-lg">
            {isPinned ? 'בטל הצמדה' : 'הצמד סיידבר'}
          </div>
        </div>
      </div>
      
      {/* Logo */}
      <div className="p-6 border-b-2 border-gold-400 bg-white">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-gold-400 to-gold-600 rounded-2xl shadow-gold flex items-center justify-center border-2 border-gold-500">
            <span className="text-2xl font-bold text-navy-900">פד</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-navy-900">
              מאגר פסקי דין
            </h1>
            <p className="text-sm text-mouse-600">בית דין רבני</p>
          </div>
        </div>
      </div>

      {/* Divider with title */}
      <div className="px-6 py-4 border-b border-gold-300 bg-white">
        <h2 className="text-sm font-bold text-navy-800">תפריט ראשי</h2>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2 bg-cream-50">
        {navItems.map(({ path, label, badge, highlight }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group relative ${
                isActive
                  ? 'bg-gradient-to-l from-gold-500 to-gold-600 text-navy-900 shadow-gold font-bold border-2 border-gold-500'
                  : 'bg-white hover:bg-gold-50 text-navy-800 hover:text-navy-900 border-2 border-gold-300 hover:border-gold-400'
              } ${highlight && !isActive ? 'border-gold-400' : ''}`
            }
          >
            <span className="font-medium text-base">{label}</span>
            {badge !== undefined && badge > 0 && (
              <span className="mr-auto bg-gold-500 text-navy-900 text-xs font-bold px-2.5 py-1 rounded-full shadow-sm border border-gold-600">
                {badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Shas Section */}
      <div className="px-6 py-4 border-t-2 border-gold-300 mt-4 bg-white">
        <h2 className="text-sm font-bold text-navy-800 mb-3">מסכתות הגמרא</h2>
        <div className="grid grid-cols-2 gap-2 text-sm">
          {['סדר זרעים', 'סדר מועד', 'סדר נשים', 'סדר נזיקין', 'סדר קדשים', 'סדר טהרות'].map((seder, idx) => (
            <div key={idx} className="flex items-center justify-between px-3 py-2 bg-cream-50 rounded-lg border-2 border-gold-300 hover:border-gold-400 hover:bg-gold-50 transition-colors cursor-pointer">
              <span className="text-navy-800 text-xs font-medium">{seder}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 right-0 left-0 p-4 border-t-2 border-gold-400 bg-white">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowSettings(true)}
            className="w-10 h-10 bg-navy-800 hover:bg-navy-900 rounded-xl flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-all hover:scale-105 group"
            title="הגדרות עיצוב"
          >
            <Settings className="w-5 h-5 group-hover:rotate-45 transition-transform duration-300" />
          </button>
          <div className="text-navy-800 text-sm text-center font-medium flex-1">
            מערכת חכמה לניהול פסקי דין
          </div>
        </div>
      </div>

      {/* Settings Panel */}
      <SettingsPanel isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </aside>
  );
};

export default Sidebar;
