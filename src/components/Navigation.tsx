import React from 'react';
import { CheckSquare, Calendar, BarChart, Settings } from 'lucide-react';

interface NavigationProps {
  currentTool: string;
  onToolChange: (tool: string) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentTool, onToolChange }) => {
  const tools = [
    { id: 'todo', label: 'TODO', icon: CheckSquare },
    { id: 'calendar', label: 'カレンダー', icon: Calendar },
    { id: 'analytics', label: '統計', icon: BarChart },
    { id: 'settings', label: '設定', icon: Settings },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-blue-100/80 backdrop-blur-sm border-b border-blue-200">
      <div className="max-w-4xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            {tools.map((tool) => {
              const IconComponent = tool.icon;
              return (
                <button
                  key={tool.id}
                  onClick={() => onToolChange(tool.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors text-sm font-medium ${
                    currentTool === tool.id
                      ? 'bg-blue-500 text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-blue-200/50'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  <span>{tool.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}; 