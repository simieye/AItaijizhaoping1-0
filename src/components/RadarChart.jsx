// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
// @ts-ignore;
import { Loader2 } from 'lucide-react';

import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip } from 'recharts';
export function RadarChartComponent({
  data = [],
  title = '能力雷达图',
  className = '',
  height = 300,
  colors = ['#3b82f6', '#10b981']
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    // 模拟数据加载
    if (data.length === 0) {
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    } else {
      setLoading(false);
    }
  }, [data]);

  // 默认数据
  const defaultData = [{
    subject: '技术能力',
    A: 85,
    fullMark: 100
  }, {
    subject: '沟通能力',
    A: 78,
    fullMark: 100
  }, {
    subject: '团队协作',
    A: 92,
    fullMark: 100
  }, {
    subject: '学习能力',
    A: 88,
    fullMark: 100
  }, {
    subject: '领导力',
    A: 75,
    fullMark: 100
  }, {
    subject: '创新思维',
    A: 80,
    fullMark: 100
  }];
  const chartData = data.length > 0 ? data : defaultData;
  if (loading) {
    return <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            加载中...
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
          <div className="text-gray-500">正在加载图表数据...</div>
        </CardContent>
      </Card>;
  }
  if (error) {
    return <Card className={className}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
          <div className="text-red-500">加载失败：{error}</div>
        </CardContent>
      </Card>;
  }
  if (chartData.length === 0) {
    return <Card className={className}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
          <div className="text-gray-500">暂无数据</div>
        </CardContent>
      </Card>;
  }
  return <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <RadarChart data={chartData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="subject" className="text-sm" />
            <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{
            fontSize: 12
          }} />
            <Radar name="能力值" dataKey="A" stroke={colors[0]} fill={colors[0]} fillOpacity={0.6} />
            <Tooltip contentStyle={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid #e5e7eb',
            borderRadius: '0.5rem'
          }} />
          </RadarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>;
}