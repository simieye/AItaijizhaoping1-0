// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui';
// @ts-ignore;
import { Globe } from 'lucide-react';

const languages = [{
  value: 'zh',
  label: '中文'
}, {
  value: 'en',
  label: 'English'
}, {
  value: 'ja',
  label: '日本語'
}, {
  value: 'ko',
  label: '한국어'
}];
export function LanguageSwitcher({
  currentLang,
  onLanguageChange
}) {
  return <Select value={currentLang} onValueChange={onLanguageChange}>
      <SelectTrigger className="w-[120px]">
        <Globe className="h-4 w-4 mr-2" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {languages.map(lang => <SelectItem key={lang.value} value={lang.value}>
            {lang.label}
          </SelectItem>)}
      </SelectContent>
    </Select>;
}