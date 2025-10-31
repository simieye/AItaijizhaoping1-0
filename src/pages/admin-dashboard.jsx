// @ts-ignore;
import React, { useState, useEffect, useCallback } from 'react';
// @ts-ignore;
import { Button, useToast } from '@/components/ui';
// @ts-ignore;
import { MessageSquare, RefreshCw, Download } from 'lucide-react';

// @ts-ignore;
import { AdminSidebar } from '@/components/AdminSidebar';
// @ts-ignore;
import { AdminHeader } from '@/components/AdminHeader';
// @ts-ignore;
import { AdminDashboardCards } from '@/components/AdminDashboardCards';
// @ts-ignore;
import { AdminAIChat } from '@/components/AdminAIChat';
// @ts-ignore;
import { AdminCompliancePanel } from '@/components/AdminCompliancePanel';
// @ts-ignore;
import { AdminDataTable } from '@/components/AdminDataTable';
// @ts-ignore;
import { AdminCharts } from '@/components/AdminCharts';
// @ts-ignore;
import { AdminActivityLog } from '@/components/AdminActivityLog';
// @ts-ignore;
import { SystemHealthCard } from '@/components/SystemHealthCard';
// @ts-ignore;
import { cachedCallDataSource, debounce, getSystemHealth } from '@/lib/cache';
export default function AdminDashboard(props) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [aiChatOpen, setAiChatOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    totalUsers: 0,
    totalCandidates: 0,
    totalRecruiters: 0,
    totalJobs: 0,
    totalApplications: 0,
    todayMessages: 0,
    totalAudits: 0,
    totalDEIMetrics: 0,
    totalAIExplanations: 0,
    totalConsentLogs: 0,
    complianceScore: 94,
    activeJobs: 0,
    newUsersToday: 0,
    lastUpdated: new Date().toISOString()
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0
  });
  const [filters, setFilters] = useState({
    role: 'all',
    status: 'all',
    dateRange: 'all',
    search: ''
  });
  const [sortConfig, setSortConfig] = useState({
    field: 'createdAt',
    direction: 'desc'
  });
  const [exporting, setExporting] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [cacheStats, setCacheStats] = useState({
    hitRate: 0,
    totalRequests: 0,
    cacheHits: 0
  });
  const [systemHealth, setSystemHealth] = useState({
    tokenRemaining: 30,
    errorRate: 0,
    totalRequests: 0,
    last5MinErrorCount: 0,
    cacheSize: 0
  });
  const {
    toast
  } = useToast();
  const {
    $w
  } = props;

  // 防抖刷新函数
  const debouncedRefresh = useCallback(debounce(async () => {
    await fetchDashboardData(true);
  }, 300), []);

  // 防抖搜索函数
  const debouncedSearch = useCallback(debounce(async searchTerm => {
    if (!searchTerm.trim()) {
      await fetchTableData(pagination.page, filters, sortConfig);
      return;
    }
    const newFilters = {
      ...filters,
      search: searchTerm
    };
    await fetchTableData(1, newFilters, sortConfig);
  }, 300), [pagination.page, filters, sortConfig]);

  // 防抖导出函数
  const debouncedExport = useCallback(debounce(async () => {
    await exportData();
  }, 500), []);

  // 获取全局统计数据（带缓存）
  const fetchDashboardData = async (forceRefresh = false) => {
    try {
      setLoading(true);
      setRefreshing(true);
      const [users, candidates, recruiters, jobs, applications, todayMessages, compliance, deiMetrics, aiExplanations, consentLogs] = await Promise.all([
      // 用户统计
      cachedCallDataSource($w, {
        dataSourceName: 'user',
        methodName: 'wedaGetRecordsV2',
        params: {
          getCount: true,
          pageSize: 1
        }
      }, {
        forceRefresh
      }),
      // 候选人统计
      cachedCallDataSource($w, {
        dataSourceName: 'candidate_profile',
        methodName: 'wedaGetRecordsV2',
        params: {
          getCount: true,
          pageSize: 1
        }
      }, {
        forceRefresh
      }),
      // 招聘者统计
      cachedCallDataSource($w, {
        dataSourceName: 'recruiter_profile',
        methodName: 'wedaGetRecordsV2',
        params: {
          getCount: true,
          pageSize: 1
        }
      }, {
        forceRefresh
      }),
      // 职位统计
      cachedCallDataSource($w, {
        dataSourceName: 'job_post',
        methodName: 'wedaGetRecordsV2',
        params: {
          getCount: true,
          pageSize: 1
        }
      }, {
        forceRefresh
      }),
      // 申请统计
      cachedCallDataSource($w, {
        dataSourceName: 'application',
        methodName: 'wedaGetRecordsV2',
        params: {
          getCount: true,
          pageSize: 1
        }
      }, {
        forceRefresh
      }),
      // 今日消息
      cachedCallDataSource($w, {
        dataSourceName: 'chat_message',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              createdAt: {
                $gte: new Date(new Date().setHours(0, 0, 0, 0))
              }
            }
          },
          getCount: true
        }
      }, {
        forceRefresh
      }),
      // 合规审计
      cachedCallDataSource($w, {
        dataSourceName: 'compliance_audit',
        methodName: 'wedaGetRecordsV2',
        params: {
          getCount: true,
          pageSize: 1
        }
      }, {
        forceRefresh
      }),
      // DEI指标
      cachedCallDataSource($w, {
        dataSourceName: 'dei_metric',
        methodName: 'wedaGetRecordsV2',
        params: {
          getCount: true,
          pageSize: 1
        }
      }, {
        forceRefresh
      }),
      // AI解释
      cachedCallDataSource($w, {
        dataSourceName: 'ai_explanation',
        methodName: 'wedaGetRecordsV2',
        params: {
          getCount: true,
          pageSize: 1
        }
      }, {
        forceRefresh
      }),
      // 同意日志
      cachedCallDataSource($w, {
        dataSourceName: 'consent_log',
        methodName: 'wedaGetRecordsV2',
        params: {
          getCount: true,
          pageSize: 1
        }
      }, {
        forceRefresh
      })]);

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

      // 获取今日新增用户
      const newUsersToday = await cachedCallDataSource($w, {
        dataSourceName: 'user',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              createdAt: {
                $gte: new Date(new Date().setHours(0, 0, 0, 0))
              }
            }
          },
          getCount: true
        }
      }, {
        forceRefresh
      });

      // 获取合规评分
      const complianceScore = await calculateComplianceScore(forceRefresh);
      setDashboardData({
        totalUsers: users.total || 0,
        totalCandidates: candidates.total || 0,
        totalRecruiters: recruiters.total || 0,
        totalJobs: jobs.total || 0,
        totalApplications: applications.total || 0,
        todayMessages: todayMessages.total || 0,
        totalAudits: compliance.total || 0,
        totalDEIMetrics: deiMetrics.total || 0,
        totalAIExplanations: aiExplanations.total || 0,
        totalConsentLogs: consentLogs.total || 0,
        complianceScore: complianceScore,
        activeJobs: activeJobs.total || 0,
        newUsersToday: newUsersToday.total || 0,
        lastUpdated: new Date().toISOString()
      });

      // 更新系统健康状态
      const health = getSystemHealth();
      setSystemHealth(health);
    } catch (error) {
      console.error('获取仪表盘数据失败:', error);
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

  // 计算合规评分（带缓存）
  const calculateComplianceScore = async (forceRefresh = false) => {
    try {
      const audits = await cachedCallDataSource($w, {
        dataSourceName: 'compliance_audit',
        methodName: 'wedaGetRecordsV2',
        params: {
          select: {
            score: true
          },
          pageSize: 100
        }
      }, {
        forceRefresh
      });
      if (audits.records && audits.records.length > 0) {
        const totalScore = audits.records.reduce((sum, audit) => sum + (audit.score || 0), 0);
        return Math.round(totalScore / audits.records.length);
      }
      return 94;
    } catch (error) {
      console.error('计算合规评分失败:', error);
      return 94;
    }
  };

  // 获取表格数据（带缓存、分页、筛选、排序）
  const fetchTableData = useCallback(async (page = 1, filters = {}, sort = {}, forceRefresh = false) => {
    try {
      // 构建查询条件
      const whereConditions = [];
      if (filters.search) {
        whereConditions.push({
          $or: [{
            name: {
              $search: filters.search
            }
          }, {
            email: {
              $search: filters.search
            }
          }]
        });
      }
      if (filters.role && filters.role !== 'all') {
        whereConditions.push({
          role: {
            $eq: filters.role
          }
        });
      }
      if (filters.status && filters.status !== 'all') {
        whereConditions.push({
          status: {
            $eq: filters.status
          }
        });
      }
      if (filters.dateRange && filters.dateRange !== 'all') {
        const now = new Date();
        let startDate;
        switch (filters.dateRange) {
          case 'today':
            startDate = new Date(now.setHours(0, 0, 0, 0));
            break;
          case 'week':
            startDate = new Date(now.setDate(now.getDate() - 7));
            break;
          case 'month':
            startDate = new Date(now.setMonth(now.getMonth() - 1));
            break;
          default:
            startDate = null;
        }
        if (startDate) {
          whereConditions.push({
            createdAt: {
              $gte: startDate
            }
          });
        }
      }
      const filter = whereConditions.length > 0 ? {
        $and: whereConditions
      } : {};

      // 构建排序
      const orderBy = sort.field ? [{
        [sort.field]: sort.direction
      }] : [{
        createdAt: 'desc'
      }];
      const response = await cachedCallDataSource($w, {
        dataSourceName: 'user',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: filter
          },
          orderBy,
          pageSize: pagination.pageSize,
          pageNumber: page,
          getCount: true,
          select: {
            $master: true
          }
        }
      }, {
        forceRefresh
      });
      setPagination(prev => ({
        ...prev,
        page,
        total: response.total || 0
      }));
      setTableData(response.records || []);
      return {
        records: response.records || [],
        total: response.total || 0
      };
    } catch (error) {
      console.error('获取表格数据失败:', error);
      toast({
        title: '获取数据失败',
        description: error.message || '无法加载数据，请重试',
        variant: 'destructive'
      });
      setTableData([]);
      return {
        records: [],
        total: 0
      };
    }
  }, [pagination.pageSize, $w]);

  // 获取活动日志（带缓存）
  const fetchActivityLogs = async (forceRefresh = false) => {
    try {
      const response = await cachedCallDataSource($w, {
        dataSourceName: 'admin_dashboard',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              actionType: {
                $in: ['login', 'logout', 'data_export', 'user_management', 'system_config']
              }
            }
          },
          orderBy: [{
            createdAt: 'desc'
          }],
          pageSize: 10
        }
      }, {
        forceRefresh
      });
      setActivityLogs(response.records || []);
    } catch (error) {
      console.error('获取活动日志失败:', error);
      setActivityLogs([]);
    }
  };

  // 更新系统健康状态
  const updateSystemHealth = () => {
    const health = getSystemHealth();
    setSystemHealth(health);
  };

  // 防抖筛选变化
  const handleFilterChange = useCallback(debounce(newFilters => {
    setFilters(newFilters);
    setPagination(prev => ({
      ...prev,
      page: 1
    }));
    fetchTableData(1, newFilters, sortConfig);
  }, 300), [sortConfig]);

  // 防抖排序变化
  const handleSortChange = useCallback(debounce(newSort => {
    setSortConfig(newSort);
    fetchTableData(pagination.page, filters, newSort);
  }, 300), [pagination.page, filters]);

  // 防抖分页变化
  const handlePageChange = useCallback(debounce(newPage => {
    setPagination(prev => ({
      ...prev,
      page: newPage
    }));
    fetchTableData(newPage, filters, sortConfig);
  }, 300), [filters, sortConfig]);

  // 防抖搜索
  const handleSearch = query => {
    debouncedSearch(query);
  };

  // 防抖导出
  const debouncedExportData = useCallback(debounce(async () => {
    await exportData();
  }, 500), []);

  // 处理AI消息
  const handleAIMessage = async (userMessage, botMessage) => {
    try {
      await cachedCallDataSource($w, {
        dataSourceName: 'admin_dashboard',
        methodName: 'wedaCreateV2',
        params: {
          data: {
            adminId: props.$w.auth.currentUser?.userId || 'system',
            adminName: props.$w.auth.currentUser?.name || 'System',
            sessionType: 'ai_chat',
            actionType: 'ai_interaction',
            aiChatSession: {
              userMessage: userMessage.content,
              botMessage: botMessage.content,
              timestamp: new Date().toISOString(),
              sessionId: Date.now().toString()
            },
            isSuccess: true,
            createdAt: new Date().toISOString()
          }
        }
      });
    } catch (error) {
      console.error('记录AI对话失败:', error);
    }
  };

  // 导出数据（防抖）
  const exportData = async () => {
    try {
      setExporting(true);
      const response = await cachedCallDataSource($w, {
        dataSourceName: 'user',
        methodName: 'wedaGetRecordsV2',
        params: {
          select: {
            name: true,
            email: true,
            role: true,
            status: true,
            createdAt: true,
            updatedAt: true
          },
          pageSize: 1000
        }
      });
      const data = response.records || [];
      const csvContent = [['姓名', '邮箱', '角色', '状态', '创建时间', '更新时间'], ...data.map(row => [row.name || '', row.email || '', row.role || '', row.status || '', row.createdAt || '', row.updatedAt || ''])].map(row => row.join(',')).join('\n');
      const blob = new Blob([csvContent], {
        type: 'text/csv;charset=utf-8;'
      });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `admin_export_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast({
        title: '导出成功',
        description: `已导出 ${data.length} 条记录`
      });
      await logAdminAction('data_export', {
        exportType: 'user_data',
        recordCount: data.length,
        format: 'csv'
      });
    } catch (error) {
      toast({
        title: '导出失败',
        description: error.message || '导出过程中出现错误',
        variant: 'destructive'
      });
    } finally {
      setExporting(false);
    }
  };

  // 记录管理员操作
  const logAdminAction = async (action, details) => {
    try {
      await cachedCallDataSource($w, {
        dataSourceName: 'admin_dashboard',
        methodName: 'wedaCreateV2',
        params: {
          data: {
            adminId: props.$w.auth.currentUser?.userId || 'system',
            adminName: props.$w.auth.currentUser?.name || 'System',
            adminRole: props.$w.auth.currentUser?.type || 'admin',
            actionType: action,
            actionDetails: details,
            ipAddress: '127.0.0.1',
            userAgent: navigator.userAgent,
            isSuccess: true,
            createdAt: new Date().toISOString()
          }
        }
      });
    } catch (error) {
      console.error('记录管理员操作失败:', error);
    }
  };

  // 处理刷新
  const handleRefresh = async () => {
    await debouncedRefresh();
    await logAdminAction('data_refresh', {
      refreshType: 'dashboard',
      timestamp: new Date().toISOString()
    });
  };

  // 处理导航
  const handleNavigation = pageId => {
    $w.utils.navigateTo({
      pageId
    });
  };

  // 处理Token刷新
  const handleRefreshToken = async newToken => {
    toast({
      title: 'Token已刷新',
      description: '系统访问令牌已更新',
      variant: 'success'
    });
    // 可以在这里更新全局token状态
  };

  // 实时更新系统健康状态
  useEffect(() => {
    const interval = setInterval(() => {
      updateSystemHealth();
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  useEffect(() => {
    fetchDashboardData();
    fetchActivityLogs();
  }, []);
  useEffect(() => {
    fetchTableData(pagination.page, filters, sortConfig);
  }, [pagination.page, filters, sortConfig, fetchTableData]);
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
          <AdminHeader onSearch={handleSearch} onNotificationClick={notification => {
          toast({
            title: notification.title,
            description: notification.message
          });
          logAdminAction('view_notification', notification);
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
        }} />

          {/* 主内容 */}
          <main className="flex-1 overflow-y-auto p-6">
            <div className="max-w-7xl mx-auto">
              {/* 页面标题和操作 */}
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    系统管理总控台
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    实时监控和管理所有业务模块
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    缓存命中率: {systemHealth.hitRate}%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Token剩余: {systemHealth.tokenRemaining}分钟
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    错误率: {systemHealth.errorRate}%
                  </div>
                  <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
                    <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                    {refreshing ? '刷新中...' : '刷新数据'}
                  </Button>
                  <Button variant="outline" size="sm" onClick={debouncedExportData} disabled={exporting}>
                    <Download className={`h-4 w-4 mr-2 ${exporting ? 'animate-spin' : ''}`} />
                    {exporting ? '导出中...' : '导出数据'}
                  </Button>
                </div>
              </div>

              {/* 系统健康卡片 */}
              <div className="mb-6">
                <SystemHealthCard $w={$w} onRefreshToken={handleRefreshToken} systemHealth={systemHealth} />
              </div>

              {/* 统计卡片 */}
              <AdminDashboardCards data={dashboardData} onCardClick={card => {
              setActiveSection(card.section);
              logAdminAction('navigate_section', {
                section: card.section
              });
            }} />

              {/* 主要内容区域 */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                {/* 左侧：图表区域 */}
                <div className="lg:col-span-2">
                  <AdminCharts data={dashboardData} onChartClick={chart => {
                  console.log('图表点击:', chart);
                  logAdminAction('view_chart', {
                    chartType: chart.type
                  });
                }} />
                </div>

                {/* 右侧：合规面板 */}
                <div>
                  <AdminCompliancePanel complianceScore={dashboardData.complianceScore} totalAudits={dashboardData.totalAudits} totalDEIMetrics={dashboardData.totalDEIMetrics} totalAIExplanations={dashboardData.totalAIExplanations} totalConsentLogs={dashboardData.totalConsentLogs} onComplianceClick={compliance => {
                  console.log('合规详情:', compliance);
                  logAdminAction('view_compliance', {
                    complianceType: compliance.type
                  });
                }} />
                </div>
              </div>

              {/* 数据表格 */}
              <div className="mt-6">
                <AdminDataTable data={tableData} pagination={pagination} filters={filters} sortConfig={sortConfig} onFilterChange={handleFilterChange} onSortChange={handleSortChange} onPageChange={handlePageChange} onRowClick={row => {
                console.log('行点击:', row);
                logAdminAction('view_user_detail', {
                  userId: row._id
                });
              }} />
              </div>

              {/* 活动日志 */}
              <div className="mt-6">
                <AdminActivityLog logs={activityLogs} onLogClick={log => {
                console.log('日志详情:', log);
                logAdminAction('view_activity_log', {
                  logId: log._id
                });
              }} />
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* AI客服按钮 */}
      <Button className="fixed bottom-6 right-6 rounded-full h-14 w-14 shadow-lg bg-blue-500 hover:bg-blue-600" onClick={() => setAiChatOpen(true)}>
        <MessageSquare className="h-6 w-6" />
      </Button>

      {/* AI客服抽屉 */}
      <AdminAIChat isOpen={aiChatOpen} onClose={() => setAiChatOpen(false)} userId={props.$w.auth.currentUser?.userId || 'admin_system'} userName={props.$w.auth.currentUser?.name || '系统管理员'} onMessageSent={handleAIMessage} />
    </div>;
}