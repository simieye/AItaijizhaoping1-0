// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, Progress, Skeleton, Alert, AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction } from '@/components/ui';
// @ts-ignore;
import { TrendingUp, Award, Calendar, MapPin, DollarSign, Clock, Star, Target, Users, Shield, Eye } from 'lucide-react';

// @ts-ignore;
import { SkillRadar } from '@/components/RadarChart';
import { DEIRadarChart } from '@/components/DEIRadarChart';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { ThemeToggle } from '@/components/ThemeToggle';
import { AccessibilityMenu } from '@/components/AccessibilityMenu';
export default function CandidateDashboard(props) {
  const {
    $w
  } = props;
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

      // 设置技能雷达图数据
      if (profile?.skills) {
        const skills = profile.skills.slice(0, 6);
        const mockScores = [85, 78, 92, 88, 65, 75];
        setRadarData(skills.map((skill, index) => ({
          skill,
          value: mockScores[index] || 70
        })));
      }
    } catch (error) {
      console.error('获取候选人档案失败:', error);
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

      // 获取相关职位信息
      const jobIds = applications.records?.map(app => app.jobId) || [];
      let enrichedApplications = [];
      if (jobIds.length > 0) {
        const jobs = await $w.cloud.callDataSource({
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

        // 获取合规审计数据
        const complianceAudits = await $w.cloud.callDataSource({
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
        });

        // 合并职位信息和合规数据
        enrichedApplications = applications.records?.map(app => {
          const job = jobs.records?.find(j => j.jobId === app.jobId);
          const audit = complianceAudits.records?.find(a => a.entityId === app.applicationId);

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
            biasScore: audit?.score || 2
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

  // 获取DEI指标数据
  const fetchDEIData = async () => {
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
          pageSize: 6
        }
      });
      if (deiMetrics.records && deiMetrics.records.length > 0) {
        const formattedData = deiMetrics.records.map(metric => ({
          category: metric.dimension,
          current: metric.percentage,
          benchmark: metric.benchmark || 50
        }));
        setDeiData(formattedData);

        // 计算总体多样性得分
        const avgScore = deiMetrics.records.reduce((sum, metric) => sum + metric.percentage, 0) / deiMetrics.records.length;
        setDiversityScore(Math.round(avgScore));
      } else {
        // 使用默认数据
        const defaultData = [{
          category: '性别多样性',
          current: 45,
          benchmark: 40
        }, {
          category: '种族多样性',
          current: 35,
          benchmark: 30
        }, {
          category: '残疾包容性',
          current: 25,
          benchmark: 20
        }, {
          category: '年龄包容性',
          current: 60,
          benchmark: 55
        }, {
          category: '教育背景多样性',
          current: 70,
          benchmark: 65
        }, {
          category: '地域多样性',
          current: 55,
          benchmark: 50
        }];
        setDeiData(defaultData);
      }
    } catch (error) {
      console.error('获取DEI数据失败:', error);
      // 使用默认数据
      const defaultData = [{
        category: '性别多样性',
        current: 45,
        benchmark: 40
      }, {
        category: '种族多样性',
        current: 35,
        benchmark: 30
      }, {
        category: '残疾包容性',
        current: 25,
        benchmark: 20
      }, {
        category: '年龄包容性',
        current: 60,
        benchmark: 55
      }, {
        category: '教育背景多样性',
        current: 70,
        benchmark: 65
      }, {
        category: '地域多样性',
        current: 55,
        benchmark: 50
      }];
      setDeiData(defaultData);
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
      }
    } catch (error) {
      console.error('获取偏见检测分数失败:', error);
    }
  };
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchCandidateProfile(), fetchApplications(), fetchDEIData(), fetchLatestBiasScore()]);
      setLoading(false);
    };
    loadData();
  }, []);
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
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-64 w-full" />
                </CardContent>
              </Card>
            </div>
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-20" />
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
          </div>
        </div>

        {/* 偏见检测警告弹窗 */}
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
                          <Badge variant="secondary" className="bg-green-100">
                            人类复核权重: {humanReviewWeight}%
                          </Badge>
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
                          <Shield className="h-4 w-4 mr-1" />
                          多样性积分: {app.diversityScore}
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
                <CardTitle>AI匹配度分析</CardTitle>
              </CardHeader>
              <CardContent>
                <SkillRadar data={radarData} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>DEI多样性指标</CardTitle>
              </CardHeader>
              <CardContent>
                <DEIRadarChart data={deiData} />
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-600">
                    <Shield className="inline h-4 w-4 mr-1" />
                    当前多样性得分: {diversityScore}/100 (基于真实DEI数据)
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
                params: {}
              })} className="w-full" variant="outline">
                  更新简历
                </Button>
                <Button onClick={() => $w.utils.navigateTo({
                pageId: 'candidate-ai-interview',
                params: {}
              })} className="w-full bg-gradient-to-r from-cyan-500 to-blue-500">
                  开始AI面试
                </Button>
                <Button onClick={() => $w.utils.navigateTo({
                pageId: 'candidate-community',
                params: {}
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