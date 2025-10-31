// @ts-ignore;
import React, { useState, useEffect, useCallback } from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Progress, useToast } from '@/components/ui';
// @ts-ignore;
import { Users, Briefcase, TrendingUp, MessageSquare, DollarSign, Clock, Eye, RefreshCw } from 'lucide-react';

// @ts-ignore;
import { RecruiterStats } from '@/components/RecruiterStats';
// @ts-ignore;
import { JobList } from '@/components/JobList';
// @ts-ignore;
import { CandidateMatches } from '@/components/CandidateMatches';
// @ts-ignore;
import { cachedCallDataSource, debounce } from '@/lib/cache';
// @ts-ignore;
import { RecruiterAIChat } from '@/components/RecruiterAIChat';
export default function RecruiterDashboard(props) {
  const [recruiterData, setRecruiterData] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiChatOpen, setAiChatOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [cacheStats, setCacheStats] = useState({
    hitRate: 0,
    totalRequests: 0,
    cacheHits: 0
  });
  const {
    toast
  } = useToast();
  const {
    $w
  } = props;

  // 防抖刷新函数
  const debouncedRefresh = useCallback(debounce(async () => {
    await fetchRecruiterData(true);
  }, 300), []);

  // 获取招聘者数据（带缓存）
  const fetchRecruiterData = async (forceRefresh = false) => {
    try {
      setLoading(true);
      setRefreshing(true);

      // 获取招聘者档案
      const recruiter = await cachedCallDataSource($w, {
        dataSourceName: 'recruiter_profile',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              email: {
                $eq: 'recruiter@example.com'
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

      // 获取职位列表（带缓存）
      const jobsResponse = await cachedCallDataSource($w, {
        dataSourceName: 'job_post',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              recruiterId: {
                $eq: 'recruiter_demo'
              }
            }
          },
          orderBy: [{
            createdAt: 'desc'
          }]
        }
      }, {
        forceRefresh
      });

      // 获取候选人列表（带缓存）
      const candidatesResponse = await cachedCallDataSource($w, {
        dataSourceName: 'candidate_profile',
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
            matchScore: 'desc'
          }],
          pageSize: 10
        }
      }, {
        forceRefresh
      });

      // 获取申请记录（带缓存）
      const applicationsResponse = await cachedCallDataSource($w, {
        dataSourceName: 'application',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              recruiterId: {
                $eq: 'recruiter_demo'
              }
            }
          },
          orderBy: [{
            createdAt: 'desc'
          }]
        }
      }, {
        forceRefresh
      });
      setRecruiterData(recruiter.records?.[0] || {
        name: '张招聘者',
        email: 'recruiter@example.com',
        company: '示例公司',
        position: '高级招聘经理'
      });
      setJobs(jobsResponse.records || []);
      setCandidates(candidatesResponse.records || []);
      setApplications(applicationsResponse.records || []);

      // 更新缓存统计
      updateCacheStats();
    } catch (error) {
      console.error('获取数据失败:', error);
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

  // 更新缓存统计
  const updateCacheStats = () => {
    setCacheStats(prev => ({
      ...prev,
      totalRequests: prev.totalRequests + 1
    }));
  };

  // 计算统计数据
  const stats = {
    totalJobs: jobs.length,
    activeJobs: jobs.filter(job => job.status === 'active').length,
    totalApplications: applications.length,
    pendingApplications: applications.filter(app => app.status === 'pending').length,
    acceptedApplications: applications.filter(app => app.status === 'accepted').length,
    averageMatchScore: candidates.length > 0 ? Math.round(candidates.reduce((sum, candidate) => sum + (candidate.matchScore || 0), 0) / candidates.length) : 0
  };

  // 防抖搜索候选人
  const debouncedSearchCandidates = useCallback(debounce(async searchTerm => {
    if (!searchTerm.trim()) {
      await fetchRecruiterData(true);
      return;
    }
    const response = await cachedCallDataSource($w, {
      dataSourceName: 'candidate_profile',
      methodName: 'wedaGetRecordsV2',
      params: {
        filter: {
          where: {
            $or: [{
              name: {
                $search: searchTerm
              }
            }, {
              skills: {
                $search: searchTerm
              }
            }, {
              targetPosition: {
                $search: searchTerm
              }
            }]
          }
        },
        orderBy: [{
          matchScore: 'desc'
        }],
        pageSize: 10
      }
    });
    setCandidates(response.records || []);
  }, 300), []);

  // 防抖搜索职位
  const debouncedSearchJobs = useCallback(debounce(async searchTerm => {
    if (!searchTerm.trim()) {
      await fetchRecruiterData(true);
      return;
    }
    const response = await cachedCallDataSource($w, {
      dataSourceName: 'job_post',
      methodName: 'wedaGetRecordsV2',
      params: {
        filter: {
          where: {
            $or: [{
              title: {
                $search: searchTerm
              }
            }, {
              description: {
                $search: searchTerm
              }
            }, {
              location: {
                $search: searchTerm
              }
            }]
          }
        },
        orderBy: [{
          createdAt: 'desc'
        }]
      }
    });
    setJobs(response.records || []);
  }, 300), []);

  // 处理刷新
  const handleRefresh = async () => {
    await fetchRecruiterData(true);
    toast({
      title: '数据已刷新',
      description: '所有数据已从服务器重新获取'
    });
  };

  // 处理搜索
  const handleSearch = (type, searchTerm) => {
    if (type === 'candidates') {
      debouncedSearchCandidates(searchTerm);
    } else if (type === 'jobs') {
      debouncedSearchJobs(searchTerm);
    }
  };
  useEffect(() => {
    fetchRecruiterData();
  }, []);
  if (loading) {
    return <div className="min-h-screen bg-gray-50 py-8">
        <style jsx>{`
          body {
            background: #f9fafb;
          }
        `}</style>
        
        <div className="max-w-7xl mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3, 4].map(i => <Card key={i} className="h-32 bg-gray-200"></Card>)}
            </div>
          </div>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-gray-50 py-8">
      <style jsx>{`
        body {
          background: #f9fafb;
        }
      `}</style>
      
      <div className="max-w-7xl mx-auto px-4">
        {/* 缓存状态指示器 */}
        <div className="mb-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            缓存命中率: {cacheStats.hitRate}% | 总请求: {cacheStats.totalRequests}
          </div>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? '刷新中...' : '刷新数据'}
          </Button>
        </div>

        {/* 欢迎区域 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            欢迎回来，{recruiterData?.name || '招聘者'}！
          </h1>
          <p className="text-gray-600">
            {recruiterData?.company || '示例公司'} - {recruiterData?.position || '招聘经理'}
          </p>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">总职位数</p>
                  <p className="text-2xl font-bold">{stats.totalJobs}</p>
                </div>
                <Briefcase className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">活跃职位</p>
                  <p className="text-2xl font-bold">{stats.activeJobs}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">总申请</p>
                  <p className="text-2xl font-bold">{stats.totalApplications}</p>
                </div>
                <Users className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">平均匹配度</p>
                  <p className="text-2xl font-bold">{stats.averageMatchScore}%</p>
                </div>
                <DollarSign className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 主要内容区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左侧：职位管理 */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>我的职位</span>
                  <Button size="sm" onClick={() => props.$w.utils.navigateTo({
                  pageId: 'recruiter-job-post'
                })}>
                    发布新职位
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <JobList jobs={jobs} onSearch={handleSearch} onViewDetails={job => {
                console.log('查看职位详情:', job);
              }} onEdit={job => {
                console.log('编辑职位:', job);
              }} />
              </CardContent>
            </Card>
          </div>
          
          {/* 右侧：候选人推荐 */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>候选人推荐</CardTitle>
              </CardHeader>
              <CardContent>
                <CandidateMatches candidates={candidates} onSearch={handleSearch} onViewProfile={candidate => {
                console.log('查看候选人档案:', candidate);
              }} onContact={candidate => {
                console.log('联系候选人:', candidate);
              }} />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 申请追踪 */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>申请追踪</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {applications.slice(0, 5).map(app => <div key={app._id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{app.candidateName || '候选人'}</p>
                      <p className="text-sm text-gray-600">{app.jobTitle || '职位'}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={app.status === 'pending' ? 'warning' : app.status === 'accepted' ? 'success' : 'secondary'}>
                        {app.status || '待处理'}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>)}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* AI客服按钮 */}
      <Button className="fixed bottom-6 right-6 rounded-full h-14 w-14 shadow-lg bg-blue-500 hover:bg-blue-600" onClick={() => setAiChatOpen(true)}>
        <MessageSquare className="h-6 w-6" />
      </Button>

      {/* AI客服抽屉 */}
      <RecruiterAIChat isOpen={aiChatOpen} onClose={() => setAiChatOpen(false)} userId={recruiterData?.email || 'recruiter_dashboard'} userName={recruiterData?.name || '招聘者'} onMessageSent={(userMsg, botMsg) => {
      console.log('招聘者仪表板AI对话:', {
        user: userMsg,
        bot: botMsg
      });
    }} />
    </div>;
}