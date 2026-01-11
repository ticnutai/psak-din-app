import React, { useState } from 'react';
import { Settings, X, Type, AlignJustify, Columns, BookOpen, StickyNote, LayoutGrid, Maximize, ChevronsLeftRight } from 'lucide-react';

// Types
export interface ViewSettings {
  fontSize: number;
  fontFamily: 'david' | 'miriam' | 'arial' | 'frank';
  lineHeight: number;
  wordSpacing: number;
  viewMode: 'normal' | 'split' | 'focused' | 'wide';
}

export interface Annotation {
  id: string;
  type: 'note' | 'question' | 'reference';
  text: string;
  reference?: string; // הפניה
  position: {
    startOffset: number;
    endOffset: number;
  };
  createdAt: Date;
  highlightColor?: string;
}

interface ViewSettingsPanelProps {
  settings: ViewSettings;
  onSettingsChange: (settings: ViewSettings) => void;
  onClose: () => void;
  onAddAnnotation?: (type: 'note' | 'question' | 'reference') => void;
}

// Font families mapping
const FONT_FAMILIES = {
  david: { name: 'דוד', css: '"David Libre", "David", serif' },
  miriam: { name: 'מרים', css: '"Miriam Libre", "Miriam", sans-serif' },
  arial: { name: 'אריאל', css: 'Arial, sans-serif' },
  frank: { name: 'פרנק רוהל', css: '"Frank Ruhl Libre", serif' },
};

// RTL Slider Component - ימין = גדול, שמאל = קטן
const RTLSlider: React.FC<{
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  displayValue?: string;
  icon?: React.ReactNode;
}> = ({ label, value, min, max, step, onChange, displayValue, icon }) => {
  // RTL: הופך את הערך כך שימין יהיה הגדול
  const invertedValue = max - value + min;
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newInvertedValue = parseFloat(e.target.value);
    const actualValue = max - newInvertedValue + min;
    onChange(actualValue);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-navy-800 flex items-center gap-2">
          {icon}
          {label}
        </span>
        <span className="text-sm font-bold text-gold-600 bg-gold-100 px-2 py-0.5 rounded">
          {displayValue || value}
        </span>
      </div>
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={invertedValue}
          onChange={handleChange}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gold-500
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-5
            [&::-webkit-slider-thumb]:h-5
            [&::-webkit-slider-thumb]:bg-gold-500
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:shadow-lg
            [&::-webkit-slider-thumb]:border-2
            [&::-webkit-slider-thumb]:border-white
            [&::-webkit-slider-thumb]:cursor-pointer
            [&::-webkit-slider-thumb]:transition-all
            [&::-webkit-slider-thumb]:hover:bg-gold-600
            [&::-webkit-slider-thumb]:hover:scale-110"
          dir="ltr"
        />
        {/* Scale indicators */}
        <div className="flex justify-between text-xs text-mouse-400 mt-1 px-1">
          <span>גדול</span>
          <span>קטן</span>
        </div>
      </div>
    </div>
  );
};

