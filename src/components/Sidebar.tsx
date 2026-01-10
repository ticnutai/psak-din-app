import { NavLink } from 'react-router-dom';
import { 
  Home, 
  FileText, 
  Upload, 
  BookOpen, 
  Link2, 
  Scale,
  Sparkles,
  Brain,
  Book,
  Library
} from 'lucide-react';

interface SidebarProps {
  psakCount: number;
}

const Sidebar = ({ psakCount }: SidebarProps) => {
  const navItems = [
    { path: '/', icon: Home, label: 'לוח בקרה' },
    { path: '/psakim', icon: FileText, label: 'פסקי דין', badge: psakCount },
    { path: '/upload', icon: Upload, label: 'העלאת פסקים' },
    { path: '/gemara', icon: Book, label: 'גמרא', highlight: true },
    { path: '/shulchan-aruch', icon: Scale, label: 'שולחן ערוך', highlight: true },
    { path: '/smart-index', icon: Brain, label: 'אינדקס חכם', highlight: true },
    { path: '/connections', icon: Link2, label: 'קישור לספרים' },
  ];

  return (
    <aside className="fixed right-0 top-0 h-full w-72 bg-gradient-to-b from-navy-900 to-navy-950 text-white shadow-2xl z-50">
      {/* Logo */}
      <div className="p-6 border-b border-gold-500/30">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-gold-400 to-gold-600 rounded-2xl shadow-gold">
            <Scale className="w-8 h-8 text-navy-900" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gold-400">
              מאגר פסקי דין
            </h1>
            <p className="text-sm text-cream-400">בית דין רבני</p>
          </div>
        </div>
      </div>

      {/* Divider with title */}
      <div className="px-6 py-4 border-b border-navy-700">
        <h2 className="text-sm font-bold text-cream-300 tracking-wide">תפריט ראשי</h2>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2">
        {navItems.map(({ path, icon: Icon, label, badge, highlight }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group relative ${
                isActive
                  ? 'bg-gradient-to-l from-gold-500 to-gold-600 text-navy-900 shadow-gold font-bold'
                  : 'hover:bg-navy-800/80 text-cream-200 hover:text-white hover:border-gold-500/30'
              } ${highlight && !isActive ? 'border-2 border-gold-500/40' : ''}`
            }
          >
            <Icon className={`w-5 h-5 transition-transform group-hover:scale-110`} />
            <span className="font-medium text-base">{label}</span>
            {highlight && (
              <Sparkles className="w-3.5 h-3.5 text-gold-400 absolute top-2 left-2" />
            )}
            {badge !== undefined && badge > 0 && (
              <span className="mr-auto bg-gold-500 text-navy-900 text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
                {badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Shas Section */}
      <div className="px-6 py-4 border-t border-navy-700 mt-4">
        <h2 className="text-sm font-bold text-cream-300 tracking-wide mb-3">מסכתות הגמרא</h2>
        <div className="grid grid-cols-2 gap-2 text-sm">
          {['סדר זרעים', 'סדר מועד', 'סדר נשים', 'סדר נזיקין', 'סדר קדשים', 'סדר טהרות'].map((seder, idx) => (
            <div key={idx} className="flex items-center justify-between px-3 py-2 bg-navy-800/50 rounded-lg border border-navy-700 hover:border-gold-500/30 transition-colors cursor-pointer">
              <span className="text-cream-200 text-xs">{seder}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 right-0 left-0 p-4 border-t border-navy-700 bg-navy-950/80 backdrop-blur-sm">
        <div className="flex items-center gap-2 text-gold-400 text-sm">
          <Sparkles className="w-4 h-4" />
          <span className="text-cream-300">מערכת חכמה לניהול פסקי דין</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
