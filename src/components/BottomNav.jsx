// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Home, Users, MessageSquare, User } from 'lucide-react';
// @ts-ignore;
import { Button } from '@/components/ui';
// @ts-ignore;
import { cn } from '@/lib/utils';

const navItems = [{
  id: 'home',
  label: '社区',
  icon: Home
}, {
  id: 'candidates',
  label: '候选人',
  icon: Users
}, {
  id: 'messages',
  label: '消息',
  icon: MessageSquare
}, {
  id: 'profile',
  label: '我的',
  icon: User
}];
export function BottomNav({
  activeTab,
  onTabChange
}) {
  return <div className="fixed bottom-0 left-0 right-0 bg-white border-t">
      <div className="flex justify-around py-2">
        {navItems.map(item => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return <Button key={item.id} variant="ghost" className="flex flex-col items-center justify-center h-14 w-16" onClick={() => onTabChange(item.id)}>
              <Icon className={cn("w-5 h-5 mb-1", isActive ? "text-blue-500" : "text-gray-400")} />
              <span className={cn("text-xs", isActive ? "text-blue-500 font-medium" : "text-gray-400")}>
                {item.label}
              </span>
            </Button>;
      })}
      </div>
    </div>;
}