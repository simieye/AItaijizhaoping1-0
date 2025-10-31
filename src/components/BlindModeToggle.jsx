// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Switch } from '@/components/ui';
// @ts-ignore;
import { Eye, EyeOff } from 'lucide-react';

export function BlindModeToggle({
  enabled,
  onToggle
}) {
  return <div className="flex items-center space-x-2">
      <EyeOff className="h-4 w-4 text-gray-500" />
      <Switch checked={enabled} onCheckedChange={onToggle} />
      <Eye className="h-4 w-4 text-gray-500" />
      <span className="text-sm font-medium">盲选模式</span>
    </div>;
}