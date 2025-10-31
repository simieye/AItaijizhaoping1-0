// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';

// @ts-ignore;
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
export function AdminCharts({
  data,
  loading
}) {
  const userGrowthData = [{
    month: '1月',
    users: 400,
    candidates: 240,
    recruiters: 160
  }, {
    month: '2月',
    users: 600,
    candidates: 360,
    recruiters: 240
  }, {
    month: '3月',
    users: 800,
    candidates: 480,
    recruiters: 320
  }, {
    month: '4月',
    users: 1000,
    candidates: 600,
    recruiters: 400
  }, {
    month: '5月',
    users: 1200,
    candidates: 720,
    recruiters: 480
  }, {
    month: '6月',
    users: 1247,
    candidates: 687,
    recruiters: 234
  }];
  const jobStatusData = [{
    name: '招聘中',
    value: 45,
    color: '#10b981'
  }, {
    name: '已暂停',
    value: 20,
    color: '#f59e0b'
  }, {
    name: '已关闭',
    value: 35,
    color: '#6b7280'
  }];
  const applicationStatusData = [{
    status: '待处理',
    count: 234
  }, {
    status: '筛选中',
    count: 156
  }, {
    status: '面试中',
    count: 89
  }, {
    status: '已录用',
    count: 45
  }, {
    status: '已拒绝',
    count: 67
  }];
  if (loading) {
    return <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map(i => <Card key={i} className="animate-pulse">
            <CardContent className="h-80 flex items-center justify-center">
              <div className="text-gray-500">加载图表中...</div>
            </CardContent>
          </Card>)}
      </div>;
  }
  return <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 用户增长趋势 */}
      <Card>
        <CardHeader>
          <CardTitle>用户增长趋势</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={userGrowthData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="users" stroke="#3b82f6" name="总用户" />
              <Line type="monotone" dataKey="candidates" stroke="#10b981" name="候选人" />
              <Line type="monotone" dataKey="recruiters" stroke="#f59e0b" name="招聘者" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* 职位状态分布 */}
      <Card>
        <CardHeader>
          <CardTitle>职位状态分布</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={jobStatusData} cx="50%" cy="50%" labelLine={false} label={({
              name,
              percent
            }) => `${name} ${(percent * 100).toFixed(0)}%`} outerRadius={80} fill="#8884d8" dataKey="value">
                {jobStatusData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* 申请状态统计 */}
      <Card>
        <CardHeader>
          <CardTitle>申请状态统计</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={applicationStatusData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="status" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* 合规评分趋势 */}
      <Card>
        <CardHeader>
          <CardTitle>合规评分趋势</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={[{
            month: '1月',
            score: 89
          }, {
            month: '2月',
            score: 91
          }, {
            month: '3月',
            score: 92
          }, {
            month: '4月',
            score: 94
          }, {
            month: '5月',
            score: 94
          }, {
            month: '6月',
            score: 94
          }]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis domain={[80, 100]} />
              <Tooltip />
              <Line type="monotone" dataKey="score" stroke="#10b981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>;
}