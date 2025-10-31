// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
// @ts-ignore;
import { TrendingUp, Users, FileText, Clock, AlertTriangle } from 'lucide-react';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
export function RecruiterStats({
  recruiterId = null,
  timeRange = '7d',
  className = '',
  showCharts = true,
  compact = false
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);

  // 模拟数据加载
  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);

        // 模拟API延迟
        await new Promise(resolve => setTimeout(resolve, 800));

        // 模拟统计数据
        const mockStats = {
          totalJobs: 24,
          activeJobs: 12,
          totalCandidates: 156,
          newCandidates: 23,
          interviewsScheduled: 8,
          interviewsCompleted: 5,
          avgTimeToHire: 14,
          biasAlerts: 3,
          diversityScore: 87,
          complianceScore: 94
        };

        // 模拟图表数据
        const mockChartData = [{
          name: '周一',
          candidates: 12,
          interviews: 3
        }, {
          name: '周二',
          candidates: 19,
          interviews: 5
        }, {
          name: '周三',
          candidates: 15,
          interviews: 4
        }, {
          name: '周四',
          candidates: 25,
          interviews: 6
        }, {
          name: '周五',
          candidates: 22,
          interviews: 4
        }, {
          name: '周六',
          candidates: 8,
          interviews: 1
        }, {
          name: '周日',
          candidates: 5,
          interviews: 0
        }];
        setStats(mockStats);
        setChartData(mockChartData);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    loadStats();
  }, [recruiterId, timeRange]);
  if (loading) {
    return <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center justify-center">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"></div>
            <span className="ml-2">加载统计中...</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-gray-500">正在获取统计数据...</div>
        </CardContent>
      </Card>;
  }
  if (error) {
    return <Card className={className}>
        <CardHeader>
          <CardTitle>统计信息</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-red-500 text-center">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
            <p>加载失败：{error}</p>
          </div>
        </CardContent>
      </Card>;
  }
  if (!stats) {
    return <Card className={className}>
        <CardContent className="flex items-center justify-center h-32">
          <div className="text-gray-500">暂无数据</div>
        </CardContent>
      </Card>;
  }
  if (compact) {
    return <div className={`grid grid-cols-2 gap-4 ${className}`}>
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <Users className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold">{stats.totalCandidates}</span>
          </div>
          <p className="text-sm text-gray-600 mt-1">总候选人</p>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <FileText className="h-8 w-8 text-green-600" />
            <span className="text-2xl font-bold">{stats.activeJobs}</span>
          </div>
          <p className="text-sm text-gray-600 mt-1">活跃职位</p>
        </div>
      </div>;
  }
  return <div className={className}>
      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">总候选人</p>
                <p className="text-2xl font-bold">{stats.totalCandidates}</p>
                <p className="text-xs text-green-600">+{stats.newCandidates} 新增</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">活跃职位</p>
                <p className="text-2xl font-bold">{stats.activeJobs}</p>
                <p className="text-xs text-gray-600">共{stats.totalJobs}个职位</p>
              </div>
              <FileText className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">平均招聘周期</p>
                <p className="text-2xl font-bold">{stats.avgTimeToHire}</p>
                <p className="text-xs text-gray-600">天</p>
              </div>
              <Clock className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">合规评分</p>
                <p className="text-2xl font-bold">{stats.complianceScore}</p>
                <p className="text-xs text-gray-600">/100</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 图表区域 */}
      {showCharts && <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">候选人趋势</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="candidates" stroke="#3b82f6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">面试安排</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="interviews" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>}

      {/* 警告信息 */}
      {stats.biasAlerts > 0 && <Card className="mt-6 border-l-4 border-yellow-400">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              <span className="text-sm text-yellow-700">
                检测到 {stats.biasAlerts} 个潜在偏见警报，请及时处理
              </span>
            </div>
          </CardContent>
        </Card>}
    </div>;
}