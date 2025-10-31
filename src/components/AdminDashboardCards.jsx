// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
// @ts-ignore;
import { Users, Briefcase, MessageSquare, Shield, TrendingUp, Clock } from 'lucide-react';

export function AdminDashboardCards({
  data = {},
  loading = false
}) {
  const cards = [{
    title: '总用户数',
    value: data.totalUsers || 0,
    change: '+12%',
    icon: Users,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50'
  }, {
    title: '活跃职位',
    value: data.activeJobs || 0,
    change: '+8%',
    icon: Briefcase,
    color: 'text-green-500',
    bgColor: 'bg-green-50'
  }, {
    title: '今日消息',
    value: data.todayMessages || 0,
    change: '+23%',
    icon: MessageSquare,
    color: 'text-purple-500',
    bgColor: 'bg-purple-50'
  }, {
    title: '合规评分',
    value: `${data.complianceScore || 0}%`,
    change: '+5%',
    icon: Shield,
    color: 'text-orange-500',
    bgColor: 'bg-orange-50'
  }];
  if (loading) {
    return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-full"></div>
            </CardContent>
          </Card>)}
      </div>;
  }
  return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map(card => <Card key={card.title} className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <div className={`p-2 rounded-full ${card.bgColor}`}>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <p className="text-xs text-green-600">{card.change} 较昨日</p>
          </CardContent>
        </Card>)}
    </div>;
}