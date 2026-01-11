import React, { useState, useEffect } from 'react';
import { X, Palette, Type, Square, Sun, Copy, Download, Upload, Trash2, Check, Plus, Sparkles } from 'lucide-react';
import { useTheme, Theme } from '../context/ThemeContext';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'themes' | 'colors' | 'typography' | 'borders' | 'custom';

const SettingsPanel: React.FC<SettingsPanelProps> = ({ isOpen, onClose }) => {
  const { currentTheme, themes, setTheme, updateCustomTheme, deleteCustomTheme, duplicateTheme, exportTheme, importTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<TabType>('themes');
  const [editingTheme, setEditingTheme] = useState<Theme | null>(null);
  const [showNewThemeModal, setShowNewThemeModal] = useState(false);
  const [newThemeName, setNewThemeName] = useState('');
  const [importJson, setImportJson] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);
  // previewTheme can be used for hover previews in the future
  const [, setPreviewTheme] = useState<Theme | null>(null);

  useEffect(() => {
    if (isOpen) {
      setEditingTheme(null);
      setPreviewTheme(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const tabs = [
    { id: 'themes' as TabType, label: 'ערכות נושא', icon: Palette },
    { id: 'colors' as TabType, label: 'צבעים', icon: Sun },
    { id: 'typography' as TabType, label: 'טיפוגרפיה', icon: Type },
    { id: 'borders' as TabType, label: 'מסגרות', icon: Square },
    { id: 'custom' as TabType, label: 'מותאם אישית', icon: Sparkles },
  ];

  const handleCreateNewTheme = () => {
    if (!newThemeName.trim()) return;
    
    const newTheme = duplicateTheme(currentTheme.id, newThemeName);
    setTheme(newTheme.id);
    setEditingTheme(newTheme);
    setNewThemeName('');
    setShowNewThemeModal(false);
    setActiveTab('colors');
  };

  const handleImportTheme = () => {
    if (importTheme(importJson)) {
      setImportJson('');
      setShowImportModal(false);
    }
  };

  const handleExportTheme = (themeId: string) => {
    const json = exportTheme(themeId);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `theme-${themeId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderColorPicker = (label: string, colorKey: keyof Theme['colors'], _category: string) => {
    const theme = editingTheme || currentTheme;
    if (!theme.isCustom && !editingTheme) return null;
    
    return (
      <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200 hover:border-navy-300 transition-colors">
        <span className="text-navy-800 font-medium text-sm">{label}</span>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={theme.colors[colorKey]}
            onChange={(e) => {
              if (theme.isCustom) {
                updateCustomTheme(theme.id, {
                  colors: { ...theme.colors, [colorKey]: e.target.value }
                });
              }
            }}
            className="w-10 h-10 rounded-lg cursor-pointer border-2 border-gray-300 hover:border-navy-400 transition-colors"
            disabled={!theme.isCustom}
          />
          <span className="text-xs font-mono text-gray-500 w-20">{theme.colors[colorKey]}</span>
        </div>
      </div>
    );
  };

  const renderThemesTab = () => (
    <div className="space-y-6">
      {/* Built-in Themes */}
      <div>
        <h3 className="text-lg font-bold text-navy-900 mb-4 flex items-center gap-2">
          <Palette className="w-5 h-5 text-navy-600" />
          ערכות נושא מובנות
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {themes.filter(t => !t.isCustom).map((theme) => (
            <div
              key={theme.id}
              className={`relative p-4 rounded-2xl border-2 cursor-pointer transition-all hover:scale-[1.02] ${
                currentTheme.id === theme.id
                  ? 'border-navy-900 shadow-lg ring-2 ring-navy-300'
                  : 'border-gray-200 hover:border-navy-300'
              }`}
              style={{ backgroundColor: theme.colors.bgPrimary }}
              onClick={() => setTheme(theme.id)}
              onMouseEnter={() => setPreviewTheme(theme)}
              onMouseLeave={() => setPreviewTheme(null)}
            >
              {/* Theme Preview */}
              <div className="mb-3 flex gap-2">
                <div className="w-8 h-8 rounded-lg" style={{ backgroundColor: theme.colors.primary }} />
                <div className="w-8 h-8 rounded-lg" style={{ backgroundColor: theme.colors.accent }} />
                <div className="w-8 h-8 rounded-lg" style={{ backgroundColor: theme.colors.bgSecondary }} />
              </div>
              
              <h4 className="font-bold mb-1" style={{ color: theme.colors.textPrimary }}>
                {theme.name}
              </h4>
              <p className="text-xs" style={{ color: theme.colors.textMuted }}>
                {theme.description}
              </p>
              
              {currentTheme.id === theme.id && (
                <div className="absolute top-2 left-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}
              
              {/* Actions */}
              <div className="absolute top-2 right-2 flex gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setNewThemeName(`${theme.name} - עותק`);
                    setShowNewThemeModal(true);
                  }}
                  className="w-7 h-7 rounded-lg bg-white/80 hover:bg-white flex items-center justify-center text-navy-600 hover:text-navy-900 transition-colors"
                  title="שכפל ערכת נושא"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Custom Themes */}
      {themes.filter(t => t.isCustom).length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-navy-900 mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            ערכות נושא מותאמות אישית
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {themes.filter(t => t.isCustom).map((theme) => (
              <div
                key={theme.id}
                className={`relative p-4 rounded-2xl border-2 cursor-pointer transition-all hover:scale-[1.02] ${
                  currentTheme.id === theme.id
                    ? 'border-purple-500 shadow-lg ring-2 ring-purple-300'
                    : 'border-gray-200 hover:border-purple-300'
                }`}
                style={{ backgroundColor: theme.colors.bgPrimary }}
                onClick={() => setTheme(theme.id)}
              >
                {/* Theme Preview */}
                <div className="mb-3 flex gap-2">
                  <div className="w-8 h-8 rounded-lg" style={{ backgroundColor: theme.colors.primary }} />
                  <div className="w-8 h-8 rounded-lg" style={{ backgroundColor: theme.colors.accent }} />
                  <div className="w-8 h-8 rounded-lg" style={{ backgroundColor: theme.colors.bgSecondary }} />
                </div>
                
                <h4 className="font-bold mb-1" style={{ color: theme.colors.textPrimary }}>
                  {theme.name}
                </h4>
                <p className="text-xs" style={{ color: theme.colors.textMuted }}>
                  {theme.description || 'ערכת נושא מותאמת אישית'}
                </p>
                
                {currentTheme.id === theme.id && (
                  <div className="absolute top-2 left-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
                
                {/* Actions */}
                <div className="absolute top-2 right-2 flex gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingTheme(theme);
                      setActiveTab('colors');
                    }}
                    className="w-7 h-7 rounded-lg bg-white/80 hover:bg-white flex items-center justify-center text-navy-600 hover:text-navy-900 transition-colors"
                    title="ערוך"
                  >
                    <Palette className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleExportTheme(theme.id);
                    }}
                    className="w-7 h-7 rounded-lg bg-white/80 hover:bg-white flex items-center justify-center text-navy-600 hover:text-navy-900 transition-colors"
                    title="ייצא"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('האם למחוק את ערכת הנושא?')) {
                        deleteCustomTheme(theme.id);
                      }
                    }}
                    className="w-7 h-7 rounded-lg bg-white/80 hover:bg-red-100 flex items-center justify-center text-red-500 hover:text-red-700 transition-colors"
                    title="מחק"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4 border-t border-gray-200">
        <button
          onClick={() => setShowNewThemeModal(true)}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-xl font-bold hover:from-purple-600 hover:to-indigo-600 transition-all shadow-lg"
        >
          <Plus className="w-5 h-5" />
          צור ערכת נושא חדשה
        </button>
        <button
          onClick={() => setShowImportModal(true)}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-navy-100 text-navy-700 rounded-xl font-bold hover:bg-navy-200 transition-colors"
        >
          <Upload className="w-5 h-5" />
          ייבא
        </button>
      </div>
    </div>
  );

  const renderColorsTab = () => {
    const theme = editingTheme || currentTheme;
    const isEditable = theme.isCustom;

    return (
      <div className="space-y-6">
        {!isEditable && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm">
            💡 כדי לערוך צבעים, צור ערכת נושא מותאמת אישית או שכפל ערכה קיימת
          </div>
        )}

        {/* Primary Colors */}
        <div>
          <h3 className="text-md font-bold text-navy-900 mb-3">צבעים ראשיים</h3>
          <div className="space-y-2">
            {renderColorPicker('ראשי', 'primary', 'primary')}
            {renderColorPicker('ראשי (ריחוף)', 'primaryHover', 'primary')}
            {renderColorPicker('ראשי בהיר', 'primaryLight', 'primary')}
          </div>
        </div>

        {/* Accent Colors */}
        <div>
          <h3 className="text-md font-bold text-navy-900 mb-3">צבעי הדגשה</h3>
          <div className="space-y-2">
            {renderColorPicker('הדגשה', 'accent', 'accent')}
            {renderColorPicker('הדגשה (ריחוף)', 'accentHover', 'accent')}
          </div>
        </div>

        {/* Background Colors */}
        <div>
          <h3 className="text-md font-bold text-navy-900 mb-3">צבעי רקע</h3>
          <div className="space-y-2">
            {renderColorPicker('רקע ראשי', 'bgPrimary', 'bg')}
            {renderColorPicker('רקע משני', 'bgSecondary', 'bg')}
            {renderColorPicker('רקע שלישוני', 'bgTertiary', 'bg')}
          </div>
        </div>

        {/* Text Colors */}
        <div>
          <h3 className="text-md font-bold text-navy-900 mb-3">צבעי טקסט</h3>
          <div className="space-y-2">
            {renderColorPicker('טקסט ראשי', 'textPrimary', 'text')}
            {renderColorPicker('טקסט משני', 'textSecondary', 'text')}
            {renderColorPicker('טקסט מעומעם', 'textMuted', 'text')}
          </div>
        </div>

        {/* Border Colors */}
        <div>
          <h3 className="text-md font-bold text-navy-900 mb-3">צבעי מסגרות</h3>
          <div className="space-y-2">
            {renderColorPicker('מסגרת ראשית', 'borderPrimary', 'border')}
            {renderColorPicker('מסגרת משנית', 'borderSecondary', 'border')}
          </div>
        </div>

        {/* Sidebar Colors */}
        <div>
          <h3 className="text-md font-bold text-navy-900 mb-3">צבעי סיידבר</h3>
          <div className="space-y-2">
            {renderColorPicker('רקע סיידבר', 'sidebarBg', 'sidebar')}
            {renderColorPicker('טקסט סיידבר', 'sidebarText', 'sidebar')}
            {renderColorPicker('מסגרת סיידבר', 'sidebarBorder', 'sidebar')}
            {renderColorPicker('הדגשת סיידבר', 'sidebarAccent', 'sidebar')}
          </div>
        </div>

        {/* Card Colors */}
        <div>
          <h3 className="text-md font-bold text-navy-900 mb-3">צבעי כרטיסים</h3>
          <div className="space-y-2">
            {renderColorPicker('רקע כרטיס', 'cardBg', 'card')}
            {renderColorPicker('מסגרת כרטיס', 'cardBorder', 'card')}
          </div>
        </div>
      </div>
    );
  };

  const renderTypographyTab = () => {
    const theme = editingTheme || currentTheme;
    const isEditable = theme.isCustom;

    const fonts = [
      'Frank Ruhl Libre, serif',
      'Heebo, sans-serif',
      'David Libre, serif',
      'Arial, sans-serif',
      'Noto Sans Hebrew, sans-serif',
      'Rubik, sans-serif',
    ];

    return (
      <div className="space-y-6">
        {!isEditable && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm">
            💡 כדי לערוך טיפוגרפיה, צור ערכת נושא מותאמת אישית
          </div>
        )}

        {/* Font Family */}
        <div>
          <h3 className="text-md font-bold text-navy-900 mb-3">גופן</h3>
          <select
            value={theme.typography.fontFamily}
            onChange={(e) => {
              if (isEditable) {
                updateCustomTheme(theme.id, {
                  typography: { ...theme.typography, fontFamily: e.target.value }
                });
              }
            }}
            disabled={!isEditable}
            className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-navy-400 outline-none transition-colors"
          >
            {fonts.map(font => (
              <option key={font} value={font} style={{ fontFamily: font }}>
                {font.split(',')[0]}
              </option>
            ))}
          </select>
        </div>

        {/* Font Sizes */}
        <div>
          <h3 className="text-md font-bold text-navy-900 mb-3">גדלי גופן</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-600 mb-1 block">גודל בסיסי: {theme.typography.fontSizeBase}</label>
              <input
                type="range"
                min="12"
                max="24"
                value={parseInt(theme.typography.fontSizeBase)}
                onChange={(e) => {
                  if (isEditable) {
                    updateCustomTheme(theme.id, {
                      typography: { ...theme.typography, fontSizeBase: `${e.target.value}px` }
                    });
                  }
                }}
                disabled={!isEditable}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">גודל XL: {theme.typography.fontSizeXL}</label>
              <input
                type="range"
                min="18"
                max="36"
                value={parseInt(theme.typography.fontSizeXL)}
                onChange={(e) => {
                  if (isEditable) {
                    updateCustomTheme(theme.id, {
                      typography: { ...theme.typography, fontSizeXL: `${e.target.value}px` }
                    });
                  }
                }}
                disabled={!isEditable}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Line Height */}
        <div>
          <h3 className="text-md font-bold text-navy-900 mb-3">ריווח שורות: {theme.typography.lineHeight}</h3>
          <input
            type="range"
            min="1.2"
            max="2.2"
            step="0.1"
            value={parseFloat(theme.typography.lineHeight)}
            onChange={(e) => {
              if (isEditable) {
                updateCustomTheme(theme.id, {
                  typography: { ...theme.typography, lineHeight: e.target.value }
                });
              }
            }}
            disabled={!isEditable}
            className="w-full"
          />
        </div>

        {/* Preview */}
        <div className="p-6 rounded-xl border-2 border-gray-200" style={{ 
          fontFamily: theme.typography.fontFamily,
          fontSize: theme.typography.fontSizeBase,
          lineHeight: theme.typography.lineHeight,
          backgroundColor: theme.colors.bgPrimary,
          color: theme.colors.textPrimary
        }}>
          <h4 style={{ 
            fontSize: theme.typography.fontSizeXL, 
            fontWeight: theme.typography.headingWeight,
            marginBottom: '12px'
          }}>
            תצוגה מקדימה
          </h4>
          <p>
            זוהי תצוגה מקדימה של הגדרות הטיפוגרפיה שלך. 
            כל השינויים יחולו על כל הטקסטים באפליקציה.
          </p>
        </div>
      </div>
    );
  };

  const renderBordersTab = () => {
    const theme = editingTheme || currentTheme;
    const isEditable = theme.isCustom;

    return (
      <div className="space-y-6">
        {!isEditable && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm">
            💡 כדי לערוך מסגרות, צור ערכת נושא מותאמת אישית
          </div>
        )}

        {/* Border Radius */}
        <div>
          <h3 className="text-md font-bold text-navy-900 mb-3">עיגול פינות</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-600 mb-1 block">קטן: {theme.borders.radiusSmall}</label>
              <input
                type="range"
                min="0"
                max="20"
                value={parseInt(theme.borders.radiusSmall)}
                onChange={(e) => {
                  if (isEditable) {
                    updateCustomTheme(theme.id, {
                      borders: { ...theme.borders, radiusSmall: `${e.target.value}px` }
                    });
                  }
                }}
                disabled={!isEditable}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">בינוני: {theme.borders.radiusMedium}</label>
              <input
                type="range"
                min="0"
                max="30"
                value={parseInt(theme.borders.radiusMedium)}
                onChange={(e) => {
                  if (isEditable) {
                    updateCustomTheme(theme.id, {
                      borders: { ...theme.borders, radiusMedium: `${e.target.value}px` }
                    });
                  }
                }}
                disabled={!isEditable}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">גדול: {theme.borders.radiusLarge}</label>
              <input
                type="range"
                min="0"
                max="40"
                value={parseInt(theme.borders.radiusLarge)}
                onChange={(e) => {
                  if (isEditable) {
                    updateCustomTheme(theme.id, {
                      borders: { ...theme.borders, radiusLarge: `${e.target.value}px` }
                    });
                  }
                }}
                disabled={!isEditable}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Border Width */}
        <div>
          <h3 className="text-md font-bold text-navy-900 mb-3">עובי מסגרת: {theme.borders.borderWidth}</h3>
          <input
            type="range"
            min="1"
            max="5"
            value={parseInt(theme.borders.borderWidth)}
            onChange={(e) => {
              if (isEditable) {
                updateCustomTheme(theme.id, {
                  borders: { ...theme.borders, borderWidth: `${e.target.value}px` }
                });
              }
            }}
            disabled={!isEditable}
            className="w-full"
          />
        </div>

        {/* Preview */}
        <div className="grid grid-cols-3 gap-4">
          <div 
            className="p-4 text-center"
            style={{
              backgroundColor: theme.colors.cardBg,
              border: `${theme.borders.borderWidth} solid ${theme.colors.borderPrimary}`,
              borderRadius: theme.borders.radiusSmall
            }}
          >
            <span style={{ color: theme.colors.textPrimary }}>קטן</span>
          </div>
          <div 
            className="p-4 text-center"
            style={{
              backgroundColor: theme.colors.cardBg,
              border: `${theme.borders.borderWidth} solid ${theme.colors.borderPrimary}`,
              borderRadius: theme.borders.radiusMedium
            }}
          >
            <span style={{ color: theme.colors.textPrimary }}>בינוני</span>
          </div>
          <div 
            className="p-4 text-center"
            style={{
              backgroundColor: theme.colors.cardBg,
              border: `${theme.borders.borderWidth} solid ${theme.colors.borderPrimary}`,
              borderRadius: theme.borders.radiusLarge
            }}
          >
            <span style={{ color: theme.colors.textPrimary }}>גדול</span>
          </div>
        </div>
      </div>
    );
  };

  const renderCustomTab = () => {
    const theme = editingTheme || currentTheme;
    
    return (
      <div className="space-y-6">
        {/* Quick Theme Builder */}
        <div className="p-6 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl border-2 border-purple-200">
          <h3 className="text-lg font-bold text-purple-900 mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            בונה ערכות נושא מהיר
          </h3>
          
          <div className="space-y-4">
            <p className="text-sm text-purple-700">
              בחר צבע ראשי וצבע משני, והמערכת תיצור עבורך ערכת נושא שלמה!
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-purple-800 mb-2 block">צבע ראשי</label>
                <input
                  type="color"
                  defaultValue="#C9A227"
                  className="w-full h-12 rounded-xl cursor-pointer border-2 border-purple-300"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-purple-800 mb-2 block">צבע משני</label>
                <input
                  type="color"
                  defaultValue="#102a43"
                  className="w-full h-12 rounded-xl cursor-pointer border-2 border-purple-300"
                />
              </div>
            </div>
            
            <button className="w-full py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-xl font-bold hover:from-purple-600 hover:to-indigo-600 transition-all">
              צור ערכת נושא אוטומטית ✨
            </button>
          </div>
        </div>

        {/* Theme Templates */}
        <div>
          <h3 className="text-lg font-bold text-navy-900 mb-4">תבניות מהירות</h3>
          <div className="grid grid-cols-4 gap-3">
            {[
              { name: 'בהיר', bg: '#FFFFFF', primary: '#3B82F6', accent: '#1E40AF' },
              { name: 'כהה', bg: '#1F2937', primary: '#F59E0B', accent: '#78350F' },
              { name: 'ירוק', bg: '#F0FDF4', primary: '#10B981', accent: '#064E3B' },
              { name: 'ורוד', bg: '#FDF2F8', primary: '#EC4899', accent: '#831843' },
              { name: 'סגול', bg: '#FAF5FF', primary: '#8B5CF6', accent: '#4C1D95' },
              { name: 'כתום', bg: '#FFF7ED', primary: '#F97316', accent: '#7C2D12' },
              { name: 'אפור', bg: '#F9FAFB', primary: '#6B7280', accent: '#1F2937' },
              { name: 'טורקיז', bg: '#F0FDFA', primary: '#14B8A6', accent: '#134E4A' },
            ].map((template, idx) => (
              <button
                key={idx}
                className="p-3 rounded-xl border-2 border-gray-200 hover:border-navy-400 transition-all hover:scale-105"
                style={{ backgroundColor: template.bg }}
              >
                <div className="flex gap-1 mb-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: template.primary }} />
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: template.accent }} />
                </div>
                <span className="text-xs font-medium" style={{ color: template.accent }}>
                  {template.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Current Theme Info */}
        <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
          <h4 className="font-bold text-navy-900 mb-2">ערכת נושא נוכחית</h4>
          <p className="text-sm text-gray-600 mb-2">{theme.name}</p>
          <p className="text-xs text-gray-500">{theme.description}</p>
          {theme.isCustom && (
            <span className="inline-block mt-2 px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
              מותאמת אישית
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className="fixed inset-y-4 left-4 w-[600px] bg-white rounded-3xl shadow-2xl z-[101] flex flex-col overflow-hidden border-2 border-navy-200" dir="rtl">
        {/* Header */}
        <div className="p-6 bg-gradient-to-l from-navy-900 to-navy-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
              <Palette className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">הגדרות עיצוב</h2>
              <p className="text-navy-300 text-sm">התאם אישית את המראה והתחושה</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-6 py-3 bg-navy-50 border-b border-navy-200 flex gap-2 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-navy-900 text-white shadow-lg'
                  : 'bg-white text-navy-700 hover:bg-navy-100 border border-navy-200'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'themes' && renderThemesTab()}
          {activeTab === 'colors' && renderColorsTab()}
          {activeTab === 'typography' && renderTypographyTab()}
          {activeTab === 'borders' && renderBordersTab()}
          {activeTab === 'custom' && renderCustomTab()}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
          <span className="text-sm text-gray-500">
            ערכת נושא: <strong className="text-navy-900">{currentTheme.name}</strong>
          </span>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-navy-900 text-white rounded-xl font-bold hover:bg-navy-800 transition-colors"
          >
            סגור
          </button>
        </div>
      </div>

      {/* New Theme Modal */}
      {showNewThemeModal && (
        <div className="fixed inset-0 flex items-center justify-center z-[102]" dir="rtl">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowNewThemeModal(false)} />
          <div className="relative bg-white rounded-2xl p-6 w-96 shadow-2xl">
            <h3 className="text-xl font-bold text-navy-900 mb-4">צור ערכת נושא חדשה</h3>
            <input
              type="text"
              value={newThemeName}
              onChange={(e) => setNewThemeName(e.target.value)}
              placeholder="שם ערכת הנושא"
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-navy-400 outline-none mb-4"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={handleCreateNewTheme}
                disabled={!newThemeName.trim()}
                className="flex-1 py-3 bg-navy-900 text-white rounded-xl font-bold hover:bg-navy-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                צור
              </button>
              <button
                onClick={() => setShowNewThemeModal(false)}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors"
              >
                ביטול
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 flex items-center justify-center z-[102]" dir="rtl">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowImportModal(false)} />
          <div className="relative bg-white rounded-2xl p-6 w-[500px] shadow-2xl">
            <h3 className="text-xl font-bold text-navy-900 mb-4">ייבא ערכת נושא</h3>
            <textarea
              value={importJson}
              onChange={(e) => setImportJson(e.target.value)}
              placeholder="הדבק כאן את ה-JSON של ערכת הנושא..."
              className="w-full h-48 p-3 border-2 border-gray-200 rounded-xl focus:border-navy-400 outline-none mb-4 font-mono text-sm"
            />
            <div className="flex gap-3">
              <button
                onClick={handleImportTheme}
                disabled={!importJson.trim()}
                className="flex-1 py-3 bg-navy-900 text-white rounded-xl font-bold hover:bg-navy-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ייבא
              </button>
              <button
                onClick={() => setShowImportModal(false)}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors"
              >
                ביטול
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SettingsPanel;
