// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Avatar, AvatarFallback, AvatarImage, Progress, useToast } from '@/components/ui';
// @ts-ignore;
import { Briefcase, TrendingUp, Clock, MapPin, DollarSign, Users, RefreshCw, AlertCircle } from 'lucide-react';

// @ts-ignore;
import { RadarChartComponent } from '@/components/RadarChart';
// @ts-ignore;
import { DEIRadarChart } from '@/components/DEIRadarChart';
export default function CandidateDashboard(props) {
  const [candidateData, setCandidateData] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const {
    toast
  } = useToast();
  const {
    $w
  } = props;

  // 获取候选人数据
  const fetchCandidateData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 获取当前用户信息
      const currentUser = $w.auth.currentUser;
      if (!currentUser) {
        throw new Error('用户未登录');
      }

      // 获取候选人档案
      const profile = await $w.cloud.callDataSource({
        dataSourceName: 'candidate_profile',
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
        throw new Error('未找到候选人档案');
      }

      // 获取申请记录
      const apps = await $w.cloud.callDataSource({
        dataSourceName: 'application',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              candidateId: {
                $eq: currentUser.userId
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

      // 获取相关职位信息
      const jobIds = apps.records?.map(app => app.jobId) || [];
      let jobs = [];
      if (jobIds.length > 0) {
        const jobData = await $w.cloud.callDataSource({
          dataSourceName: 'job_post',
          methodName: 'wedaGetRecordsV2',
          params: {
            filter: {
              where: {
                jobId: {
                  $in: jobIds
                }
              }
            },
            select: {
              $master: true
            }
          }
        });
        jobs = jobData.records || [];
      }

      // 组合数据
      const enrichedApplications = apps.records?.map(app => {
        const job = jobs.find(j => j.jobId === app.jobId);
        return {
          ...app,
          jobTitle: job?.title || '未知职位',
          company: job?.location || '未知公司',
          salary: job?.salaryRange || '面议'
        };
      }) || [];
      setCandidateData(profile);
      setApplications(enrichedApplications);
    } catch (err) {
      console.error('获取候选人数据失败:', err);
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
    fetchCandidateData();
  };

  // 刷新数据
  const handleRefresh = () => {
    fetchCandidateData();
    toast({
      title: "刷新成功",
      description: "数据已更新"
    });
  };
  useEffect(() => {
    fetchCandidateData();
  }, [retryCount]);

  // 格式化日期
  const formatDate = dateString => {
    return new Date(dateString).toLocaleDateString('zh-CN');
  };

  // 获取状态颜色
  const getStatusColor = status => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      screening: 'bg-blue-100 text-blue-800',
      interview: 'bg-purple-100 text-purple-800',
      rejected: 'bg-red-100 text-red-800',
      hired: 'bg-green-100 text-green-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  // 获取状态文本
  const getStatusText = status => {
    const texts = {
      pending: '待处理',
      screening: '筛选中',
      interview: '面试中',
      rejected: '已拒绝',
      hired: '已录用'
    };
    return texts[status] || status;
  };

  // 计算匹配度
  const calculateMatchRate = () => {
    if (!applications.length) return 0;
    const total = applications.length;
    const matched = applications.filter(app => app.status === 'hired' || app.status === 'interview').length;
    return Math.round(matched / total * 100);
  };

  // 计算平均响应时间
  const calculateAvgResponseTime = () => {
    if (!applications.length) return 0;
    // 模拟计算
    return Math.floor(Math.random() * 5) + 2;
  };
  if (loading) {
    return <div className="min-h-screen bg-gray-50 p-4">
        <style jsx>{`
          body {
            background: #f9fafb;
          }
        `}</style>
        
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">候选人仪表板</h1>
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
        
        <div className="max-w-6xl mx-auto">
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
  if (!candidateData) {
    return <div className="min-h-screen bg-gray-50 p-4">
        <style jsx>{`
          body {
            background: #f9fafb;
          }
        `}</style>
        
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">暂无候选人档案</h2>
            <p className="text-gray-600 mb-4">请先完善您的候选人档案</p>
            <Button onClick={() => $w.utils.navigateTo({
            pageId: 'candidate-resume-upload'
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
      
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">候选人仪表板</h1>
            <p className="text-gray-600">欢迎回来，{candidateData.fullName || '候选人'}</p>
          </div>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            刷新
          </Button>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">总申请数</p>
                  <p className="text-2xl font-bold">{applications.length}</p>
                </div>
                <Briefcase className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">匹配成功率</p>
                  <p className="text-2xl font-bold">{calculateMatchRate()}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">平均响应</p>
                  <p className="text-2xl font-bold">{calculateAvgResponseTime()}天</p>
                </div>
                <Clock className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">多样性评分</p>
                  <p className="text-2xl font-bold">{candidateData.diversityScore || 85}</p>
                </div>
                <Users className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧：个人信息和技能 */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>个人信息</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4 mb-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={candidateData.avatarUrl} />
                    <AvatarFallback>{candidateData.fullName?.charAt(0) || 'C'}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{candidateData.fullName}</h3>
                    <p className="text-sm text-gray-600">{candidateData.targetPosition || '求职中'}</p>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">经验年限</span>
                    <span>{candidateData.experience || 0}年</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">期望薪资</span>
                    <span>{candidateData.expectedSalary || '面议'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">工作地点</span>
                    <span>{candidateData.location || '不限'}</span>
                  </div>
                </div>

                <div className="mt-4">
                  <h4 className="font-medium mb-2">技能标签</h4>
                  <div className="flex flex-wrap gap-1">
                    {(candidateData.skills || []).map(skill => <Badge key={skill} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>)}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>能力评估</CardTitle>
              </CardHeader>
              <CardContent>
                <RadarChartComponent height={250} />
              </CardContent>
            </Card>
          </div>

          {/* 右侧：申请记录 */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>申请记录</CardTitle>
              </CardHeader>
              <CardContent>
                {applications.length === 0 ? <div className="text-center py-8">
                    <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">暂无申请记录</p>
                    <Button onClick={() => $w.utils.navigateTo({
                  pageId: 'candidate-community'
                })} className="mt-4">
                      浏览职位
                    </Button>
                  </div> : <div className="space-y-4">
                    {applications.map(app => <div key={app.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold">{app.jobTitle}</h4>
                            <p className="text-sm text-gray-600">{app.company}</p>
                            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                              <span className="flex items-center">
                                <MapPin className="h-3 w-3 mr-1" />
                                {app.company}
                              </span>
                              <span className="flex items-center">
                                <DollarSign className="h-3 w-3 mr-1" />
                                {app.salary}
                              </span>
                              <span className="flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                {formatDate(app.createdAt)}
                              </span>
                            </div>
                          </div>
                          <Badge className={getStatusColor(app.status)}>
                            {getStatusText(app.status)}
                          </Badge>
                        </div>

                        {app.status === 'interview' && <div className="mt-3">
                            <div className="flex justify-between items-center text-sm">
                              <span>面试进度</span>
                              <span>75%</span>
                            </div>
                            <Progress value={75} className="h-2 mt-1" />
                          </div>}
                      </div>)}
                  </div>}
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>DEI 多样性指标</CardTitle>
              </CardHeader>
              <CardContent>
                <DEIRadarChart height={300} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>;
}