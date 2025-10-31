// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
// @ts-ignore;
import { Loader2, Users, Heart, Globe, Scale, Brain } from 'lucide-react';

import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip } from 'recharts';
export function DEIRadarChart({
  data = [],
  title = 'DEI 多样性指标',
  className = '',
  height = 350
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    // 模拟数据加载
    setTimeout(() => {
      setLoading(false);
    }, 800);
  }, []);

  // 默认DEI数据
  const defaultData = [{
    subject: '性别多样性',
    value: 85,
    fullMark: 100,
    icon: Users
  }, {
    subject: '种族多样性',
    value: 78,
    fullMark: 100,
    icon: Globe
  }, {
    subject: '年龄包容性',
    value: 92,
    fullMark: 100,
    icon: Heart
  }, {
    subject: '教育背景',
    value: 88,
    fullMark: 100,
    icon: Brain
  }, {
    subject: '经验多样性',
    value: 75,
    fullMark: 100,
    icon: Scale
  }, {
    subject: '地域分布',
    value: 80,
    fullMark: 100,
    icon: Globe
  }];
  const chartData = data.length > 0 ? data : defaultData;
  const getDEIScore = () => {
    const avgScore = chartData.reduce((sum, item) => sum + item.value, 0) / chartData.length;
    return Math.round(avgScore);
  };
  const getDEILevel = score => {
    if (score >= 90) return {
      level: '优秀',
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    };
    if (score >= 80) return {
      level: '良好',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    };
    if (score >= 70) return {
      level: '一般',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    };
    return {
      level: '需改进',
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    };
  };
  const deiLevel = getDEILevel(getDEIScore());
  if (loading) {
    return <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            加载中...
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[350px]">
          <div className="text-gray-500">正在加载DEI数据...</div>
        </CardContent>
      </Card>;
  }
  if (error) {
    return <Card className={className}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[350px]">
          <div className="text-red-500">加载失败：{error}</div>
        </CardContent>
      </Card>;
  }
  return <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            {title}
          </CardTitle>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${deiLevel.bgColor} ${deiLevel.color}`}>
            {deiLevel.level} ({getDEIScore()}分)
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <RadarChart data={chartData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="subject" className="text-sm" tick={{
            fontSize: 12
          }} />
            <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{
            fontSize: 10
          }} />
            <Radar name="DEI得分" dataKey="value" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
            <Tooltip contentStyle={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid #e5e7eb',
            borderRadius: '0.5rem'
          }} formatter={(value, name) => [`${value}%`, name]} />
          </RadarChart>
        </ResponsiveContainer>
        
        <div className="mt-4 grid grid-cols-2 gap-4">
          {chartData.map((item, index) => <div key={index} className="flex items-center space-x-2">
              <item.icon className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm font-medium">{item.subject}</p>
                <p className="text-xs text-gray-500">{item.value}%</p>
              </div>
            </div>)}
        </div>
      </CardContent>
    </Card>;
}