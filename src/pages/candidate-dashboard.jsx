// @ts-ignore;
import React, { useState, useEffect, useCallback } from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Progress, useToast } from '@/components/ui';
// @ts-ignore;
import { Briefcase, Users, TrendingUp, MessageSquare, Clock, MapPin, DollarSign, RefreshCw } from 'lucide-react';

// @ts-ignore;
import { CandidateAIChat } from '@/components/CandidateAIChat';
// @ts-ignore;
import { cachedCallDataSource, debounce } from '@/lib/cache';
export default function CandidateDashboard(props) {
  const [candidateData, setCandidateData] = useState(null);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
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
    await fetchCandidateData(true);
  }, 300), []);

  // 获取候选人数据（带缓存）
  const fetchCandidateData = async (forceRefresh = false) => {
    try {
      setLoading(true);
      setRefreshing(true);

      // 获取候选人档案
      const candidate = await cachedCallDataSource($w, {
        dataSourceName: 'candidate_profile',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              email: {
                $eq: 'candidate@example.com'
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

      // 获取推荐职位（带缓存）
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

      // 获取申请记录（带缓存）
      const applicationsResponse = await cachedCallDataSource($w, {
        dataSourceName: 'application',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              candidateId: {
                $eq: 'candidate_demo'
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
      setCandidateData(candidate.records?.[0] || {
        name: '李候选人',
        email: 'candidate@example.com',
        targetPosition: '前端开发工程师',
        matchScore: 85,
        diversityScore: 92
      });
      setRecommendedJobs(jobsResponse.records || []);
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
    totalApplications: applications.length,
    pendingApplications: applications.filter(app => app.status === 'pending').length,
    acceptedApplications: applications.filter(app => app.status === 'accepted').length,
    matchScore: candidateData?.matchScore || 85,
    diversityScore: candidateData?.diversityScore || 92
  };

  // 防抖搜索职位
  const debouncedSearchJobs = useCallback(debounce(async searchTerm => {
    if (!searchTerm.trim()) {
      await fetchCandidateData(true);
      return;
    }
    const response = await cachedCallDataSource($w, {
      dataSourceName: 'job_post',
      methodName: 'wedaGetRecordsV2',
      params: {
        filter: {
          where: {
            $and: [{
              status: {
                $eq: 'active'
              }
            }, {
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
            }]
          }
        },
        orderBy: [{
          createdAt: 'desc'
        }],
        pageSize: 10
      }
    });
    setRecommendedJobs(response.records || []);
  }, 300), []);

  // 防抖搜索申请
  const debouncedSearchApplications = useCallback(debounce(async searchTerm => {
    if (!searchTerm.trim()) {
      await fetchCandidateData(true);
      return;
    }
    const response = await cachedCallDataSource($w, {
      dataSourceName: 'application',
      methodName: 'wedaGetRecordsV2',
      params: {
        filter: {
          where: {
            $and: [{
              candidateId: {
                $eq: 'candidate_demo'
              }
            }, {
              $or: [{
                jobTitle: {
                  $search: searchTerm
                }
              }, {
                companyName: {
                  $search: searchTerm
                }
              }]
            }]
          }
        },
        orderBy: [{
          createdAt: 'desc'
        }]
      }
    });
    setApplications(response.records || []);
  }, 300), []);

  // 处理刷新
  const handleRefresh = async () => {
    await fetchCandidateData(true);
    toast({
      title: '数据已刷新',
      description: '所有数据已从服务器重新获取'
    });
  };

  // 处理搜索
  const handleSearch = (type, searchTerm) => {
    if (type === 'jobs') {
      debouncedSearchJobs(searchTerm);
    } else if (type === 'applications') {
      debouncedSearchApplications(searchTerm);
    }
  };
  useEffect(() => {
    fetchCandidateData();
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
            欢迎回来，{candidateData?.name || '候选人'}！
          </h1>
          <p className="text-gray-600">
            目标职位: {candidateData?.targetPosition || '前端开发工程师'}
          </p>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">总申请</p>
                  <p className="text-2xl font-bold">{stats.totalApplications}</p>
                </div>
                <Briefcase className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">待处理</p>
                  <p className="text-2xl font-bold">{stats.pendingApplications}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">已接受</p>
                  <p className="text-2xl font-bold">{stats.acceptedApplications}</p>
                </div>
                <Users className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">匹配度</p>
                  <p className="text-2xl font-bold">{stats.matchScore}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 主要内容区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左侧：推荐职位 */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>推荐职位</span>
                  <Button size="sm" onClick={() => props.$w.utils.navigateTo({
                  pageId: 'candidate-job-search'
                })}>
                    搜索更多
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recommendedJobs.map(job => <div key={job._id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold">{job.title || '职位标题'}</h3>
                          <p className="text-sm text-gray-600">{job.company || '公司名称'}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{job.location || '地点'}</span>
                            <DollarSign className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{job.salary || '薪资面议'}</span>
                          </div>
                        </div>
                        <Badge variant="secondary">{job.matchScore || 85}% 匹配</Badge>
                      </div>
                      <div className="mt-3">
                        <Button size="sm" variant="outline">查看详情</Button>
                      </div>
                    </div>)}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* 右侧：申请状态 */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>申请状态</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {applications.slice(0, 5).map(app => <div key={app._id} className="border rounded-lg p-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-sm">{app.jobTitle || '职位'}</p>
                          <p className="text-xs text-gray-600">{app.companyName || '公司'}</p>
                        </div>
                        <Badge variant={app.status === 'pending' ? 'warning' : app.status === 'accepted' ? 'success' : 'secondary'}>
                          {app.status || '待处理'}
                        </Badge>
                      </div>
                      <div className="mt-2">
                        <Progress value={app.progress || 0} className="h-2" />
                      </div>
                    </div>)}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* AI客服按钮 */}
      <Button className="fixed bottom-6 right-6 rounded-full h-14 w-14 shadow-lg bg-blue-500 hover:bg-blue-600" onClick={() => setAiChatOpen(true)}>
        <MessageSquare className="h-6 w-6" />
      </Button>

      {/* AI客服抽屉 */}
      <CandidateAIChat isOpen={aiChatOpen} onClose={() => setAiChatOpen(false)} userId={candidateData?.email || 'candidate_dashboard'} userName={candidateData?.name || '候选人'} onMessageSent={(userMsg, botMsg) => {
      console.log('候选人仪表板AI对话:', {
        user: userMsg,
        bot: botMsg
      });
    }} />
    </div>;
}