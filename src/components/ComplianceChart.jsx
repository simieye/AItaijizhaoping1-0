// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
// @ts-ignore;
import { Shield, CheckCircle, AlertTriangle, XCircle, Badge } from 'lucide-react';

import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line } from 'recharts';
export function ComplianceChart({
  data = {},
  type = 'overview',
  className = '',
  height = 300,
  showDetails = true
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartData, setChartData] = useState({});
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // 模拟数据加载
        await new Promise(resolve => setTimeout(resolve, 600));

        // 根据类型生成不同的图表数据
        const mockData = generateMockData(type);
        setChartData(mockData);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    loadData();
  }, [type, data]);
  const generateMockData = chartType => {
    switch (chartType) {
      case 'bias':
        return {
          pie: [{
            name: '无偏见',
            value: 75,
            color: '#10b981'
          }, {
            name: '轻微偏见',
            value: 15,
            color: '#f59e0b'
          }, {
            name: '明显偏见',
            value: 8,
            color: '#ef4444'
          }, {
            name: '严重偏见',
            value: 2,
            color: '#991b1b'
          }],
          trend: [{
            month: '1月',
            score: 85
          }, {
            month: '2月',
            score: 87
          }, {
            month: '3月',
            score: 90
          }, {
            month: '4月',
            score: 88
          }, {
            month: '5月',
            score: 92
          }, {
            month: '6月',
            score: 94
          }]
        };
      case 'privacy':
        return {
          categories: [{
            name: '数据收集',
            score: 95
          }, {
            name: '数据存储',
            score: 88
          }, {
            name: '数据使用',
            score: 92
          }, {
            name: '数据共享',
            score: 85
          }, {
            name: '用户权利',
            score: 90
          }],
          violations: [{
            type: '未授权收集',
            count: 2
          }, {
            type: '超范围使用',
            count: 1
          }, {
            type: '存储超时',
            count: 0
          }, {
            type: '共享未同意',
            count: 1
          }]
        };
      case 'algorithm':
        return {
          transparency: [{
            name: '决策可解释',
            score: 78
          }, {
            name: '偏见检测',
            score: 85
          }, {
            name: '公平性评估',
            score: 82
          }, {
            name: '用户反馈',
            score: 75
          }],
          accuracy: [{
            date: '2024-01',
            accuracy: 92
          }, {
            date: '2024-02',
            accuracy: 94
          }, {
            date: '2024-03',
            accuracy: 91
          }, {
            date: '2024-04',
            accuracy: 93
          }, {
            date: '2024-05',
            accuracy: 95
          }, {
            date: '2024-06',
            accuracy: 96
          }]
        };
      default:
        return {
          overview: [{
            name: '偏见检测',
            score: 88,
            status: 'good'
          }, {
            name: '隐私合规',
            score: 92,
            status: 'excellent'
          }, {
            name: '算法透明',
            score: 85,
            status: 'good'
          }, {
            name: '公平性',
            score: 90,
            status: 'excellent'
          }, {
            name: '用户权利',
            score: 87,
            status: 'good'
          }]
        };
    }
  };
  const getStatusIcon = status => {
    switch (status) {
      case 'excellent':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'good':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Shield className="h-4 w-4 text-gray-500" />;
    }
  };
  const getStatusColor = score => {
    if (score >= 90) return '#10b981';
    if (score >= 80) return '#3b82f6';
    if (score >= 70) return '#f59e0b';
    return '#ef4444';
  };
  if (loading) {
    return <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center justify-center">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"></div>
            <span className="ml-2">加载合规数据中...</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-gray-500">正在获取合规数据...</div>
        </CardContent>
      </Card>;
  }
  if (error) {
    return <Card className={className}>
        <CardHeader>
          <CardTitle>合规分析</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-red-500 text-center">
            <XCircle className="h-8 w-8 mx-auto mb-2" />
            <p>加载失败：{error}</p>
          </div>
        </CardContent>
      </Card>;
  }
  const renderChart = () => {
    switch (type) {
      case 'bias':
        return <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium mb-4">偏见分布</h4>
              <ResponsiveContainer width="100%" height={height}>
                <PieChart>
                  <Pie data={chartData.pie} cx="50%" cy="50%" labelLine={false} label={({
                  name,
                  percent
                }) => `${name} ${(percent * 100).toFixed(0)}%`} outerRadius={80} fill="#8884d8" dataKey="value">
                    {chartData.pie?.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-4">偏见检测趋势</h4>
              <ResponsiveContainer width="100%" height={height}>
                <LineChart data={chartData.trend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="score" stroke="#10b981" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>;
      case 'privacy':
        return <div className="space-y-6">
            <div>
              <h4 className="text-sm font-medium mb-4">隐私合规评分</h4>
              <ResponsiveContainer width="100%" height={height}>
                <BarChart data={chartData.categories}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="score" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            {showDetails && chartData.violations && <div>
                <h4 className="text-sm font-medium mb-4">违规统计</h4>
                <div className="space-y-2">
                  {chartData.violations.map((violation, index) => <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <span className="text-sm">{violation.type}</span>
                      <Badge variant={violation.count > 0 ? "destructive" : "default"}>
                        {violation.count} 次
                      </Badge>
                    </div>)}
                </div>
              </div>}
          </div>;
      case 'algorithm':
        return <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium mb-4">算法透明度</h4>
              <ResponsiveContainer width="100%" height={height}>
                <BarChart data={chartData.transparency}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="score" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-4">算法准确率趋势</h4>
              <ResponsiveContainer width="100%" height={height}>
                <LineChart data={chartData.accuracy}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="accuracy" stroke="#f59e0b" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>;
      default:
        return <div>
            <h4 className="text-sm font-medium mb-4">合规总览</h4>
            <div className="space-y-3">
              {chartData.overview?.map((item, index) => <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(item.status)}
                    <span className="font-medium">{item.name}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div className="h-2 rounded-full" style={{
                    width: `${item.score}%`,
                    backgroundColor: getStatusColor(item.score)
                  }}></div>
                    </div>
                    <span className="text-sm font-medium">{item.score}%</span>
                  </div>
                </div>)}
            </div>
          </div>;
    }
  };
  return <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Shield className="h-5 w-5 mr-2" />
          合规分析 - {type === 'bias' ? '偏见检测' : type === 'privacy' ? '隐私合规' : type === 'algorithm' ? '算法透明' : '总览'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {renderChart()}
      </CardContent>
    </Card>;
}