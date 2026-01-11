import React from 'react';
import { ViewSettings } from './ViewSettingsPanel';

// Font families CSS
const FONT_FAMILIES = {
  david: '"David Libre", "David", serif',
  miriam: '"Miriam Libre", "Miriam", sans-serif',
  arial: 'Arial, sans-serif',
  frank: '"Frank Ruhl Libre", serif',
};

interface ContentViewerProps {
  content: string;
  settings: ViewSettings;
  className?: string;
  contentEditable?: boolean;
  onContentChange?: (html: string) => void;
}

export const ContentViewer: React.FC<ContentViewerProps> = ({
  content,
  settings,
  className = '',
  contentEditable = false,
  onContentChange,
}) => {
  const contentStyle: React.CSSProperties = {
    fontSize: `${settings.fontSize}px`,
    fontFamily: FONT_FAMILIES[settings.fontFamily],
    lineHeight: settings.lineHeight,
    wordSpacing: `${settings.wordSpacing}px`,
  };

  const getViewModeClasses = () => {
    switch (settings.viewMode) {
      case 'focused':
        return 'max-w-xl mx-auto';
      case 'wide':
        return 'max-w-none';
      case 'split':
        return 'columns-2 gap-8';
      default:
        return 'max-w-3xl mx-auto';
    }
  };

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    if (onContentChange) {
      onContentChange(e.currentTarget.innerHTML);
    }
  };

  return (
    <div
      className={`prose prose-lg ${getViewModeClasses()} ${className}`}
      style={contentStyle}
      contentEditable={contentEditable}
      suppressContentEditableWarning={true}
      onInput={handleInput}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
};

// Split View Component - for side-by-side comparison
interface SplitViewProps {
  leftContent: string;
  rightContent: string;
  leftTitle?: string;
  rightTitle?: string;
  settings: ViewSettings;
}

export const SplitView: React.FC<SplitViewProps> = ({
  leftContent,
  rightContent,
  leftTitle,
  rightTitle,
  settings,
}) => {
  const contentStyle: React.CSSProperties = {
    fontSize: `${settings.fontSize}px`,
    fontFamily: FONT_FAMILIES[settings.fontFamily],
    lineHeight: settings.lineHeight,
    wordSpacing: `${settings.wordSpacing}px`,
  };

  return (
    <div className="grid grid-cols-2 gap-4 h-full">
      {/* Left Panel */}
      <div className="border-2 border-gold-400 rounded-2xl overflow-hidden flex flex-col bg-white">
        {leftTitle && (
          <div className="bg-gold-100 border-b-2 border-gold-300 px-4 py-2">
            <h3 className="font-bold text-navy-900 text-sm">{leftTitle}</h3>
          </div>
        )}
        <div className="flex-1 overflow-y-auto p-6">
          <div
            className="prose prose-lg"
            style={contentStyle}
            dangerouslySetInnerHTML={{ __html: leftContent }}
          />
        </div>
      </div>

      {/* Divider */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-px h-full bg-gold-300" />

      {/* Right Panel */}
      <div className="border-2 border-gold-400 rounded-2xl overflow-hidden flex flex-col bg-white">
        {rightTitle && (
          <div className="bg-gold-100 border-b-2 border-gold-300 px-4 py-2">
            <h3 className="font-bold text-navy-900 text-sm">{rightTitle}</h3>
          </div>
        )}
        <div className="flex-1 overflow-y-auto p-6">
          <div
            className="prose prose-lg"
            style={contentStyle}
            dangerouslySetInnerHTML={{ __html: rightContent }}
          />
        </div>
      </div>
    </div>
  );
};

export default ContentViewer;
