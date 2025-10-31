// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui';
// @ts-ignore;
import { Globe } from 'lucide-react';

const languages = [{
  code: 'zh-CN',
  name: '简体中文',
  flag: ''
}, {
  code: 'en-US',
  name: 'English',
  flag: '🇺🇸'
}, {
  code: 'ja-JP',
  name: '日本語',
  flag: ''
}, {
  code: 'ko-KR',
  name: '한국어',
  flag: ''
}];
export function LanguageSwitcher({
  className = '',
  onLanguageChange
}) {
  const [currentLanguage, setCurrentLanguage] = useState('zh-CN');
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    // 从本地存储获取语言设置
    const savedLanguage = localStorage.getItem('language') || 'zh-CN';
    setCurrentLanguage(savedLanguage);
    setLoading(false);
    onLanguageChange?.(savedLanguage);
  }, []);
  const handleLanguageChange = value => {
    setCurrentLanguage(value);
    localStorage.setItem('language', value);
    onLanguageChange?.(value);
  };
  if (loading) {
    return <div className={`${className} flex items-center space-x-2 animate-pulse`}>
        <Globe className="h-4 w-4 text-gray-400" />
        <div className="h-8 w-24 bg-gray-200 rounded"></div>
      </div>;
  }
  return <div className={`${className} flex items-center space-x-2`}>
      <Globe className="h-4 w-4 text-gray-500" />
      <Select value={currentLanguage} onValueChange={handleLanguageChange}>
        <SelectTrigger className="w-[120px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {languages.map(lang => <SelectItem key={lang.code} value={lang.code}>
              <span className="flex items-center">
                <span className="mr-2">{lang.flag}</span>
                {lang.name}
              </span>
            </SelectItem>)}
        </SelectContent>
      </Select>
    </div>;
}