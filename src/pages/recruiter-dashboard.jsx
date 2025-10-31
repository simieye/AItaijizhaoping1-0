// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, useToast } from '@/components/ui';
// @ts-ignore;
import { Briefcase, Users, TrendingUp, Clock, RefreshCw, AlertCircle } from 'lucide-react';

// @ts-ignore;
import { RecruiterStats } from '@/components/RecruiterStats';
// @ts-ignore;
import { CandidateList } from '@/components/CandidateList';
// @ts-ignore;
import { ComplianceChart } from '@/components/ComplianceChart';
export default function RecruiterDashboard(props) {
  const [recruiterData, setRecruiterData] = useState(null);
  const [recentJobs, setRecentJobs] = useState([]);
  const [recentCandidates, setRecentCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const {
    toast
  } = useToast();
  const {
    $w
  } = props;

  // 获取招聘者数据
  const fetchRecruiterData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 获取当前用户信息
      const currentUser = $w.auth.currentUser;
      if (!currentUser) {
        throw new Error('用户未登录');
      }

      // 获取招聘者档案
      const profile = await $w.cloud.callDataSource({
        dataSourceName: 'recruiter_profile',
        methodName: 'wedaGetItemV2',
        params: {
          filter: {
            where: {
              userId: {
                $eq: currentUser.userId
              }
            }
          },
          select: {
            $master: true
          }
        }
      });
      if (!profile) {
        throw new Error('未找到招聘者档案');
      }

      // 获取最近发布的职位
      const jobs = await $w.cloud.callDataSource({
        dataSourceName: 'job_post',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              recruiterId: {
                $eq: currentUser.userId
              }
            }
          },
          select: {
            $master: true
          },
          orderBy: [{
            createdAt: 'desc'
          }],
          pageSize: 5
        }
      });

      // 获取最近的候选人
      const candidates = await $w.cloud.callDataSource({
        dataSourceName: 'candidate_profile',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              status: {
                $in: ['active', 'screening', 'interview']
              }
            }
          },
          select: {
            $master: true
          },
          orderBy: [{
            updatedAt: 'desc'
          }],
          pageSize: 5
        }
      });

      // 获取申请记录
      const applications = await $w.cloud.callDataSource({
        dataSourceName: 'application',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              jobId: {
                $in: jobs.records?.map(job => job.jobId) || []
              }
            }
          },
          select: {
            $master: true
          },
          orderBy: [{
            createdAt: 'desc'
          }]
        }
      });

      // 组合候选人数据
      const enrichedCandidates = candidates.records?.map(candidate => {
        const candidateApps = applications.records?.filter(app => app.candidateId === candidate.userId) || [];
        return {
          ...candidate,
          applications: candidateApps.length,
          latestApplication: candidateApps[0]?.createdAt
        };
      }) || [];
      setRecruiterData(profile);
      setRecentJobs(jobs.records || []);
      setRecentCandidates(enrichedCandidates);
    } catch (err) {
      console.error('获取招聘者数据失败:', err);
      setError(err.message);
      toast({
        title: "获取数据失败",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // 重试加载
  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    fetchRecruiterData();
  };

  // 刷新数据
  const handleRefresh = () => {
    fetchRecruiterData();
    toast({
      title: "刷新成功",
      description: "数据已更新"
    });
  };
  useEffect(() => {
    fetchRecruiterData();
  }, [retryCount]);

  // 格式化日期
  const formatDate = dateString => {
    return new Date(dateString).toLocaleDateString('zh-CN');
  };

  // 获取状态颜色
  const getStatusColor = status => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      paused: 'bg-yellow-100 text-yellow-800',
      closed: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  // 获取状态文本
  const getStatusText = status => {
    const texts = {
      active: '招聘中',
      paused: '已暂停',
      closed: '已关闭'
    };
    return texts[status] || status;
  };
  if (loading) {
    return <div className="min-h-screen bg-gray-50 p-4">
        <style jsx>{`
          body {
            background: #f9fafb;
          }
        `}</style>
        
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">招聘者仪表板</h1>
            <Button variant="outline" disabled>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              加载中...
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                </CardContent>
              </Card>)}
          </div>
        </div>
      </div>;
  }
  if (error) {
    return <div className="min-h-screen bg-gray-50 p-4">
        <style jsx>{`
          body {
            background: #f9fafb;
          }
        `}</style>
        
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">加载失败</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={handleRetry} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              重试
            </Button>
          </div>
        </div>
      </div>;
  }
  if (!recruiterData) {
    return <div className="min-h-screen bg-gray-50 p-4">
        <style jsx>{`
          body {
            background: #f9fafb;
          }
        `}</style>
        
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">暂无招聘者档案</h2>
            <p className="text-gray-600 mb-4">请先完善您的招聘者档案</p>
            <Button onClick={() => $w.utils.navigateTo({
            pageId: 'recruiter-job-post'
          })}>
              创建档案
            </Button>
          </div>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-gray-50 p-4">
      <style jsx>{`
        body {
          background: #f9fafb;
        }
      `}</style>
      
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">招聘者仪表板</h1>
            <p className="text-gray-600">欢迎回来，{recruiterData.companyName || '招聘者'}</p>
          </div>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            刷新
          </Button>
        </div>

        {/* 统计概览 */}
        <RecruiterStats showCharts={true} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* 左侧：最近职位 */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>最近发布的职位</CardTitle>
                  <Button size="sm" onClick={() => $w.utils.navigateTo({
                  pageId: 'recruiter-job-post'
                })}>
                    发布新职位
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {recentJobs.length === 0 ? <div className="text-center py-8">
                    <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">暂无发布的职位</p>
                    <Button onClick={() => $w.utils.navigateTo({
                  pageId: 'recruiter-job-post'
                })} className="mt-4">
                      发布第一个职位
                    </Button>
                  </div> : <div className="space-y-4">
                    {recentJobs.map(job => <div key={job.jobId} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold">{job.title}</h4>
                            <p className="text-sm text-gray-600">{job.location}</p>
                            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                              <span>{job.salaryRange || '面议'}</span>
                              <span>{formatDate(job.createdAt)}</span>
                            </div>
                          </div>
                          <Badge className={getStatusColor(job.status)}>
                            {getStatusText(job.status)}
                          </Badge>
                        </div>
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-sm">
                            <span>技能要求</span>
                            <span>{(job.skills || []).length}个技能</span>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {(job.skills || []).slice(0, 3).map(skill => <Badge key={skill} variant="outline" className="text-xs">
                                {skill}
                              </Badge>)}
                            {(job.skills || []).length > 3 && <Badge variant="outline" className="text-xs">
                                +{(job.skills || []).length - 3}
                              </Badge>}
                          </div>
                        </div>
                      </div>)}
                  </div>}
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>合规分析</CardTitle>
              </CardHeader>
              <CardContent>
                <ComplianceChart type="overview" />
              </CardContent>
            </Card>
          </div>

          {/* 右侧：最近候选人 */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>最近候选人</CardTitle>
              </CardHeader>
              <CardContent>
                <CandidateList candidates={recentCandidates} compact={true} onCandidateSelect={candidate => {
                $w.utils.navigateTo({
                  pageId: 'recruiter-candidates',
                  params: {
                    candidateId: candidate.userId
                  }
                });
              }} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>;
}