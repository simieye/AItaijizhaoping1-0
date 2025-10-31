// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, Progress, Skeleton, Alert, AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, useToast } from '@/components/ui';
// @ts-ignore;
import { TrendingUp, Award, Calendar, MapPin, DollarSign, Clock, Star, Target, Users, Shield, Eye, Info, RefreshCw } from 'lucide-react';

// @ts-ignore;
import { SkillRadar } from '@/components/RadarChart';
// @ts-ignore;
import { DEIRadarChart } from '@/components/DEIRadarChart';
// @ts-ignore;
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
// @ts-ignore;
import { ThemeToggle } from '@/components/ThemeToggle';
// @ts-ignore;
import { AccessibilityMenu } from '@/components/AccessibilityMenu';
export default function CandidateDashboard(props) {
  const [loading, setLoading] = useState(true);
  const [candidateProfile, setCandidateProfile] = useState(null);
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState({
    applications: 0,
    interviews: 0,
    badges: 0,
    points: 0
  });
  const [radarData, setRadarData] = useState([]);
  const [deiData, setDeiData] = useState([]);
  const [humanReviewWeight, setHumanReviewWeight] = useState(70);
  const [fontSize, setFontSize] = useState(16);
  const [colorBlindMode, setColorBlindMode] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [language, setLanguage] = useState('zh');
  const [diversityScore, setDiversityScore] = useState(85);
  const [biasAlert, setBiasAlert] = useState(null);
  const [showBiasModal, setShowBiasModal] = useState(false);
  const [deiTimeRange, setDeiTimeRange] = useState('month');
  const [deiHistory, setDeiHistory] = useState([]);
  const [algorithmVersion, setAlgorithmVersion] = useState('v2.3.1');
  const [benchmarkDelta, setBenchmarkDelta] = useState(5.2);
  const [modelConfidence, setModelConfidence] = useState(92);
  const [regulationVersion, setRegulationVersion] = useState('EU_AI_Act_2025_v3');
  const [showVersionAlert, setShowVersionAlert] = useState(false);
  const [expectedVersion, setExpectedVersion] = useState('v2.3.1');
  const {
    toast
  } = useToast();
  const {
    $w
  } = props;

  // 获取当前法规
  const getCurrentRegulation = () => {
    const region = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (region.includes('Europe')) return 'EU_AI_Act';
    if (region.includes('America')) return 'US_State_Bias_Audit';
    if (region.includes('Asia/Shanghai')) return 'China_Content_Review';
    return 'EU_AI_Act';
  };

  // 检查算法版本
  const checkAlgorithmVersion = async () => {
    try {
      const latestAudit = await $w.cloud.callDataSource({
        dataSourceName: 'compliance_audit',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              entityType: {
                $eq: 'system'
              },
              auditType: {
                $eq: 'algorithm_version'
              }
            }
          },
          select: {
            $master: true
          },
          orderBy: [{
            createdAt: 'desc'
          }],
          pageSize: 1
        }
      });
      if (latestAudit.records && latestAudit.records.length > 0) {
        const latestVersion = latestAudit.records[0].algorithmVersion;
        if (latestVersion !== expectedVersion) {
          setShowVersionAlert(true);
          setAlgorithmVersion(latestVersion);
          toast({
            title: "算法已更新",
            description: `检测到新版本 ${latestVersion}，建议刷新页面获取最新功能`,
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      console.error('检查算法版本失败:', error);
    }
  };

  // 获取候选人档案
  const fetchCandidateProfile = async () => {
    try {
      const profile = await $w.cloud.callDataSource({
        dataSourceName: 'candidate_profile',
        methodName: 'wedaGetItemV2',
        params: {
          filter: {
            where: {
              userId: {
                $eq: $w.auth.currentUser?.userId || 'mock-user-id'
              }
            }
          },
          select: {
            $master: true
          }
        }
      });
      setCandidateProfile(profile);
    } catch (error) {
      console.error('获取候选人档案失败:', error);
    }
  };

  // 获取DEI历史数据
  const fetchDEIHistory = async () => {
    try {
      const deiMetrics = await $w.cloud.callDataSource({
        dataSourceName: 'dei_metric',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              entityType: {
                $eq: 'candidate'
              },
              entityId: {
                $eq: $w.auth.currentUser?.userId || 'mock-user-id'
              }
            }
          },
          select: {
            $master: true
          },
          orderBy: [{
            snapshotDate: 'desc'
          }],
          pageSize: 30
        }
      });
      if (deiMetrics.records && deiMetrics.records.length > 0) {
        // 按时间范围筛选
        const now = new Date();
        const filteredData = deiMetrics.records.filter(metric => {
          const metricDate = new Date(metric.snapshotDate);
          const daysDiff = (now - metricDate) / (1000 * 60 * 60 * 24);
          switch (deiTimeRange) {
            case 'week':
              return daysDiff <= 7;
            case 'month':
              return daysDiff <= 30;
            case 'quarter':
              return daysDiff <= 90;
            default:
              return true;
          }
        });
        setDeiHistory(filteredData);

        // 计算多样性得分和基准差异
        if (filteredData.length > 0) {
          const avgScore = filteredData.reduce((sum, metric) => sum + metric.percentage, 0) / filteredData.length;
          const avgBenchmarkDelta = filteredData.reduce((sum, metric) => sum + (metric.benchmarkDelta || 0), 0) / filteredData.length;
          setDiversityScore(Math.round(avgScore));
          setBenchmarkDelta(parseFloat(avgBenchmarkDelta.toFixed(1)));
        }
      }
    } catch (error) {
      console.error('获取DEI历史数据失败:', error);
    }
  };

  // 获取申请记录
  const fetchApplications = async () => {
    try {
      const applications = await $w.cloud.callDataSource({
        dataSourceName: 'application',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              candidateId: {
                $eq: $w.auth.currentUser?.userId || 'mock-user-id'
              }
            }
          },
          select: {
            $master: true
          },
          orderBy: [{
            appliedAt: 'desc'
          }]
        }
      });

      // 获取相关职位信息和合规数据
      const jobIds = applications.records?.map(app => app.jobId) || [];
      let enrichedApplications = [];
      if (jobIds.length > 0) {
        const [jobs, complianceAudits, aiExplanations] = await Promise.all([$w.cloud.callDataSource({
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
        }), $w.cloud.callDataSource({
          dataSourceName: 'compliance_audit',
          methodName: 'wedaGetRecordsV2',
          params: {
            filter: {
              where: {
                entityType: {
                  $eq: 'application'
                },
                entityId: {
                  $in: applications.records?.map(app => app.applicationId) || []
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
        }), $w.cloud.callDataSource({
          dataSourceName: 'ai_explanation',
          methodName: 'wedaGetRecordsV2',
          params: {
            filter: {
              where: {
                applicationId: {
                  $in: applications.records?.map(app => app.applicationId) || []
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
        })]);
        enrichedApplications = applications.records?.map(app => {
          const job = jobs.records?.find(j => j.jobId === app.jobId);
          const audit = complianceAudits.records?.find(a => a.entityId === app.applicationId);
          const explanation = aiExplanations.records?.find(e => e.applicationId === app.applicationId);

          // 计算多样性积分
          const diversityPoints = job?.diversityScore ? Math.round(job.diversityScore * 0.15) : 0;

          // 检查偏见风险
          if (audit && audit.score > 5) {
            setBiasAlert({
              applicationId: app.applicationId,
              score: audit.score,
              details: audit.details
            });
            setShowBiasModal(true);
          }
          return {
            ...app,
            company: job?.companyName || '未知公司',
            position: job?.title || '未知职位',
            salary: job?.salaryRange || '薪资面议',
            location: job?.location || '地点不限',
            diversityScore: job?.diversityScore || 85,
            biasScore: audit?.score || 2,
            diversityPoints: diversityPoints,
            algorithmVersion: audit?.algorithmVersion || 'v2.3.1',
            modelConfidence: explanation?.modelConfidence || 92
          };
        }) || [];
      }
      setApplications(enrichedApplications);
      setStats({
        applications: applications.total || 0,
        interviews: applications.records?.filter(app => app.status === 'interview' || app.status === 'screening').length || 0,
        badges: 12,
        points: 2850
      });
    } catch (error) {
      console.error('获取申请记录失败:', error);
    }
  };

  // 获取最新偏见检测分数
  const fetchLatestBiasScore = async () => {
    try {
      const audit = await $w.cloud.callDataSource({
        dataSourceName: 'compliance_audit',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              entityType: {
                $eq: 'candidate'
              },
              entityId: {
                $eq: $w.auth.currentUser?.userId || 'mock-user-id'
              },
              auditType: {
                $eq: 'bias_risk'
              }
            }
          },
          select: {
            $master: true
          },
          orderBy: [{
            createdAt: 'desc'
          }],
          pageSize: 1
        }
      });
      if (audit.records && audit.records.length > 0) {
        const latestAudit = audit.records[0];
        if (latestAudit.score > 5) {
          setBiasAlert({
            score: latestAudit.score,
            details: latestAudit.details
          });
          setShowBiasModal(true);
        }
        setAlgorithmVersion(latestAudit.algorithmVersion || 'v2.3.1');
      }
    } catch (error) {
      console.error('获取偏见检测分数失败:', error);
    }
  };

  // 获取授权版本
  const fetchConsentVersion = async () => {
    try {
      const consent = await $w.cloud.callDataSource({
        dataSourceName: 'consent_log',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              userId: {
                $eq: $w.auth.currentUser?.userId || 'mock-user-id'
              },
              consentType: {
                $eq: 'dashboard_access'
              }
            }
          },
          select: {
            $master: true
          },
          orderBy: [{
            createdAt: 'desc'
          }],
          pageSize: 1
        }
      });
      if (consent.records && consent.records.length > 0) {
        setRegulationVersion(consent.records[0].regulationVersion || 'EU_AI_Act_2025_v3');
      }
    } catch (error) {
      console.error('获取授权版本失败:', error);
    }
  };
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchCandidateProfile(), fetchApplications(), fetchDEIHistory(), fetchLatestBiasScore(), fetchConsentVersion(), checkAlgorithmVersion()]);
      setLoading(false);
    };
    loadData();
  }, []);
  useEffect(() => {
    fetchDEIHistory();
  }, [deiTimeRange]);
  const mockBadges = [{
    name: '代码达人',
    icon: Target,
    color: 'text-blue-500'
  }, {
    name: '算法高手',
    icon: TrendingUp,
    color: 'text-green-500'
  }, {
    name: '团队之星',
    icon: Users,
    color: 'text-purple-500'
  }, {
    name: '学习先锋',
    icon: Award,
    color: 'text-yellow-500'
  }];
  const mockStats = [{
    label: '投递次数',
    value: stats.applications,
    icon: Target
  }, {
    label: '面试邀请',
    value: stats.interviews,
    icon: Calendar
  }, {
    label: '获得徽章',
    value: stats.badges,
    icon: Award
  }, {
    label: '社区积分',
    value: stats.points,
    icon: Star
  }];
  if (loading) {
    return <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 p-4`}>
      <style jsx>{`
        body {
          font-size: ${fontSize}px;
        }
        ${colorBlindMode ? `
          * {
            filter: hue-rotate(15deg) saturate(0.8);
          }
        ` : ''}
      `}</style>

      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-8 w-48" />
          <div className="flex items-center space-x-2">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map(i => <Card key={i}>
            <CardHeader className="pb-3">
              <Skeleton className="h-4 w-20" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>)}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>;
  }
  return <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 p-4`}>
    <style jsx>{`
      body {
        font-size: ${fontSize}px;
      }
      ${colorBlindMode ? `
        * {
          filter: hue-rotate(15deg) saturate(0.8);
        }
      ` : ''}
    `}</style>

    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">
            个人仪表盘
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            欢迎回来，{candidateProfile?.fullName || '求职者'}！
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <LanguageSwitcher currentLang={language} onLanguageChange={setLanguage} />
          <ThemeToggle isDark={isDark} onToggle={() => setIsDark(!isDark)} />
          <AccessibilityMenu fontSize={fontSize} onFontSizeChange={setFontSize} colorBlindMode={colorBlindMode} onColorBlindToggle={() => setColorBlindMode(!colorBlindMode)} />
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            刷新数据
          </Button>
        </div>
      </div>

      {/* 算法版本警告 */}
      <AlertDialog open={showVersionAlert} onOpenChange={setShowVersionAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>算法版本更新</AlertDialogTitle>
            <AlertDialogDescription>
              检测到偏见检测算法已更新至 {algorithmVersion} 版本，当前页面使用的是 {expectedVersion} 版本。
              建议刷新页面以获取最新的算法功能。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => window.location.reload()}>
              立即刷新
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 偏见检测警告 */}
      <AlertDialog open={showBiasModal} onOpenChange={setShowBiasModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>偏见检测警告</AlertDialogTitle>
            <AlertDialogDescription>
              检测到您的申请存在偏见风险（{biasAlert?.score || 0}%），需要人工复核。请联系招聘方进行进一步评估。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowBiasModal(false)}>
              了解
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 合规信息展示 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              当前偏见检测算法
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Shield className="h-8 w-8 text-cyan-500" />
              <span className="text-2xl font-bold">{algorithmVersion}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              性别多样性基准差异
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <TrendingUp className="h-8 w-8 text-green-500" />
              <span className="text-2xl font-bold text-green-600">+{benchmarkDelta}%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              授权法规版本
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Info className="h-8 w-8 text-blue-500" />
              <span className="text-sm font-bold">{regulationVersion}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {mockStats.map(stat => <Card key={stat.label}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {stat.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <stat.icon className="h-8 w-8 text-cyan-500" />
              <span className="text-2xl font-bold">{stat.value}</span>
            </div>
          </CardContent>
        </Card>)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>申请进度</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {applications.length > 0 ? applications.map(app => <div key={app.applicationId} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold">{app.position}</h3>
                      <p className="text-sm text-gray-600">{app.company}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={app.status === 'interview' ? 'default' : app.status === 'screening' ? 'secondary' : 'outline'}>
                        {app.status}
                      </Badge>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Badge variant="secondary" className="bg-green-100 cursor-help">
                              AI置信度: {app.modelConfidence}%
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>根据{getCurrentRegulation()}要求，AI决策需保留{humanReviewWeight}%的人类复核权重</p>
                            <p>确保招聘过程的公平性和透明度</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {app.location}
                    </span>
                    <span className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-1" />
                      {app.salary}
                    </span>
                    <span className="flex items-center">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      匹配度 {app.matchScore || 85}%
                    </span>
                    <span className="flex items-center">
                      <Shield className="h-4 w-4 mr-1" />
                      偏见风险: {app.biasScore}%
                    </span>
                    <span className="flex items-center">
                      <Star className="h-4 w-4 mr-1" />
                      多样性积分: {app.diversityPoints}
                    </span>
                    <span className="flex items-center">
                      <Info className="h-4 w-4 mr-1" />
                      算法版本: {app.algorithmVersion}
                    </span>
                  </div>
                  
                  <div className="mt-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span>进度</span>
                      <span>{app.status === 'pending' ? 25 : app.status === 'screening' ? 50 : app.status === 'interview' ? 75 : 100}%</span>
                    </div>
                    <Progress value={app.status === 'pending' ? 25 : app.status === 'screening' ? 50 : app.status === 'interview' ? 75 : 100} />
                  </div>
                </div>) : <p className="text-center text-gray-500 py-8">暂无申请记录</p>}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>DEI多样性指标</CardTitle>
                <Select value={deiTimeRange} onValueChange={setDeiTimeRange}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week">本周</SelectItem>
                    <SelectItem value="month">本月</SelectItem>
                    <SelectItem value="quarter">本季度</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <DEIRadarChart data={deiData} />
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-600">
                  <Shield className="inline h-4 w-4 mr-1" />
                  当前多样性得分: {diversityScore}/100 (基于真实DEI数据 - {deiTimeRange})
                </p>
                <p className="text-sm text-green-600 mt-1">
                  <TrendingUp className="inline h-4 w-4 mr-1" />
                  领先行业基准: +{benchmarkDelta}%
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>社区徽章</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {mockBadges.map(badge => <div key={badge.name} className="text-center">
                  <badge.icon className={`h-12 w-12 mx-auto mb-2 ${badge.color}`} />
                  <p className="text-sm font-medium">{badge.name}</p>
                </div>)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>即将开始的面试</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {applications.filter(app => app.status === 'interview').slice(0, 2).map(app => <div key={app.applicationId} className="border rounded-lg p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{app.company}</p>
                      <p className="text-sm text-gray-600">{app.position}</p>
                    </div>
                    <Badge variant="default">今天 15:00</Badge>
                  </div>
                </div>)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>快速操作</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button onClick={() => $w.utils.navigateTo({
                pageId: 'candidate-resume-upload',
                params: {
                  regulation: getCurrentRegulation(),
                  algorithmVersion: algorithmVersion
                }
              })} className="w-full" variant="outline">
                更新简历
              </Button>
              <Button onClick={() => $w.utils.navigateTo({
                pageId: 'candidate-ai-interview',
                params: {
                  regulation: getCurrentRegulation(),
                  algorithmVersion: algorithmVersion
                }
              })} className="w-full bg-gradient-to-r from-cyan-500 to-blue-500">
                开始AI面试
              </Button>
              <Button onClick={() => $w.utils.navigateTo({
                pageId: 'candidate-community',
                params: {
                  regulation: getCurrentRegulation(),
                  algorithmVersion: algorithmVersion
                }
              })} className="w-full" variant="outline">
                社区发现
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  </div>;
}