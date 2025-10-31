// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, Badge, Alert, AlertDescription, AlertTitle, useToast, Button } from '@/components/ui';
// @ts-ignore;
import { Activity, Users, FileText, MessageSquare, TrendingUp, AlertTriangle, Clock, RefreshCw, AlertCircle } from 'lucide-react';

// @ts-ignore;
import { AdminSidebar } from '@/components/AdminSidebar';
// @ts-ignore;
import { AdminHeader } from '@/components/AdminHeader';
// @ts-ignore;
import { AdminDashboardCards } from '@/components/AdminDashboardCards';
// @ts-ignore;
import { AdminCharts } from '@/components/AdminCharts';
// @ts-ignore;
import { AdminDataTable } from '@/components/AdminDataTable';
// @ts-ignore;
import { AdminAIChat } from '@/components/AdminAIChat';
// @ts-ignore;
import { AdminCompliancePanel } from '@/components/AdminCompliancePanel';
// @ts-ignore;
import { SystemHealthCard } from '@/components/SystemHealthCard';
// @ts-ignore;
import { cachedCallDataSource } from '@/lib/cache';
export default function AdminDashboard(props) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');
  const [dashboardData, setDashboardData] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    pendingReviews: 0,
    systemHealth: 95,
    complianceScore: 98,
    lastUpdate: new Date().toISOString(),
    recentActivities: [],
    systemAlerts: [],
    performanceMetrics: {}
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  const [activityLogs, setActivityLogs] = useState([]);
  const [systemAlerts, setSystemAlerts] = useState([]);
  const [performanceData, setPerformanceData] = useState({});
  const {
    toast
  } = useToast();
  const {
    $w
  } = props;

  // 获取仪表板数据
  const fetchDashboardData = async (forceRefresh = false) => {
    try {
      setLoading(true);
      setRefreshing(true);
      const [users, jobs, applications, compliance, systemHealth] = await Promise.all([
      // 获取用户数据
      cachedCallDataSource($w, {
        dataSourceName: 'user',
        methodName: 'wedaGetRecordsV2',
        params: {
          getCount: true
        }
      }, {
        forceRefresh
      }),
      // 获取职位数据
      cachedCallDataSource($w, {
        dataSourceName: 'job_post',
        methodName: 'wedaGetRecordsV2',
        params: {
          getCount: true
        }
      }, {
        forceRefresh
      }),
      // 获取申请数据
      cachedCallDataSource($w, {
        dataSourceName: 'application',
        methodName: 'wedaGetRecordsV2',
        params: {
          getCount: true
        }
      }, {
        forceRefresh
      }),
      // 获取合规数据
      cachedCallDataSource($w, {
        dataSourceName: 'compliance_audit',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              status: {
                $eq: 'pending'
              }
            }
          },
          getCount: true
        }
      }, {
        forceRefresh
      }),
      // 获取系统健康数据
      cachedCallDataSource($w, {
        dataSourceName: 'admin_dashboard',
        methodName: 'wedaGetRecordsV2',
        params: {
          orderBy: [{
            createdAt: 'desc'
          }],
          pageSize: 1
        }
      }, {
        forceRefresh
      })]);

      // 获取活跃用户
      const activeUsers = await cachedCallDataSource($w, {
        dataSourceName: 'user',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              lastLoginAt: {
                $gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
              }
            }
          },
          getCount: true
        }
      }, {
        forceRefresh
      });

      // 获取活跃职位
      const activeJobs = await cachedCallDataSource($w, {
        dataSourceName: 'job_post',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              status: {
                $eq: 'active'
              }
            }
          },
          getCount: true
        }
      }, {
        forceRefresh
      });

      // 获取活动日志
      const activityLogs = await fetchActivityLogs();
      const systemAlerts = await fetchSystemAlerts();
      const performanceData = await fetchPerformanceData();
      setDashboardData({
        totalUsers: users.total || 0,
        activeUsers: activeUsers.total || 0,
        totalJobs: jobs.total || 0,
        activeJobs: activeJobs.total || 0,
        totalApplications: applications.total || 0,
        pendingReviews: compliance.total || 0,
        systemHealth: systemHealth.records?.[0]?.healthScore || 95,
        complianceScore: systemHealth.records?.[0]?.complianceScore || 98,
        lastUpdate: new Date().toISOString(),
        recentActivities: activityLogs,
        systemAlerts: systemAlerts,
        performanceMetrics: performanceData
      });
      setActivityLogs(activityLogs);
      setSystemAlerts(systemAlerts);
      setPerformanceData(performanceData);
    } catch (error) {
      console.error('获取仪表板数据失败:', error);
      toast({
        title: '获取数据失败',
        description: error.message || '无法加载数据，请重试',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // 获取活动日志
  const fetchActivityLogs = async () => {
    try {
      const [userLogs, jobLogs, applicationLogs] = await Promise.all([
      // 用户活动
      cachedCallDataSource($w, {
        dataSourceName: 'user',
        methodName: 'wedaGetRecordsV2',
        params: {
          orderBy: [{
            createdAt: 'desc'
          }],
          pageSize: 10,
          select: {
            name: true,
            email: true,
            createdAt: true,
            lastLoginAt: true,
            type: true
          }
        }
      }),
      // 职位活动
      cachedCallDataSource($w, {
        dataSourceName: 'job_post',
        methodName: 'wedaGetRecordsV2',
        params: {
          orderBy: [{
            createdAt: 'desc'
          }],
          pageSize: 10,
          select: {
            title: true,
            company: true,
            createdAt: true,
            status: true,
            recruiterId: true
          }
        }
      }),
      // 申请活动
      cachedCallDataSource($w, {
        dataSourceName: 'application',
        methodName: 'wedaGetRecordsV2',
        params: {
          orderBy: [{
            createdAt: 'desc'
          }],
          pageSize: 10,
          select: {
            candidateName: true,
            jobTitle: true,
            status: true,
            createdAt: true
          }
        }
      })]);

      // 合并并格式化活动日志
      const logs = [];
      userLogs.records?.forEach(user => {
        logs.push({
          id: `user_${user._id}`,
          type: 'user',
          action: user.createdAt === user.lastLoginAt ? '注册' : '登录',
          user: user.name || user.email,
          timestamp: user.createdAt || user.lastLoginAt,
          details: `用户类型: ${user.type || '未知'}`
        });
      });
      jobLogs.records?.forEach(job => {
        logs.push({
          id: `job_${job._id}`,
          type: 'job',
          action: '发布职位',
          user: job.company || '未知公司',
          timestamp: job.createdAt,
          details: `职位: ${job.title}`
        });
      });
      applicationLogs.records?.forEach(app => {
        logs.push({
          id: `app_${app._id}`,
          type: 'application',
          action: '提交申请',
          user: app.candidateName || '匿名候选人',
          timestamp: app.createdAt,
          details: `申请职位: ${app.jobTitle}`
        });
      });

      // 按时间排序
      return logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 20);
    } catch (error) {
      console.error('获取活动日志失败:', error);
      return [];
    }
  };

  // 获取系统警报
  const fetchSystemAlerts = async () => {
    try {
      // 模拟系统警报
      return [{
        id: 1,
        type: 'warning',
        title: '系统负载较高',
        message: '当前系统CPU使用率超过80%',
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        severity: 'medium'
      }, {
        id: 2,
        type: 'info',
        title: '数据备份完成',
        message: '今日数据备份已成功完成',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        severity: 'low'
      }, {
        id: 3,
        type: 'error',
        title: '合规检查失败',
        message: '发现3个职位描述存在偏见风险',
        timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        severity: 'high'
      }];
    } catch (error) {
      console.error('获取系统警报失败:', error);
      return [];
    }
  };

  // 获取性能数据
  const fetchPerformanceData = async () => {
    try {
      // 模拟性能数据
      return {
        responseTime: [120, 150, 180, 140, 160, 130, 145],
        throughput: [100, 120, 110, 130, 125, 115, 135],
        errorRate: [0.1, 0.2, 0.15, 0.1, 0.05, 0.08, 0.12],
        userSatisfaction: [95, 92, 94, 96, 93, 95, 97]
      };
    } catch (error) {
      console.error('获取性能数据失败:', error);
      return {};
    }
  };

  // 处理刷新
  const handleRefresh = async () => {
    await fetchDashboardData(true);
    toast({
      title: '数据已刷新',
      description: '仪表板数据已更新',
      variant: 'success'
    });
  };

  // 处理导航
  const handleNavigation = (pageId, params = {}) => {
    $w.utils.navigateTo({
      pageId,
      params
    });
  };

  // 初始化数据
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // 渲染活动日志
  const renderActivityLog = () => <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>最近活动</span>
          <Button variant="ghost" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {activityLogs.length > 0 ? activityLogs.map(log => <div key={log.id} className="flex items-start space-x-3 p-3 border rounded-lg">
              <div className={`w-2 h-2 rounded-full mt-2 ${log.type === 'user' ? 'bg-blue-500' : log.type === 'job' ? 'bg-green-500' : 'bg-purple-500'}`} />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-sm">{log.action}</p>
                  <span className="text-xs text-gray-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                </div>
                <p className="text-sm text-gray-600">{log.user}</p>
                <p className="text-xs text-gray-500">{log.details}</p>
              </div>
            </div>) : <div className="text-center py-8 text-gray-500">
            <Activity className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p>暂无活动记录</p>
          </div>}
        </div>
      </CardContent>
    </Card>;

  // 渲染系统警报
  const renderSystemAlerts = () => <Card>
      <CardHeader>
        <CardTitle>系统警报</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {systemAlerts.length > 0 ? systemAlerts.map(alert => <div key={alert.id} className={`p-3 border rounded-lg ${alert.severity === 'high' ? 'border-red-200 bg-red-50' : alert.severity === 'medium' ? 'border-yellow-200 bg-yellow-50' : 'border-blue-200 bg-blue-50'}`}>
              <div className="flex items-start space-x-3">
                <AlertTriangle className={`h-5 w-5 mt-0.5 ${alert.severity === 'high' ? 'text-red-600' : alert.severity === 'medium' ? 'text-yellow-600' : 'text-blue-600'}`} />
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{alert.title}</h4>
                  <p className="text-sm text-gray-600">{alert.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{new Date(alert.timestamp).toLocaleString()}</p>
                </div>
              </div>
            </div>) : <div className="text-center py-8 text-gray-500">
            <AlertCircle className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p>暂无系统警报</p>
          </div>}
        </div>
      </CardContent>
    </Card>;
  if (loading) {
    return <div className="min-h-screen bg-gray-50">
      <style jsx>{`
        body {
          background: #f9fafb;
        }
      `}</style>
      <div className="flex items-center justify-center h-screen">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-32 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-64"></div>
        </div>
      </div>
    </div>;
  }
  return <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <style jsx>{`
        body {
          background: #f9fafb;
        }
        .dark body {
          background: #111827;
        }
      `}</style>

      <div className="flex h-screen">
        {/* 侧边栏 */}
        <AdminSidebar isCollapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} onNavigate={handleNavigation} activeSection={activeSection} onSectionChange={setActiveSection} />

        {/* 主内容区域 */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* 顶部导航 */}
          <AdminHeader onNotificationClick={notification => {
          toast({
            title: notification.title,
            description: notification.message
          });
        }} onSettingsClick={action => {
          if (action === 'logout') {
            $w.utils.navigateTo({
              pageId: 'login'
            });
          } else {
            $w.utils.navigateTo({
              pageId: `admin-${action}`
            });
          }
        }} onRefresh={handleRefresh} />

          {/* 主内容 */}
          <main className="flex-1 overflow-y-auto p-6">
            <div className="max-w-7xl mx-auto">
              {/* 页面标题 */}
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    管理员仪表板
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    系统概览和管理
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" onClick={handleRefresh}>
                    <RefreshCw className={`h-4 w-4 mr-2`} />
                    刷新
                  </Button>
                </div>
              </div>

              {/* 统计卡片 */}
              <AdminDashboardCards data={dashboardData} onCardClick={card => {
              console.log('点击卡片:', card);
              if (card.type === 'users') {
                setActiveSection('users');
              } else if (card.type === 'jobs') {
                setActiveSection('jobs');
              } else if (card.type === 'compliance') {
                setActiveSection('compliance');
              }
            }} />

              {/* 主要内容区域 */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                {/* 左侧：图表和系统健康 */}
                <div className="lg:col-span-2 space-y-6">
                  <AdminCharts data={performanceData} />
                  <SystemHealthCard health={dashboardData.systemHealth} />
                  <AdminCompliancePanel complianceScore={dashboardData.complianceScore} />
                </div>

                {/* 右侧：活动日志和警报 */}
                <div className="space-y-6">
                  {renderActivityLog()}
                  {renderSystemAlerts()}
                </div>
              </div>

              {/* 数据表格 */}
              <div className="mt-6">
                <AdminDataTable data={activityLogs} onRowClick={row => {
                console.log('点击行:', row);
              }} />
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* AI助手 */}
      <AdminAIChat isOpen={showAIChat} onClose={() => setShowAIChat(false)} />
    </div>;
}