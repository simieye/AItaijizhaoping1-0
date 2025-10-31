// @ts-ignore;
import React, { useState, useEffect, useCallback } from 'react';
// @ts-ignore;
import { Button, Card, CardContent, CardHeader, CardTitle, useToast, Badge } from '@/components/ui';
// @ts-ignore;
import { Plus, Search, Filter, TrendingUp, Users, Briefcase, MessageSquare, RefreshCw } from 'lucide-react';

// @ts-ignore;
import { RecruiterSidebar } from '@/components/RecruiterSidebar';
// @ts-ignore;
import { RecruiterHeader } from '@/components/RecruiterHeader';
// @ts-ignore;
import { RecruiterStats } from '@/components/RecruiterStats';
// @ts-ignore;
import { CandidateList } from '@/components/CandidateList';
// @ts-ignore;
import { RecruiterAIChat } from '@/components/RecruiterAIChat';
// @ts-ignore;
import { cachedCallDataSource } from '@/lib/cache';
export default function RecruiterDashboard(props) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [aiChatOpen, setAiChatOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    newApplications: 0,
    totalCandidates: 0,
    newCandidates: 0,
    totalMessages: 0,
    unreadMessages: 0,
    todayViews: 0,
    weekViews: 0,
    monthViews: 0,
    lastUpdated: new Date().toISOString()
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');
  const [jobList, setJobList] = useState([]);
  const [candidateList, setCandidateList] = useState([]);
  const [recentApplications, setRecentApplications] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0
  });
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
      const recruiterId = props.$w.auth.currentUser?.userId || 'demo_recruiter';
      const [jobs, applications, candidates, messages, views] = await Promise.all([
      // 获取职位数据
      cachedCallDataSource($w, {
        dataSourceName: 'job_post',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              recruiterId: {
                $eq: recruiterId
              }
            }
          },
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
          filter: {
            where: {
              recruiterId: {
                $eq: recruiterId
              }
            }
          },
          getCount: true
        }
      }, {
        forceRefresh
      }),
      // 获取候选人数据
      cachedCallDataSource($w, {
        dataSourceName: 'candidate_profile',
        methodName: 'wedaGetRecordsV2',
        params: {
          getCount: true
        }
      }, {
        forceRefresh
      }),
      // 获取消息数据
      cachedCallDataSource($w, {
        dataSourceName: 'chat_message',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              recipientId: {
                $eq: recruiterId
              }
            }
          },
          getCount: true
        }
      }, {
        forceRefresh
      }),
      // 获取视图数据（模拟）
      Promise.resolve({
        today: 45,
        week: 312,
        month: 1248
      })]);

      // 获取活跃职位
      const activeJobs = await cachedCallDataSource($w, {
        dataSourceName: 'job_post',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              $and: [{
                recruiterId: {
                  $eq: recruiterId
                }
              }, {
                status: {
                  $eq: 'active'
                }
              }]
            }
          },
          getCount: true
        }
      }, {
        forceRefresh
      });

      // 获取新申请
      const newApplications = await cachedCallDataSource($w, {
        dataSourceName: 'application',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              $and: [{
                recruiterId: {
                  $eq: recruiterId
                }
              }, {
                createdAt: {
                  $gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
                }
              }]
            }
          },
          getCount: true
        }
      }, {
        forceRefresh
      });

      // 获取新候选人
      const newCandidates = await cachedCallDataSource($w, {
        dataSourceName: 'candidate_profile',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              createdAt: {
                $gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
              }
            }
          },
          getCount: true
        }
      }, {
        forceRefresh
      });

      // 获取未读消息
      const unreadMessages = await cachedCallDataSource($w, {
        dataSourceName: 'chat_message',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              $and: [{
                recipientId: {
                  $eq: recruiterId
                }
              }, {
                isRead: {
                  $eq: false
                }
              }]
            }
          },
          getCount: true
        }
      }, {
        forceRefresh
      });
      setDashboardData({
        totalJobs: jobs.total || 0,
        activeJobs: activeJobs.total || 0,
        totalApplications: applications.total || 0,
        newApplications: newApplications.total || 0,
        totalCandidates: candidates.total || 0,
        newCandidates: newCandidates.total || 0,
        totalMessages: messages.total || 0,
        unreadMessages: unreadMessages.total || 0,
        todayViews: views.today,
        weekViews: views.week,
        monthViews: views.month,
        lastUpdated: new Date().toISOString()
      });
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

  // 获取职位列表
  const fetchJobList = async (forceRefresh = false) => {
    try {
      const recruiterId = props.$w.auth.currentUser?.userId || 'demo_recruiter';
      const response = await cachedCallDataSource($w, {
        dataSourceName: 'job_post',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              recruiterId: {
                $eq: recruiterId
              }
            }
          },
          orderBy: [{
            [sortBy]: sortOrder
          }],
          pageSize: pagination.pageSize,
          pageNumber: pagination.page,
          select: {
            $master: true
          }
        }
      }, {
        forceRefresh
      });
      setJobList(response.records || []);
      setPagination(prev => ({
        ...prev,
        total: response.total || 0
      }));
    } catch (error) {
      console.error('获取职位列表失败:', error);
      toast({
        title: '获取职位列表失败',
        description: error.message || '无法加载职位数据',
        variant: 'destructive'
      });
      setJobList([]);
    }
  };

  // 获取候选人列表
  const fetchCandidateList = async (forceRefresh = false) => {
    try {
      const response = await cachedCallDataSource($w, {
        dataSourceName: 'candidate_profile',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: searchQuery ? {
              $or: [{
                name: {
                  $search: searchQuery
                }
              }, {
                email: {
                  $search: searchQuery
                }
              }]
            } : {}
          },
          orderBy: [{
            createdAt: 'desc'
          }],
          pageSize: 10,
          select: {
            $master: true
          }
        }
      }, {
        forceRefresh
      });
      setCandidateList(response.records || []);
    } catch (error) {
      console.error('获取候选人列表失败:', error);
      toast({
        title: '获取候选人列表失败',
        description: error.message || '无法加载候选人数据',
        variant: 'destructive'
      });
      setCandidateList([]);
    }
  };

  // 获取最近申请
  const fetchRecentApplications = async (forceRefresh = false) => {
    try {
      const recruiterId = props.$w.auth.currentUser?.userId || 'demo_recruiter';
      const response = await cachedCallDataSource($w, {
        dataSourceName: 'application',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              recruiterId: {
                $eq: recruiterId
              }
            }
          },
          orderBy: [{
            createdAt: 'desc'
          }],
          pageSize: 5,
          select: {
            $master: true
          }
        }
      }, {
        forceRefresh
      });
      setRecentApplications(response.records || []);
    } catch (error) {
      console.error('获取最近申请失败:', error);
      setRecentApplications([]);
    }
  };

  // 处理搜索
  const handleSearch = query => {
    setSearchQuery(query);
    // 防抖搜索将在useEffect中处理
  };

  // 处理筛选
  const handleFilter = status => {
    setFilterStatus(status);
    setPagination(prev => ({
      ...prev,
      page: 1
    }));
  };

  // 处理排序
  const handleSort = (field, order) => {
    setSortBy(field);
    setSortOrder(order);
  };

  // 处理分页
  const handlePageChange = page => {
    setPagination(prev => ({
      ...prev,
      page
    }));
  };

  // 处理刷新
  const handleRefresh = async () => {
    await fetchDashboardData(true);
    await fetchJobList(true);
    await fetchCandidateList(true);
    await fetchRecentApplications(true);
  };

  // 处理导航
  const handleNavigation = (pageId, params = {}) => {
    $w.utils.navigateTo({
      pageId,
      params
    });
  };

  // 处理创建职位
  const handleCreateJob = () => {
    handleNavigation('recruiter-job-post');
  };

  // 处理查看候选人详情
  const handleViewCandidate = candidateId => {
    handleNavigation('recruiter-candidate-detail', {
      candidateId
    });
  };

  // 处理查看职位详情
  const handleViewJob = jobId => {
    handleNavigation('recruiter-job-detail', {
      jobId
    });
  };

  // 初始化数据
  useEffect(() => {
    fetchDashboardData();
    fetchJobList();
    fetchCandidateList();
    fetchRecentApplications();
  }, []);

  // 监听分页变化
  useEffect(() => {
    fetchJobList();
  }, [pagination.page, sortBy, sortOrder]);

  // 监听搜索变化
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchCandidateList();
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);
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
        <RecruiterSidebar isCollapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} onNavigate={handleNavigation} activeSection={activeSection} onSectionChange={setActiveSection} />

        {/* 主内容区域 */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* 顶部导航 */}
          <RecruiterHeader onSearch={handleSearch} onNotificationClick={notification => {
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
              pageId: `recruiter-${action}`
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
                    招聘者仪表板
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    管理您的职位和候选人
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" onClick={handleRefresh}>
                    <RefreshCw className={`h-4 w-4 mr-2`} />
                    刷新
                  </Button>
                  <Button onClick={handleCreateJob}>
                    <Plus className="h-4 w-4 mr-2" />
                    发布职位
                  </Button>
                </div>
              </div>

              {/* 统计卡片 */}
              <RecruiterStats data={dashboardData} onStatClick={stat => {
              console.log('点击统计:', stat);
              if (stat.type === 'jobs') {
                setActiveSection('jobs');
              } else if (stat.type === 'candidates') {
                setActiveSection('candidates');
              }
            }} />

              {/* 主要内容区域 */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                {/* 左侧：职位列表 */}
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>我的职位</span>
                        <Badge variant="outline">{dashboardData.activeJobs} 个活跃</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {jobList.length > 0 ? jobList.map(job => <div key={job._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleViewJob(job._id)}>
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-semibold text-lg">{job.title}</h3>
                                <p className="text-sm text-gray-600">{job.location}</p>
                                <p className="text-sm text-gray-500">{job.salary}</p>
                              </div>
                              <div className="text-right">
                                <Badge variant={job.status === 'active' ? 'success' : 'secondary'}>
                                  {job.status === 'active' ? '招聘中' : '已关闭'}
                                </Badge>
                                <p className="text-sm text-gray-500 mt-1">
                                  {job.applicationCount || 0} 个申请
                                </p>
                              </div>
                            </div>
                          </div>) : <div className="text-center py-8 text-gray-500">
                          <Briefcase className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                          <p>暂无职位，立即发布您的第一个职位吧！</p>
                        </div>}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* 右侧：候选人列表 */}
                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>最新候选人</span>
                        <Badge variant="outline">{dashboardData.totalCandidates} 位</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CandidateList candidates={candidateList} onCandidateClick={handleViewCandidate} />
                    </CardContent>
                  </Card>

                  {/* 最近申请 */}
                  <Card className="mt-6">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>最近申请</span>
                        <Badge variant="outline">{dashboardData.newApplications} 个新申请</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {recentApplications.length > 0 ? recentApplications.map(app => <div key={app._id} className="flex items-center space-x-3 p-3 border rounded-lg">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <Users className="h-5 w-5 text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">{app.candidateName || '匿名候选人'}</p>
                              <p className="text-sm text-gray-600">{app.jobTitle || '职位申请'}</p>
                            </div>
                            <Badge variant="outline">{app.status || '待处理'}</Badge>
                          </div>) : <div className="text-center py-6 text-gray-500">
                          <MessageSquare className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                          <p className="text-sm">暂无新申请</p>
                        </div>}
                      </div>
                    </CardContent>
                  </Card>
                </div>
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
      <RecruiterAIChat isOpen={aiChatOpen} onClose={() => setAiChatOpen(false)} userId={props.$w.auth.currentUser?.userId || 'recruiter_demo'} userName={props.$w.auth.currentUser?.name || '招聘者'} />
    </div>;
}