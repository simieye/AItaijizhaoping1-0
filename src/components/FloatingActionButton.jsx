// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Plus } from 'lucide-react';
// @ts-ignore;
import { Button } from '@/components/ui';

export function FloatingActionButton({
  onClick
}) {
  return <Button className="fixed bottom-20 right-4 w-14 h-14 rounded-full shadow-lg bg-blue-500 hover:bg-blue-600" onClick={onClick}>
      <Plus className="w-6 h-6" />
    </Button>;
}