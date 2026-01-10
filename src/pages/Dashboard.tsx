import { PsakDin } from '../types';
import { 
  FileText, 
  BookOpen, 
  Link2, 
  TrendingUp,
  Calendar,
  Tag,
  Scale
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface DashboardProps {
  psakim: PsakDin[];
}

const Dashboard = ({ psakim }: DashboardProps) => {
  // Calculate statistics
  const totalReferences = psakim.reduce((acc, p) => acc + p.references.length, 0);
  const categories = [...new Set(psakim.flatMap(p => p.categories))];
  const recentPsakim = [...psakim]
    .sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime())
    .slice(0, 5);

  const stats = [
    { 
      label: 'פסקי דין', 
      value: psakim.length, 
      icon: FileText, 
      borderColor: 'border-gold-400',
      iconBg: 'bg-navy-900',
      iconColor: 'text-gold-400'
    },
    { 
      label: 'הפניות למקורות', 
      value: totalReferences, 
      icon: BookOpen, 
      borderColor: 'border-gold-400',
      iconBg: 'bg-gold-500',
      iconColor: 'text-white'
    },
    { 
      label: 'קטגוריות', 
      value: categories.length, 
      icon: Tag, 
      borderColor: 'border-gold-400',
      iconBg: 'bg-navy-800',
      iconColor: 'text-gold-400'
    },
    { 
      label: 'קישורים לספרים', 
      value: totalReferences, 
      icon: Link2, 
      borderColor: 'border-gold-400',
      iconBg: 'bg-gold-600',
      iconColor: 'text-white'
    },
  ];

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8 p-6 bg-white rounded-2xl border-2 border-gold-400 shadow-elegant">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-gradient-to-br from-gold-400 to-gold-600 rounded-2xl shadow-gold">
            <Scale className="w-10 h-10 text-navy-900" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-navy-900 mb-1">
              מאגר פסקי דין רבניים
            </h1>
            <p className="text-mouse-600 text-lg">
              מערכת חכמה לניהול, חיפוש וקישור פסקי דין למקורות הלכתיים
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map(({ label, value, icon: Icon, borderColor, iconBg, iconColor }) => (
          <div 
            key={label}
            className={`bg-white rounded-2xl p-6 border-2 ${borderColor} card-elegant transition-all hover:shadow-gold`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${iconBg} shadow-lg`}>
                <Icon className={`w-6 h-6 ${iconColor}`} />
              </div>
              <TrendingUp className="w-5 h-5 text-gold-500" />
            </div>
            <div className="text-4xl font-bold text-navy-900 mb-1">{value}</div>
            <div className="text-mouse-600 font-medium">{label}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions & Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="bg-white rounded-2xl p-6 border-2 border-gold-400 shadow-elegant">
          <h2 className="text-xl font-bold text-navy-900 mb-4 flex items-center gap-2">
            <div className="p-2 bg-gold-500 rounded-lg">
              <Scale className="w-5 h-5 text-navy-900" />
            </div>
            פעולות מהירות
          </h2>
          <div className="space-y-3">
            <Link 
              to="/upload"
              className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-l from-cream-100 to-cream-200 hover:from-gold-100 hover:to-gold-200 transition-all group border border-gold-200"
            >
              <div className="p-2 bg-navy-900 rounded-lg group-hover:bg-gold-500 transition-colors">
                <FileText className="w-5 h-5 text-gold-400 group-hover:text-navy-900" />
              </div>
              <div>
                <div className="font-medium text-navy-900">העלאת פסקי דין</div>
                <div className="text-sm text-mouse-600">העלה קבצי HTML של פסקי דין</div>
              </div>
            </Link>
            <Link 
              to="/index"
              className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-l from-cream-100 to-cream-200 hover:from-gold-100 hover:to-gold-200 transition-all group border border-gold-200"
            >
              <div className="p-2 bg-gold-500 rounded-lg group-hover:bg-navy-900 transition-colors">
                <BookOpen className="w-5 h-5 text-navy-900 group-hover:text-gold-400" />
              </div>
              <div>
                <div className="font-medium text-navy-900">צפייה באינדקס</div>
                <div className="text-sm text-mouse-600">אינדקס מפורט של כל הפסקים</div>
              </div>
            </Link>
            <Link 
              to="/connections"
              className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-l from-cream-100 to-cream-200 hover:from-gold-100 hover:to-gold-200 transition-all group border border-gold-200"
            >
              <div className="p-2 bg-navy-800 rounded-lg group-hover:bg-gold-500 transition-colors">
                <Link2 className="w-5 h-5 text-gold-400 group-hover:text-navy-900" />
              </div>
              <div>
                <div className="font-medium text-navy-900">קישור לספרי קודש</div>
                <div className="text-sm text-mouse-600">חבר פסקים לגמרא ושו"ע</div>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Psakim */}
        <div className="bg-white rounded-2xl p-6 border-2 border-gold-400 shadow-elegant">
          <h2 className="text-xl font-bold text-navy-900 mb-4 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-gold-500" />
            פסקים אחרונים
          </h2>
          {recentPsakim.length > 0 ? (
            <div className="space-y-3">
              {recentPsakim.map(psak => (
                <Link
                  key={psak.id}
                  to={`/psak/${psak.id}`}
                  className="block p-4 rounded-xl border-2 border-cream-300 hover:border-gold-400 hover:bg-gold-50 transition-all"
                >
                  <div className="font-medium text-navy-900 mb-1">{psak.title}</div>
                  <div className="flex items-center gap-2 text-sm text-mouse-600">
                    <span>פסק #{psak.number}</span>
                    <span>•</span>
                    <span>{psak.categories.join(', ')}</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-mouse-500">
              <FileText className="w-12 h-12 mx-auto mb-3 text-gold-300" />
              <p>עדיין לא הועלו פסקי דין</p>
              <Link to="/upload" className="text-gold-600 hover:text-gold-700 hover:underline font-medium">
                העלה פסקים עכשיו
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Categories Overview */}
      {categories.length > 0 && (
        <div className="mt-6 bg-white rounded-2xl p-6 border-2 border-gold-400 shadow-elegant">
          <h2 className="text-xl font-bold text-navy-900 mb-4 flex items-center gap-2">
            <Tag className="w-6 h-6 text-gold-500" />
            קטגוריות
          </h2>
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <span 
                key={cat}
                className="px-4 py-2 bg-gradient-to-r from-gold-100 to-gold-200 text-navy-900 rounded-full text-sm font-medium border-2 border-gold-400 hover:from-gold-200 hover:to-gold-300 transition-all cursor-default"
              >
                {cat}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
