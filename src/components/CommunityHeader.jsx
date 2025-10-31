// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Bell, Search } from 'lucide-react';
// @ts-ignore;
import { Button, Input } from '@/components/ui';

export function CommunityHeader() {
  return <div className="sticky top-0 z-40 bg-white border-b">
      <div className="flex items-center justify-between px-4 py-3">
        <h1 className="text-xl font-bold text-gray-900">候选人社区</h1>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input placeholder="搜索动态..." className="pl-10 w-32 md:w-48" />
          </div>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </Button>
        </div>
      </div>
    </div>;
}