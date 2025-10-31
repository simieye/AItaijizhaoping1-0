// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui';
// @ts-ignore;
import { Eye, EyeOff, ZoomIn, ZoomOut, Palette } from 'lucide-react';

export function AccessibilityMenu({
  className = ''
}) {
  const [highContrast, setHighContrast] = useState(false);
  const [fontSize, setFontSize] = useState(100);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    // 从本地存储获取无障碍设置
    const savedHighContrast = localStorage.getItem('highContrast') === 'true';
    const savedFontSize = parseInt(localStorage.getItem('fontSize') || '100');
    setHighContrast(savedHighContrast);
    setFontSize(savedFontSize);
    setLoading(false);

    // 应用设置
    if (savedHighContrast) {
      document.documentElement.classList.add('high-contrast');
    }
    document.documentElement.style.fontSize = `${savedFontSize}%`;
  }, []);
  const toggleHighContrast = () => {
    const newValue = !highContrast;
    setHighContrast(newValue);
    localStorage.setItem('highContrast', newValue.toString());
    if (newValue) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  };
  const changeFontSize = delta => {
    const newSize = Math.max(75, Math.min(200, fontSize + delta));
    setFontSize(newSize);
    localStorage.setItem('fontSize', newSize.toString());
    document.documentElement.style.fontSize = `${newSize}%`;
  };
  if (loading) {
    return <Button variant="ghost" size="icon" className={`${className} animate-pulse`} disabled>
        <div className="w-5 h-5 bg-gray-300 rounded"></div>
      </Button>;
  }
  return <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className={className} aria-label="无障碍设置">
          <Palette className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={toggleHighContrast}>
          {highContrast ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
          高对比度模式
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => changeFontSize(25)}>
          <ZoomIn className="mr-2 h-4 w-4" />
          放大字体
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => changeFontSize(-25)}>
          <ZoomOut className="mr-2 h-4 w-4" />
          缩小字体
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>;
}