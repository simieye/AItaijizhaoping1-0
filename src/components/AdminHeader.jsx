// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Input, Button, Badge, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, Avatar, AvatarFallback, AvatarImage, useToast } from '@/components/ui';
// @ts-ignore;
import { Search, Bell, Settings, User, LogOut, Moon, Sun, Globe, RefreshCw, AlertTriangle } from 'lucide-react';

// @ts-ignore;
import { ThemeToggle } from '@/components/ThemeToggle';
// @ts-ignore;
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
export function AdminHeader({
  onSearch,
  onNotificationClick,
  onSettingsClick,
  className = ''
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const {
    toast
  } = useToast();

  // 模拟通知数据
  useEffect(() => {
    setNotifications([{
      id: 1,
      title: '合规警报',
      message: '检测到3个职位存在偏见风险',
      type: 'warning',
      time: '5分钟前'
    }, {
      id: 2,
      title: '系统更新',
      message: 'AI算法已更新至v2.1.0',
      type: 'info',
      time: '1小时前'
    }, {
      id: 3,
      title: '新用户注册',
      message: '新增50位候选人注册',
      type: 'success',
      time: '2小时前'
    }]);
  }, []);
  const handleSearch = e => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch?.(searchQuery.trim());
    }
  };
  const handleQuickAction = action => {
    toast({
      title: '操作已执行',
      description: `${action} 操作已完成`
    });
  };
  return <header className={`${className} bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-3`}>
      <div className="flex items-center justify-between">
        {/* 搜索栏 */}
        <div className="flex-1 max-w-md">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input type="search" placeholder="搜索用户、职位、候选人..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10 pr-4" />
          </form>
        </div>

        {/* 右侧工具栏 */}
        <div className="flex items-center space-x-4">
          {/* 快速操作 */}
          <Button variant="ghost" size="sm" onClick={() => handleQuickAction('刷新数据')} className="hidden md:flex">
            <RefreshCw className="h-4 w-4 mr-1" />
            刷新
          </Button>

          {/* 主题切换 */}
          <ThemeToggle />

          {/* 语言切换 */}
          <LanguageSwitcher />

          {/* 通知中心 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-4 w-4" />
                {notifications.length > 0 && <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs">
                    {notifications.length}
                  </Badge>}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="p-4">
                <h3 className="font-semibold mb-2">通知中心</h3>
                {notifications.map(notification => <DropdownMenuItem key={notification.id} className="flex items-start space-x-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => onNotificationClick?.(notification)}>
                    <div className={`p-2 rounded-full ${notification.type === 'warning' ? 'bg-yellow-100 text-yellow-600' : notification.type === 'error' ? 'bg-red-100 text-red-600' : notification.type === 'success' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                      <AlertTriangle className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{notification.title}</p>
                      <p className="text-xs text-gray-600">{notification.message}</p>
                      <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
                    </div>
                  </DropdownMenuItem>)}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* 用户菜单 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/admin-avatar.jpg" alt="管理员" />
                  <AvatarFallback>AD</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onSettingsClick?.('profile')}>
                <User className="mr-2 h-4 w-4" />
                个人资料
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSettingsClick?.('settings')}>
                <Settings className="mr-2 h-4 w-4" />
                系统设置
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSettingsClick?.('logout')}>
                <LogOut className="mr-2 h-4 w-4" />
                退出登录
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>;
}