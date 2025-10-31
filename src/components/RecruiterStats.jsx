// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
// @ts-ignore;
import { Users, FileText, TrendingUp, Shield } from 'lucide-react';

export function RecruiterStats({
  totalCandidates,
  activeJobs,
  biasAlerts,
  algorithmVersion,
  benchmarkDelta
}) {
  const stats = [{
    title: '总候选人',
    value: totalCandidates,
    icon: Users,
    color: 'text-blue-500'
  }, {
    title: '活跃职位',
    value: activeJobs,
    icon: FileText,
    color: 'text-green-500'
  }, {
    title: '偏见警告',
    value: biasAlerts,
    icon: Shield,
    color: 'text-red-500'
  }, {
    title: '算法版本',
    value: algorithmVersion,
    icon: TrendingUp,
    color: 'text-purple-500'
  }];
  return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map(stat => <Card key={stat.title}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {stat.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <stat.icon className={`h-8 w-8 ${stat.color}`} />
              <span className="text-2xl font-bold">{stat.value}</span>
            </div>
          </CardContent>
        </Card>)}
    </div>;
}