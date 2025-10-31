// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui';
// @ts-ignore;
import { Eye, ZoomIn, ZoomOut } from 'lucide-react';

export function AccessibilityMenu({
  fontSize,
  onFontSizeChange,
  colorBlindMode,
  onColorBlindToggle
}) {
  return <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Eye className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onFontSizeChange(Math.max(12, fontSize - 2))}>
          <ZoomOut className="h-4 w-4 mr-2" />
          缩小字体
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onFontSizeChange(Math.min(24, fontSize + 2))}>
          <ZoomIn className="h-4 w-4 mr-2" />
          放大字体
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onColorBlindToggle}>
          {colorBlindMode ? '关闭色弱模式' : '开启色弱模式'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>;
}