// View Mode Button
const ViewModeButton: React.FC<{
  mode: ViewSettings['viewMode'];
  currentMode: ViewSettings['viewMode'];
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}> = ({ mode, currentMode, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all ${
      currentMode === mode
        ? 'bg-gold-400 border-gold-500 text-navy-900'
        : 'bg-white border-gold-300 text-navy-700 hover:bg-gold-50 hover:border-gold-400'
    }`}
  >
    {icon}
    <span className="text-xs font-medium">{label}</span>
  </button>
);

// Main Component
export const ViewSettingsPanel: React.FC<ViewSettingsPanelProps> = ({
  settings,
  onSettingsChange,
  onClose,
  onAddAnnotation,
}) => {
  const [activeSection, setActiveSection] = useState<'typography' | 'layout' | 'annotations'>('typography');

  const updateSetting = <K extends keyof ViewSettings>(key: K, value: ViewSettings[K]) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-cream-100 rounded-3xl shadow-2xl border-2 border-gold-400 w-full max-w-md max-h-[85vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-white border-b-2 border-gold-400 p-4 flex items-center justify-between">
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-navy-700" />
          </button>
          <h2 className="text-xl font-bold text-navy-900 flex items-center gap-2">
            <Settings className="w-5 h-5 text-gold-500" />
            הגדרות תצוגה
          </h2>
          <div className="w-9"></div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b-2 border-gold-300 bg-white">
          <button
            onClick={() => setActiveSection('typography')}
            className={`flex-1 py-3 text-sm font-medium transition-all ${
              activeSection === 'typography'
                ? 'bg-gold-100 text-navy-900 border-b-2 border-gold-500'
                : 'text-navy-600 hover:bg-gold-50'
            }`}
          >
            <Type className="w-4 h-4 mx-auto mb-1" />
            טיפוגרפיה
          </button>
          <button
            onClick={() => setActiveSection('layout')}
            className={`flex-1 py-3 text-sm font-medium transition-all ${
              activeSection === 'layout'
                ? 'bg-gold-100 text-navy-900 border-b-2 border-gold-500'
                : 'text-navy-600 hover:bg-gold-50'
            }`}
          >
            <LayoutGrid className="w-4 h-4 mx-auto mb-1" />
            תצוגה
          </button>
          <button
            onClick={() => setActiveSection('annotations')}
            className={`flex-1 py-3 text-sm font-medium transition-all ${
              activeSection === 'annotations'
                ? 'bg-gold-100 text-navy-900 border-b-2 border-gold-500'
                : 'text-navy-600 hover:bg-gold-50'
            }`}
          >
            <StickyNote className="w-4 h-4 mx-auto mb-1" />
            הערות
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto max-h-[55vh] space-y-6">
          {/* Typography Section */}
          {activeSection === 'typography' && (
            <>
              {/* Font Size Slider */}
              <RTLSlider
                label="גודל גופן"
                value={settings.fontSize}
                min={12}
                max={28}
                step={1}
                onChange={(v) => updateSetting('fontSize', v)}
                displayValue={`${settings.fontSize}px`}
                icon={<Type className="w-4 h-4 text-gold-500" />}
              />

              {/* Font Family */}
              <div className="space-y-2">
                <span className="text-sm font-medium text-navy-800 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-gold-500" />
                  סוג גופן
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(FONT_FAMILIES).map(([key, font]) => (
                    <button
                      key={key}
                      onClick={() => updateSetting('fontFamily', key as ViewSettings['fontFamily'])}
                      className={`px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                        settings.fontFamily === key
                          ? 'bg-gold-400 border-gold-500 text-navy-900'
                          : 'bg-white border-gold-300 text-navy-700 hover:bg-gold-50'
                      }`}
                      style={{ fontFamily: font.css }}
                    >
                      {font.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Line Height Slider */}
              <RTLSlider
                label="מרווח שורות"
                value={settings.lineHeight}
                min={1.2}
                max={3}
                step={0.1}
                onChange={(v) => updateSetting('lineHeight', v)}
                displayValue={settings.lineHeight.toFixed(1)}
                icon={<AlignJustify className="w-4 h-4 text-gold-500" />}
              />

              {/* Word Spacing Slider */}
              <RTLSlider
                label="מרווח מילים"
                value={settings.wordSpacing}
                min={0}
                max={10}
                step={0.5}
                onChange={(v) => updateSetting('wordSpacing', v)}
                displayValue={`${settings.wordSpacing}px`}
                icon={<ChevronsLeftRight className="w-4 h-4 text-gold-500" />}
              />

              {/* Preview */}
              <div className="mt-4 p-4 bg-white border-2 border-gold-300 rounded-xl">
                <div className="text-xs text-mouse-500 mb-2 text-center">תצוגה מקדימה</div>
                <p
                  className="text-navy-800 text-center leading-relaxed"
                  style={{
                    fontSize: `${settings.fontSize}px`,
                    fontFamily: FONT_FAMILIES[settings.fontFamily].css,
                    lineHeight: settings.lineHeight,
                    wordSpacing: `${settings.wordSpacing}px`,
                  }}
                >
                  בראשית ברא אלהים את השמים ואת הארץ. והארץ היתה תהו ובהו.
                </p>
              </div>
            </>
          )}

          {/* Layout Section */}
          {activeSection === 'layout' && (
            <>
              <div className="space-y-3">
                <span className="text-sm font-medium text-navy-800">מצב תצוגה</span>
                <div className="grid grid-cols-2 gap-3">
                  <ViewModeButton
                    mode="normal"
                    currentMode={settings.viewMode}
                    onClick={() => updateSetting('viewMode', 'normal')}
                    icon={<BookOpen className="w-6 h-6" />}
                    label="רגיל"
                  />
                  <ViewModeButton
                    mode="split"
                    currentMode={settings.viewMode}
                    onClick={() => updateSetting('viewMode', 'split')}
                    icon={<Columns className="w-6 h-6" />}
                    label="מחולק לשניים"
                  />
                  <ViewModeButton
                    mode="focused"
                    currentMode={settings.viewMode}
                    onClick={() => updateSetting('viewMode', 'focused')}
                    icon={<Maximize className="w-6 h-6" />}
                    label="מיקוד (צר)"
                  />
                  <ViewModeButton
                    mode="wide"
                    currentMode={settings.viewMode}
                    onClick={() => updateSetting('viewMode', 'wide')}
                    icon={<ChevronsLeftRight className="w-6 h-6" />}
                    label="רחב"
                  />
                </div>
              </div>

              {/* View Mode Descriptions */}
              <div className="bg-white border-2 border-gold-300 rounded-xl p-4">
                <div className="text-sm text-navy-700">
                  {settings.viewMode === 'normal' && (
                    <p>📖 <strong>תצוגה רגילה</strong> - מאוזנת לקריאה נוחה</p>
                  )}
                  {settings.viewMode === 'split' && (
                    <p>📑 <strong>מחולק לשניים</strong> - מושלם להשוואת טקסטים או מקורות</p>
                  )}
                  {settings.viewMode === 'focused' && (
                    <p>🎯 <strong>מיקוד</strong> - טקסט צר יותר לריכוז מרבי</p>
                  )}
                  {settings.viewMode === 'wide' && (
                    <p>📐 <strong>רחב</strong> - ניצול מלא של רוחב המסך</p>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Annotations Section */}
          {activeSection === 'annotations' && onAddAnnotation && (
            <>
              <div className="space-y-3">
                <span className="text-sm font-medium text-navy-800">הוספת תוכן</span>
                <p className="text-xs text-mouse-500">
                  בחר טקסט ולחץ על אחת האפשרויות להוספה
                </p>
                
                <div className="space-y-2">
                  <button
                    onClick={() => onAddAnnotation('note')}
                    className="w-full flex items-center gap-3 p-4 bg-white border-2 border-gold-300 rounded-xl hover:bg-gold-50 hover:border-gold-400 transition-all text-right"
                  >
                    <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center text-xl">
                      📝
                    </div>
                    <div>
                      <div className="font-medium text-navy-900">הערה</div>
                      <div className="text-xs text-mouse-500">הוסף הערה אישית לטקסט</div>
                    </div>
                  </button>

                  <button
                    onClick={() => onAddAnnotation('question')}
                    className="w-full flex items-center gap-3 p-4 bg-white border-2 border-gold-300 rounded-xl hover:bg-gold-50 hover:border-gold-400 transition-all text-right"
                  >
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-xl">
                      ❓
                    </div>
                    <div>
                      <div className="font-medium text-navy-900">שאלה</div>
                      <div className="text-xs text-mouse-500">סמן שאלה לעיון נוסף</div>
                    </div>
                  </button>

                  <button
                    onClick={() => onAddAnnotation('reference')}
                    className="w-full flex items-center gap-3 p-4 bg-white border-2 border-gold-300 rounded-xl hover:bg-gold-50 hover:border-gold-400 transition-all text-right"
                  >
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-xl">
                      🔗
                    </div>
                    <div>
                      <div className="font-medium text-navy-900">הפניה</div>
                      <div className="text-xs text-mouse-500">הוסף קישור למקור אחר</div>
                    </div>
                  </button>
                </div>
              </div>

              <div className="bg-gold-50 border border-gold-300 rounded-xl p-4 text-sm text-navy-700">
                <p className="font-medium mb-1">💡 טיפ</p>
                <p className="text-xs">
                  כל ההערות וההפניות נשמרות אוטומטית ויהיו זמינות בפעם הבאה שתפתח את הטקסט.
                </p>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="bg-white border-t-2 border-gold-300 p-4 flex justify-center">
          <button
            onClick={() => {
              onSettingsChange({
                fontSize: 18,
                fontFamily: 'frank',
                lineHeight: 1.8,
                wordSpacing: 2,
                viewMode: 'normal',
              });
            }}
            className="px-6 py-2 bg-mouse-100 text-navy-700 rounded-xl hover:bg-mouse-200 transition-colors text-sm font-medium"
          >
            איפוס להגדרות ברירת מחדל
          </button>
        </div>
      </div>
    </div>
  );
};

// Settings Toggle Button Component
export const ViewSettingsButton: React.FC<{
  onClick: () => void;
}> = ({ onClick }) => (
  <button
    onClick={onClick}
    className="fixed bottom-6 right-6 z-40 w-10 h-10 bg-navy-900 text-gold-400 rounded-full shadow-xl flex items-center justify-center hover:bg-navy-800 transition-all hover:scale-110"
    title="הגדרות תצוגה"
  >
    <Settings className="w-4 h-4" />
  </button>
);

export default ViewSettingsPanel;
