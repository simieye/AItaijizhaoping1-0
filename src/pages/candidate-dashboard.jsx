// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, useToast, Progress } from '@/components/ui';
// @ts-ignore;
import { Briefcase, Users, MessageSquare, TrendingUp, Clock, MapPin, DollarSign, Eye, Star, Filter, Search, RefreshCw, Settings, Bell, Upload } from 'lucide-react';

// @ts-ignore;
import { CandidateSidebar } from '@/components/CandidateSidebar';
// @ts-ignore;
import { CandidateHeader } from '@/components/CandidateHeader';
// @ts-ignore;
import { CandidateStats } from '@/components/CandidateStats';
// @ts-ignore;
import { JobCard } from '@/components/JobCard';
// @ts-ignore;
import { ApplicationCard } from '@/components/ApplicationCard';
// @ts-ignore;
import { ChatInterface } from '@/components/ChatInterface';
// @ts-ignore;
import { cachedCallDataSource } from '@/lib/cache';
export default function CandidateDashboard(props) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');
  const [dashboardData, setDashboardData] = useState({
    totalApplications: 0,
    pendingApplications: 0,
    interviewsScheduled: 0,
    profileCompleteness: 0,
    recommendedJobs: 0,
    savedJobs: 0,
    totalViews: 0,
    lastUpdated: new Date().toISOString()
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [recentApplications, setRecentApplications] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [filterSalary, setFilterSalary] = useState('');
  const [filterType, setFilterType] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [candidateProfile, setCandidateProfile] = useState(null);
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
      const userId = props.$w.auth.currentUser?.userId;
      if (!userId) {
        $w.utils.navigateTo({
          pageId: 'candidate-login'
        });
        return;
      }

      // 获取候选人资料
      const profileResponse = await cachedCallDataSource($w, {
        dataSourceName: 'candidate_profile',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              userId: {
                $eq: userId
              }
            }
          },
          select: {
            $master: true
          }
        }
      }, {
        forceRefresh
      });
      if (profileResponse.records && profileResponse.records.length > 0) {
        setCandidateProfile(profileResponse.records[0]);
      }

      // 获取申请数据
      const applicationsResponse = await cachedCallDataSource($w, {
        dataSourceName: 'application',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              candidateId: {
                $eq: userId
              }
            }
          },
          getCount: true
        }
      }, {
        forceRefresh
      });

      // 获取待处理申请
      const pendingApplications = await cachedCallDataSource($w, {
        dataSourceName: 'application',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              $and: [{
                candidateId: {
                  $eq: userId
                }
              }, {
                status: {
                  $in: ['pending', 'reviewing']
                }
              }]
            }
          },
          getCount: true
        }
      }, {
        forceRefresh
      });

      // 获取面试安排
      const interviewsResponse = await cachedCallDataSource($w, {
        dataSourceName: 'interview',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              candidateId: {
                $eq: userId
              },
              scheduledDate: {
                $gte: new Date().toISOString()
              }
            }
          },
          getCount: true
        }
      }, {
        forceRefresh
      });

      // 获取推荐职位
      const jobsResponse = await cachedCallDataSource($w, {
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
          orderBy: [{
            createdAt: 'desc'
          }],
          pageSize: 10
        }
      }, {
        forceRefresh
      });

      // 获取保存的职位
      const savedJobsResponse = await cachedCallDataSource($w, {
        dataSourceName: 'saved_job',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              candidateId: {
                $eq: userId
              }
            }
          },
          getCount: true
        }
      }, {
        forceRefresh
      });

      // 获取最近申请
      const recentApplicationsResponse = await cachedCallDataSource($w, {
        dataSourceName: 'application',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              candidateId: {
                $eq: userId
              }
            }
          },
          orderBy: [{
            createdAt: 'desc'
          }],
          pageSize: 5
        }
      }, {
        forceRefresh
      });

      // 计算个人资料完整度
      const profileCompleteness = calculateProfileCompleteness(profileResponse.records?.[0]);
      setDashboardData({
        totalApplications: applicationsResponse.total || 0,
        pendingApplications: pendingApplications.total || 0,
        interviewsScheduled: interviewsResponse.total || 0,
        profileCompleteness: profileCompleteness,
        recommendedJobs: jobsResponse.records?.length || 0,
        savedJobs: savedJobsResponse.total || 0,
        totalViews: profileResponse.records?.[0]?.profileViews || 0,
        lastUpdated: new Date().toISOString()
      });
      setRecommendedJobs(jobsResponse.records || []);
      setRecentApplications(recentApplicationsResponse.records || []);
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

  // 计算个人资料完整度
  const calculateProfileCompleteness = profile => {
    if (!profile) return 0;
    let completeness = 0;
    const totalFields = 8;
    let filledFields = 0;
    if (profile.name) filledFields++;
    if (profile.email) filledFields++;
    if (profile.phone) filledFields++;
    if (profile.resumeFile) filledFields++;
    if (profile.skills && profile.skills.length > 0) filledFields++;
    if (profile.experience && profile.experience.length > 0) filledFields++;
    if (profile.education && profile.education.length > 0) filledFields++;
    if (profile.location) filledFields++;
    return Math.round(filledFields / totalFields * 100);
  };

  // 获取保存的职位
  const fetchSavedJobs = async () => {
    try {
      const userId = props.$w.auth.currentUser?.userId;
      if (!userId) return;
      const response = await cachedCallDataSource($w, {
        dataSourceName: 'saved_job',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              candidateId: {
                $eq: userId
              }
            }
          },
          select: {
            $master: true
          }
        }
      });
      setSavedJobs(response.records || []);
    } catch (error) {
      console.error('获取保存职位失败:', error);
    }
  };

  // 处理搜索
  const handleSearch = query => {
    setSearchQuery(query);
    // 防抖搜索将在useEffect中处理
  };

  // 处理筛选
  const handleFilter = (type, value) => {
    switch (type) {
      case 'location':
        setFilterLocation(value);
        break;
      case 'salary':
        setFilterSalary(value);
        break;
      case 'type':
        setFilterType(value);
        break;
    }
  };

  // 处理职位申请
  const handleApplyJob = async jobId => {
    try {
      const userId = props.$w.auth.currentUser?.userId;
      if (!userId) {
        toast({
          title: '请先登录',
          description: '需要登录才能申请职位',
          variant: 'destructive'
        });
        return;
      }

      // 检查是否已申请
      const existingApplication = await cachedCallDataSource($w, {
        dataSourceName: 'application',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              $and: [{
                candidateId: {
                  $eq: userId
                }
              }, {
                jobId: {
                  $eq: jobId
                }
              }]
            }
          }
        }
      });
      if (existingApplication.records && existingApplication.records.length > 0) {
        toast({
          title: '已申请',
          description: '您已经申请过这个职位',
          variant: 'info'
        });
        return;
      }

      // 创建申请
      await cachedCallDataSource($w, {
        dataSourceName: 'application',
        methodName: 'wedaCreateV2',
        params: {
          data: {
            candidateId: userId,
            jobId: jobId,
            status: 'pending',
            appliedDate: new Date().toISOString()
          }
        }
      });
      toast({
        title: '申请成功',
        description: '职位申请已提交',
        variant: 'success'
      });

      // 刷新数据
      fetchDashboardData(true);
    } catch (error) {
      console.error('申请职位失败:', error);
      toast({
        title: '申请失败',
        description: error.message || '无法提交申请，请重试',
        variant: 'destructive'
      });
    }
  };

  // 处理保存职位
  const handleSaveJob = async jobId => {
    try {
      const userId = props.$w.auth.currentUser?.userId;
      if (!userId) return;

      // 检查是否已保存
      const existingSave = await cachedCallDataSource($w, {
        dataSourceName: 'saved_job',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              $and: [{
                candidateId: {
                  $eq: userId
                }
              }, {
                jobId: {
                  $eq: jobId
                }
              }]
            }
          }
        }
      });
      if (existingSave.records && existingSave.records.length > 0) {
        // 取消保存
        await cachedCallDataSource($w, {
          dataSourceName: 'saved_job',
          methodName: 'wedaDeleteV2',
          params: {
            filter: {
              where: {
                $and: [{
                  candidateId: {
                    $eq: userId
                  }
                }, {
                  jobId: {
                    $eq: jobId
                  }
                }]
              }
            }
          }
        });
        toast({
          title: '已取消保存',
          description: '职位已从收藏中移除',
          variant: 'info'
        });
      } else {
        // 保存职位
        await cachedCallDataSource($w, {
          dataSourceName: 'saved_job',
          methodName: 'wedaCreateV2',
          params: {
            data: {
              candidateId: userId,
              jobId: jobId,
              savedDate: new Date().toISOString()
            }
          }
        });
        toast({
          title: '保存成功',
          description: '职位已添加到收藏',
          variant: 'success'
        });
      }

      // 刷新数据
      fetchSavedJobs();
      fetchDashboardData(true);
    } catch (error) {
      console.error('保存职位失败:', error);
      toast({
        title: '操作失败',
        description: error.message || '无法完成操作，请重试',
        variant: 'destructive'
      });
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

  // 处理AI聊天
  const handleChatMessage = async message => {
    const newMessage = {
      id: Date.now(),
      type: 'user',
      content: message,
      timestamp: new Date().toISOString()
    };
    setChatMessages(prev => [...prev, newMessage]);

    // AI回复
    setTimeout(() => {
      const aiResponse = {
        id: Date.now() + 1,
        type: 'bot',
        content: getAIResponse(message),
        timestamp: new Date().toISOString()
      };
      setChatMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  // 获取AI回复
  const getAIResponse = message => {
    const responses = {
      'help': '我可以帮您：1) 搜索职位 2) 查看申请状态 3) 获取面试建议 4) 优化简历',
      'jobs': `为您找到 ${recommendedJobs.length} 个推荐职位，基于您的技能和偏好`,
      'applications': `您有 ${dashboardData.totalApplications} 个申请，其中 ${dashboardData.pendingApplications} 个待处理`,
      'interview': '面试建议：准备项目案例，了解公司文化，准备技术问题',
      'resume': '您的简历完整度为 ' + dashboardData.profileCompleteness + '%，建议完善教育背景和工作经验'
    };
    return responses[message.toLowerCase()] || '我理解您的问题，让我为您提供一些建议...';
  };

  // 初始化数据
  useEffect(() => {
    fetchDashboardData();
    fetchSavedJobs();
  }, []);

  // 监听搜索变化
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      // 搜索逻辑
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, filterLocation, filterSalary, filterType]);
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
        <CandidateSidebar isCollapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} onNavigate={handleNavigation} activeSection={activeSection} onSectionChange={setActiveSection} />

        {/* 主内容区域 */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* 顶部导航 */}
          <CandidateHeader onSearch={handleSearch} onNotificationClick={notification => {
          toast({
            title: notification.title,
            description: notification.message
          });
        }} onSettingsClick={action => {
          if (action === 'logout') {
            $w.utils.navigateTo({
              pageId: 'candidate-login'
            });
          } else {
            $w.utils.navigateTo({
              pageId: `candidate-${action}`
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
                    候选人仪表板
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    管理您的求职进程
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
              <CandidateStats data={dashboardData} onStatClick={stat => {
              console.log('点击统计:', stat);
              if (stat.type === 'applications') {
                setActiveSection('applications');
              } else if (stat.type === 'profile') {
                setActiveSection('profile');
              }
            }} />

              {/* 个人资料进度 */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>个人资料完整度</span>
                    <Badge variant="outline">{dashboardData.profileCompleteness}%</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Progress value={dashboardData.profileCompleteness} className="w-full" />
                  <p className="text-sm text-gray-600 mt-2">
                    {dashboardData.profileCompleteness < 100 ? '完善您的个人资料以获得更好的职位推荐' : '您的个人资料已完善！'}
                  </p>
                </CardContent>
              </Card>

              {/* 主要内容区域 */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 左侧：推荐职位 */}
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>推荐职位</span>
                        <Badge variant="outline">{dashboardData.recommendedJobs} 个职位</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {recommendedJobs.length > 0 ? recommendedJobs.map(job => <JobCard key={job._id} job={job} onApply={handleApplyJob} onSave={handleSaveJob} isSaved={savedJobs.some(saved => saved.jobId === job._id)} />) : <div className="text-center py-8 text-gray-500">
                            <Briefcase className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                            <p>暂无推荐职位，完善您的个人资料以获得更好的推荐</p>
                          </div>}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* 右侧：最近申请 */}
                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>最近申请</span>
                        <Badge variant="outline">{dashboardData.totalApplications} 个申请</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {recentApplications.length > 0 ? recentApplications.map(app => <ApplicationCard key={app._id} application={app} />) : <div className="text-center py-6 text-gray-500">
                            <MessageSquare className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                            <p className="text-sm">暂无申请记录</p>
                          </div>}
                      </div>
                    </CardContent>
                  </Card>

                  {/* 快速操作 */}
                  <Card className="mt-6">
                    <CardHeader>
                      <CardTitle>快速操作</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <Button variant="outline" className="w-full justify-start" onClick={() => handleNavigation('candidate-resume-upload')}>
                          <Upload className="h-4 w-4 mr-2" />
                          上传简历
                        </Button>
                        <Button variant="outline" className="w-full justify-start" onClick={() => handleNavigation('candidate-ai-interview')}>
                          <MessageSquare className="h-4 w-4 mr-2" />
                          AI面试
                        </Button>
                        <Button variant="outline" className="w-full justify-start" onClick={() => handleNavigation('candidate-community')}>
                          <Users className="h-4 w-4 mr-2" />
                          社区交流
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* AI助手按钮 */}
      <Button className="fixed bottom-6 right-6 rounded-full h-14 w-14 shadow-lg bg-blue-500 hover:bg-blue-600" onClick={() => setShowChat(!showChat)}>
        <MessageSquare className="h-6 w-6" />
      </Button>

      {/* AI聊天界面 */}
      {showChat && <div className="fixed bottom-20 right-6 w-80 h-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl border">
          <ChatInterface messages={chatMessages} onSendMessage={handleChatMessage} placeholder="询问求职相关问题..." title="AI求职助手" onClose={() => setShowChat(false)} />
        </div>}
    </div>;
}