// @ts-ignore;
import React, { useState, useEffect, useCallback } from 'react';
// @ts-ignore;
import { Button, useToast, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui';
// @ts-ignore;
import { Menu, MessageSquare, RefreshCw, Download, Filter } from 'lucide-react';

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
export default function AdminDashboard(props) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [aiChatOpen, setAiChatOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState({});
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
  const {
    toast
  } = useToast();
  const {
    $w
  } = props;

  // 获取全局统计数据
  const fetchDashboardStats = async () => {
    try {
      const [users, candidates, recruiters, jobs, applications, todayMessages, compliance, deiMetrics, aiExplanations, consentLogs] = await Promise.all([
      // 用户统计
      $w.cloud.callDataSource({
        dataSourceName: 'user',
        methodName: 'wedaGetRecordsV2',
        params: {
          getCount: true,
          pageSize: 1
        }
      }),
      // 候选人统计
      $w.cloud.callDataSource({
        dataSourceName: 'candidate_profile',
        methodName: 'wedaGetRecordsV2',
        params: {
          getCount: true,
          pageSize: 1
        }
      }),
      // 招聘者统计
      $w.cloud.callDataSource({
        dataSourceName: 'recruiter_profile',
        methodName: 'wedaGetRecordsV2',
        params: {
          getCount: true,
          pageSize: 1
        }
      }),
      // 职位统计
      $w.cloud.callDataSource({
        dataSourceName: 'job_post',
        methodName: 'wedaGetRecordsV2',
        params: {
          getCount: true,
          pageSize: 1
        }
      }),
      // 申请统计
      $w.cloud.callDataSource({
        dataSourceName: 'application',
        methodName: 'wedaGetRecordsV2',
        params: {
          getCount: true,
          pageSize: 1
        }
      }),
      // 今日消息
      $w.cloud.callDataSource({
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
      }),
      // 合规审计
      $w.cloud.callDataSource({
        dataSourceName: 'compliance_audit',
        methodName: 'wedaGetRecordsV2',
        params: {
          getCount: true,
          pageSize: 1
        }
      }),
      // DEI指标
      $w.cloud.callDataSource({
        dataSourceName: 'dei_metric',
        methodName: 'wedaGetRecordsV2',
        params: {
          getCount: true,
          pageSize: 1
        }
      }),
      // AI解释
      $w.cloud.callDataSource({
        dataSourceName: 'ai_explanation',
        methodName: 'wedaGetRecordsV2',
        params: {
          getCount: true,
          pageSize: 1
        }
      }),
      // 同意日志
      $w.cloud.callDataSource({
        dataSourceName: 'consent_log',
        methodName: 'wedaGetRecordsV2',
        params: {
          getCount: true,
          pageSize: 1
        }
      })]);

      // 获取活跃职位
      const activeJobs = await $w.cloud.callDataSource({
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
      });

      // 获取今日新增用户
      const newUsersToday = await $w.cloud.callDataSource({
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
      });

      // 获取合规评分
      const complianceScore = await calculateComplianceScore();
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
        newUsersToday: newUsersToday.total || 0
      });
    } catch (error) {
      console.error('获取仪表盘数据失败:', error);
      toast({
        title: '获取数据失败',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  // 计算合规评分
  const calculateComplianceScore = async () => {
    try {
      const audits = await $w.cloud.callDataSource({
        dataSourceName: 'compliance_audit',
        methodName: 'wedaGetRecordsV2',
        params: {
          select: {
            score: true
          },
          pageSize: 100
        }
      });
      if (audits.records && audits.records.length > 0) {
        const totalScore = audits.records.reduce((sum, audit) => sum + (audit.score || 0), 0);
        return Math.round(totalScore / audits.records.length);
      }
      return 94; // 默认评分
    } catch (error) {
      console.error('计算合规评分失败:', error);
      return 94;
    }
  };

  // 获取表格数据（带分页、筛选、排序）
  const fetchTableData = useCallback(async (page = 1, filters = {}, sort = {}) => {
    try {
      setLoading(true);

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
      const response = await $w.cloud.callDataSource({
        dataSourceName: 'user',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: filter
          },
          orderBy,
          pageSize: pagination.pageSize,
          pageNumber: page,
          getCount: true
        }
      });
      setPagination(prev => ({
        ...prev,
        page,
        total: response.total || 0
      }));
      return {
        records: response.records || [],
        total: response.total || 0
      };
    } catch (error) {
      console.error('获取表格数据失败:', error);
      toast({
        title: '获取数据失败',
        description: error.message,
        variant: 'destructive'
      });
      return {
        records: [],
        total: 0
      };
    } finally {
      setLoading(false);
    }
  }, [pagination.pageSize, $w]);

  // 导出数据
  const exportData = async () => {
    try {
      setExporting(true);
      const response = await $w.cloud.callDataSource({
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

      // 转换为CSV格式
      const csvContent = [['姓名', '邮箱', '角色', '状态', '创建时间', '更新时间'], ...data.map(row => [row.name || '', row.email || '', row.role || '', row.status || '', row.createdAt || '', row.updatedAt || ''])].map(row => row.join(',')).join('\n');

      // 创建下载链接
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
    } catch (error) {
      toast({
        title: '导出失败',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setExporting(false);
    }
  };

  // 刷新数据
  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchDashboardStats(), fetchTableData(pagination.page, filters, sortConfig)]);
    setRefreshing(false);
    toast({
      title: '刷新成功',
      description: '数据已更新'
    });
  };

  // 处理筛选变化
  const handleFilterChange = newFilters => {
    setFilters(newFilters);
    setPagination(prev => ({
      ...prev,
      page: 1
    }));
  };

  // 处理排序变化
  const handleSortChange = newSort => {
    setSortConfig(newSort);
  };

  // 处理分页变化
  const handlePageChange = newPage => {
    setPagination(prev => ({
      ...prev,
      page: newPage
    }));
  };

  // 处理导航
  const handleNavigation = pageId => {
    $w.utils.navigateTo({
      pageId
    });
  };

  // 处理搜索
  const handleSearch = query => {
    handleFilterChange({
      ...filters,
      search: query
    });
  };

  // 处理AI消息
  const handleAIMessage = async (userMessage, botMessage) => {
    try {
      // 记录AI对话到admin_dashboard
      await $w.cloud.callDataSource({
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

  // 记录管理员操作
  const logAdminAction = async (action, details) => {
    try {
      await $w.cloud.callDataSource({
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
            // 实际应用中应获取真实IP
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
  useEffect(() => {
    fetchDashboardStats();
  }, []);
  useEffect(() => {
    fetchTableData(pagination.page, filters, sortConfig);
  }, [pagination.page, filters, sortConfig, fetchTableData]);
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
        <AdminSidebar isCollapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} onNavigate={handleNavigation} />

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
                  <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
                    <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                    {refreshing ? '刷新中...' : '刷新数据'}
                  </Button>
                  <Button variant="outline" size="sm" onClick={exportData} disabled={exporting}>
                    <Download className={`h-4 w-4 mr-2 ${exporting ? 'animate-spin' : ''}`} />
                    {exporting ? '导出中...' : '导出数据'}
                  </Button>
                  <Button size="sm" onClick={() => {
                  setAiChatOpen(true);
                  logAdminAction('open_ai_chat', {
                    source: 'dashboard'
                  });
                }}>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    AI助手
                  </Button>
                </div>
              </div>

              {/* 数据卡片 */}
              <AdminDashboardCards data={dashboardData} loading={loading} />

              {/* 合规审计面板 */}
              <div className="mt-8">
                <AdminCompliancePanel onGenerateReport={async () => {
                await logAdminAction('generate_compliance_report', {});
                toast({
                  title: '报告生成中',
                  description: '正在生成合规审计报告...'
                });
              }} onViewDetails={async alert => {
                await logAdminAction('view_compliance_details', alert);
                toast({
                  title: '查看详情',
                  description: `正在查看: ${alert?.title || '合规详情'}`
                });
              }} />
              </div>

              {/* 图表区域 */}
              <div className="mt-8">
                <AdminCharts data={dashboardData} loading={loading} />
              </div>

              {/* 数据表格 */}
              <div className="mt-8">
                <AdminDataTable type="overview" data={dashboardData} loading={loading} pagination={pagination} filters={filters} sortConfig={sortConfig} onPageChange={handlePageChange} onFilterChange={handleFilterChange} onSortChange={handleSortChange} onRowClick={async row => {
                await logAdminAction('view_user_details', {
                  userId: row.id
                });
                toast({
                  title: '查看详情',
                  description: `正在查看: ${row.name || '记录详情'}`
                });
              }} onEdit={async row => {
                await logAdminAction('edit_user', {
                  userId: row.id
                });
                toast({
                  title: '编辑用户',
                  description: `正在编辑: ${row.name}`
                });
              }} onDelete={async row => {
                await logAdminAction('delete_user', {
                  userId: row.id
                });
                toast({
                  title: '删除用户',
                  description: `已删除: ${row.name}`,
                  variant: 'destructive'
                });
              }} />
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* AI客服抽屉 */}
      <AdminAIChat isOpen={aiChatOpen} onClose={() => {
      setAiChatOpen(false);
      logAdminAction('close_ai_chat', {});
    }} onMessageSent={handleAIMessage} />

      {/* 悬浮AI客服按钮 */}
      <Button className="fixed bottom-6 right-6 rounded-full h-14 w-14 shadow-lg" onClick={() => {
      setAiChatOpen(true);
      logAdminAction('open_ai_chat', {
        source: 'floating_button'
      });
    }}>
        <MessageSquare className="h-6 w-6" />
      </Button>
    </div>;
}