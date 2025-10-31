// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Button } from '@/components/ui';
// @ts-ignore;
import { Moon, Sun } from 'lucide-react';

export function ThemeToggle({
  isDark,
  onToggle
}) {
  return <Button variant="ghost" size="icon" onClick={onToggle} className="rounded-full">
      {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </Button>;
}