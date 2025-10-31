// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Button, ScrollArea, Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui';
// @ts-ignore;
import { LayoutDashboard, Users, Briefcase, FileText, MessageSquare, Shield, BarChart3, Settings, LogOut, ChevronDown, ChevronRight, Search, Bell, Moon, Sun, Globe } from 'lucide-react';

const menuItems = [{
  title: '仪表盘',
  icon: LayoutDashboard,
  href: 'admin-dashboard',
  active: true
}, {
  title: '用户管理',
  icon: Users,
  subItems: [{
    title: '所有用户',
    href: 'admin-users'
  }, {
    title: '候选人',
    href: 'admin-candidates'
  }, {
    title: '招聘者',
    href: 'admin-recruiters'
  }]
}, {
  title: '职位管理',
  icon: Briefcase,
  subItems: [{
    title: '所有职位',
    href: 'admin-jobs'
  }, {
    title: '发布管理',
    href: 'admin-job-posts'
  }, {
    title: '申请管理',
    href: 'admin-applications'
  }]
}, {
  title: '沟通管理',
  icon: MessageSquare,
  subItems: [{
    title: '聊天记录',
    href: 'admin-chats'
  }, {
    title: 'AI对话',
    href: 'admin-ai-chats'
  }]
}, {
  title: '合规审计',
  icon: Shield,
  subItems: [{
    title: '合规报告',
    href: 'admin-compliance'
  }, {
    title: 'DEI指标',
    href: 'admin-dei'
  }, {
    title: 'AI解释',
    href: 'admin-ai-explanations'
  }, {
    title: '同意日志',
    href: 'admin-consent-logs'
  }]
}, {
  title: '数据分析',
  icon: BarChart3,
  subItems: [{
    title: '实时报表',
    href: 'admin-analytics'
  }, {
    title: '趋势分析',
    href: 'admin-trends'
  }]
}, {
  title: '系统设置',
  icon: Settings,
  href: 'admin-settings'
}];
export function AdminSidebar({
  isCollapsed = false,
  onToggle,
  onNavigate,
  className = ''
}) {
  const [openSections, setOpenSections] = useState({});
  const toggleSection = title => {
    setOpenSections(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };
  const handleNavigation = pageId => {
    onNavigate?.(pageId);
  };
  return <div className={`${className} bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'}`}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-6">
          {!isCollapsed && <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              管理后台
            </h2>}
          <Button variant="ghost" size="sm" onClick={onToggle} className="p-2">
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>

        <ScrollArea className="h-[calc(100vh-120px)]">
          <nav className="space-y-2">
            {menuItems.map(item => <div key={item.title}>
                {item.subItems ? <Collapsible open={openSections[item.title]} onOpenChange={() => toggleSection(item.title)}>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" className={`w-full justify-start ${isCollapsed ? 'px-2' : 'px-3'}`}>
                        <item.icon className={`h-4 w-4 ${!isCollapsed && 'mr-2'}`} />
                        {!isCollapsed && <span className="flex-1 text-left">{item.title}</span>}
                        {!isCollapsed && <ChevronDown className={`h-4 w-4 transition-transform ${openSections[item.title] ? 'rotate-180' : ''}`} />}
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="ml-6 space-y-1">
                        {item.subItems.map(subItem => <Button key={subItem.title} variant="ghost" size="sm" className={`w-full justify-start ${isCollapsed ? 'px-2' : 'px-3'}`} onClick={() => handleNavigation(subItem.href)}>
                            {!isCollapsed && <span className="text-sm">{subItem.title}</span>}
                          </Button>)}
                      </div>
                    </CollapsibleContent>
                  </Collapsible> : <Button variant={item.active ? 'secondary' : 'ghost'} className={`w-full justify-start ${isCollapsed ? 'px-2' : 'px-3'}`} onClick={() => handleNavigation(item.href)}>
                    <item.icon className={`h-4 w-4 ${!isCollapsed && 'mr-2'}`} />
                    {!isCollapsed && <span>{item.title}</span>}
                  </Button>}
              </div>)}
          </nav>
        </ScrollArea>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-800">
          <Button variant="ghost" className={`w-full justify-start ${isCollapsed ? 'px-2' : 'px-3'}`} onClick={() => handleNavigation('logout')}>
            <LogOut className={`h-4 w-4 ${!isCollapsed && 'mr-2'}`} />
            {!isCollapsed && <span>退出登录</span>}
          </Button>
        </div>
      </div>
    </div>;
}