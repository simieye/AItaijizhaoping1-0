// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Button } from '@/components/ui';
// @ts-ignore;
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle({
  className = '',
  onThemeChange
}) {
  const [theme, setTheme] = useState('light');
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    // 从本地存储获取主题
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    setLoading(false);

    // 应用主题
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    onThemeChange?.(savedTheme);
  }, []);
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    onThemeChange?.(newTheme);
  };
  if (loading) {
    return <Button variant="ghost" size="icon" className={`${className} animate-pulse`} disabled>
        <div className="w-5 h-5 bg-gray-300 rounded-full"></div>
      </Button>;
  }
  return <Button variant="ghost" size="icon" onClick={toggleTheme} className={className} aria-label={`切换到${theme === 'light' ? '暗色' : '亮色'}主题`}>
      {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
    </Button>;
}