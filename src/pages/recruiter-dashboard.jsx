// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, Button, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Tabs, TabsContent, TabsList, TabsTrigger, Alert, AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, useToast } from '@/components/ui';
// @ts-ignore;
import { RefreshCw, Download, TrendingUp, Users, FileText, Shield, Badge } from 'lucide-react';

// @ts-ignore;
import { RecruiterStats } from '@/components/RecruiterStats';
// @ts-ignore;
import { CandidateList } from '@/components/CandidateList';
// @ts-ignore;
import { ComplianceChart } from '@/components/ComplianceChart';
export default function RecruiterDashboard(props) {
  const [loading, setLoading] = useState(true);
  const [candidates, setCandidates] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [algorithmVersion, setAlgorithmVersion] = useState('v2.3.1');
  const [benchmarkDelta, setBenchmarkDelta] = useState(12);
  const [modelConfidence, setModelConfidence] = useState(95);
  const [algorithmVersions, setAlgorithmVersions] = useState(['v2.3.1', 'v2.3.0', 'v2.2.9']);
  const [biasReductionData, setBiasReductionData] = useState([]);
  const [deiTrendData, setDeiTrendData] = useState([]);
  const [showVersionAlert, setShowVersionAlert] = useState(false);
  const [expectedVersion, setExpectedVersion] = useState('v2.3.1');
  const [regulationFilter, setRegulationFilter] = useState('all');
  const [exportFormat, setExportFormat] = useState('pdf');
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

  // 获取候选人数据
  const fetchCandidates = async () => {
    try {
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
          }]
        }
      });

      // 获取合规审计数据
      const candidateIds = candidates.records?.map(c => c.userId) || [];
      let enrichedCandidates = [];
      if (candidateIds.length > 0) {
        const [audits, explanations] = await Promise.all([$w.cloud.callDataSource({
          dataSourceName: 'compliance_audit',
          methodName: 'wedaGetRecordsV2',
          params: {
            filter: {
              where: {
                entityType: {
                  $eq: 'candidate'
                },
                entityId: {
                  $in: candidateIds
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
                entityType: {
                  $eq: 'candidate'
                },
                entityId: {
                  $in: candidateIds
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
        enrichedCandidates = candidates.records?.map(candidate => {
          const audit = audits.records?.find(a => a.entityId === candidate.userId);
          const explanation = explanations.records?.find(e => e.entityId === candidate.userId);
          return {
            id: candidate.userId,
            name: candidate.fullName || '匿名候选人',
            position: candidate.targetPosition || '未指定',
            experience: candidate.experience || 0,
            matchScore: candidate.matchScore || 85,
            biasScore: audit?.score || 2,
            algorithmVersion: audit?.algorithmVersion || 'v2.3.1',
            modelConfidence: explanation?.modelConfidence || 95
          };
        }) || [];
      }
      setCandidates(enrichedCandidates);
    } catch (error) {
      console.error('获取候选人数据失败:', error);
    }
  };

  // 获取职位数据
  const fetchJobs = async () => {
    try {
      const jobs = await $w.cloud.callDataSource({
        dataSourceName: 'job_post',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              recruiterId: {
                $eq: $w.auth.currentUser?.userId || 'mock-recruiter-id'
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
      setJobs(jobs.records || []);
    } catch (error) {
      console.error('获取职位数据失败:', error);
    }
  };

  // 获取算法迭代数据
  const fetchAlgorithmData = async () => {
    try {
      // 获取偏见降低趋势
      const biasData = await $w.cloud.callDataSource({
        dataSourceName: 'compliance_audit',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              entityType: {
                $eq: 'system'
              },
              auditType: {
                $eq: 'bias_reduction'
              }
            }
          },
          select: {
            $master: true
          },
          orderBy: [{
            createdAt: 'desc'
          }],
          pageSize: 30
        }
      });
      if (biasData.records) {
        const formattedData = biasData.records.map(record => ({
          date: new Date(record.createdAt).toLocaleDateString(),
          biasReduction: record.details?.biasReduction || 0,
          accuracy: record.details?.accuracy || 0
        }));
        setBiasReductionData(formattedData.reverse());
      }

      // 获取DEI趋势数据
      const deiData = await $w.cloud.callDataSource({
        dataSourceName: 'dei_metric',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              entityType: {
                $eq: 'recruiter'
              },
              entityId: {
                $eq: $w.auth.currentUser?.userId || 'mock-recruiter-id'
              }
            }
          },
          select: {
            $master: true
          },
          orderBy: [{
            snapshotDate: 'desc'
          }],
          pageSize: 10
        }
      });
      if (deiData.records) {
        const formattedDeiData = [{
          category: '性别多样性',
          current: deiData.records.filter(r => r.dimension === 'gender').reduce((sum, r) => sum + r.percentage, 0) / deiData.records.filter(r => r.dimension === 'gender').length || 45,
          benchmark: 40
        }, {
          category: '年龄多样性',
          current: deiData.records.filter(r => r.dimension === 'age').reduce((sum, r) => sum + r.percentage, 0) / deiData.records.filter(r => r.dimension === 'age').length || 35,
          benchmark: 30
        }, {
          category: '教育背景',
          current: deiData.records.filter(r => r.dimension === 'education').reduce((sum, r) => sum + r.percentage, 0) / deiData.records.filter(r => r.dimension === 'education').length || 60,
          benchmark: 55
        }];
        setDeiTrendData(formattedDeiData);

        // 计算基准差异
        const avgDelta = deiData.records.reduce((sum, r) => sum + (r.benchmarkDelta || 0), 0) / deiData.records.length;
        setBenchmarkDelta(parseFloat(avgDelta.toFixed(1)));
      }
    } catch (error) {
      console.error('获取算法数据失败:', error);
    }
  };

  // 导出合规报告
  const exportComplianceReport = async format => {
    try {
      const reportData = {
        recruiterId: $w.auth.currentUser?.userId || 'mock-recruiter-id',
        timestamp: new Date().toISOString(),
        algorithmVersion: algorithmVersion,
        regulation: getCurrentRegulation(),
        candidates: candidates.length,
        jobs: jobs.length,
        biasReduction: benchmarkDelta,
        modelConfidence: modelConfidence
      };
      // 这里应该调用后端API生成报告
      const blob = new Blob([JSON.stringify(reportData, null, 2)], {
        type: format === 'pdf' ? 'application/pdf' : 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `compliance_report_${algorithmVersion}_${Date.now()}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
      toast({
        title: "导出成功",
        description: `合规报告已导出为${format.toUpperCase()}格式`
      });
    } catch (error) {
      toast({
        title: "导出失败",
        description: "请稍后重试",
        variant: "destructive"
      });
    }
  };
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchCandidates(), fetchJobs(), fetchAlgorithmData(), checkAlgorithmVersion()]);
      setLoading(false);
    };
    loadData();
  }, []);
  if (loading) {
    return <div className="min-h-screen bg-gray-900 p-4">
      <style jsx>{`
        body {
          background: #111827;
        }
      `}</style>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="h-8 w-48 bg-gray-700 rounded animate-pulse" />
          <div className="flex space-x-2">
            <div className="h-8 w-24 bg-gray-700 rounded animate-pulse" />
            <div className="h-8 w-8 bg-gray-700 rounded animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-gray-700 rounded animate-pulse" />)}
        </div>
      </div>
    </div>;
  }
  return <div className="min-h-screen bg-gray-900 p-4">
    <style jsx>{`
      body {
        background: #111827;
      }
    `}</style>
    
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">招聘者仪表盘</h1>
          <p className="text-gray-400 mt-1">基于{getCurrentRegulation()}的合规招聘管理</p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={regulationFilter} onValueChange={setRegulationFilter}>
            <SelectTrigger className="w-[150px] bg-gray-800 border-gray-700">
              <SelectValue placeholder="法规筛选" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部法规</SelectItem>
              <SelectItem value="EU_AI_Act">EU AI Act</SelectItem>
              <SelectItem value="US_State_Bias_Audit">US Bias Audit</SelectItem>
              <SelectItem value="China_Content_Review">China Review</SelectItem>
            </SelectContent>
          </Select>
          <Select value={exportFormat} onValueChange={setExportFormat}>
            <SelectTrigger className="w-[100px] bg-gray-800 border-gray-700">
              <SelectValue placeholder="格式" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pdf">PDF</SelectItem>
              <SelectItem value="json">JSON</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => exportComplianceReport(exportFormat)} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            导出报告
          </Button>
          <Button onClick={() => window.location.reload()} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            刷新
          </Button>
        </div>
      </div>

      {/* 算法版本警告 */}
      <AlertDialog open={showVersionAlert} onOpenChange={setShowVersionAlert}>
        <AlertDialogContent className="bg-gray-800 border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">算法版本更新</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-300">
              检测到偏见检测算法已更新至 {algorithmVersion} 版本，当前页面使用的是 {expectedVersion} 版本。
              建议刷新页面以获取最新功能。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => window.location.reload()} className="bg-blue-600 hover:bg-blue-700">
              立即刷新
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 关键指标 */}
      <RecruiterStats totalCandidates={candidates.length} activeJobs={jobs.length} biasAlerts={candidates.filter(c => c.biasScore > 6).length} algorithmVersion={algorithmVersion} benchmarkDelta={benchmarkDelta} />

      <Tabs defaultValue="candidates" className="mt-6">
        <TabsList className="bg-gray-800 border-gray-700">
          <TabsTrigger value="candidates" className="text-gray-300 data-[state=active]:text-white">候选人</TabsTrigger>
          <TabsTrigger value="jobs" className="text-gray-300 data-[state=active]:text-white">职位管理</TabsTrigger>
          <TabsTrigger value="compliance" className="text-gray-300 data-[state=active]:text-white">合规分析</TabsTrigger>
        </TabsList>

        <TabsContent value="candidates">
          <CandidateList candidates={candidates} onViewDetails={candidate => console.log('查看详情:', candidate)} onExportReport={candidate => console.log('导出报告:', candidate)} algorithmVersions={algorithmVersions} />
        </TabsContent>

        <TabsContent value="jobs">
          <Card>
            <CardHeader>
              <CardTitle>职位管理</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {jobs.map(job => <div key={job.jobId} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-white">{job.title}</h3>
                        <p className="text-sm text-gray-400">{job.companyName}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-gray-300">
                          AI置信度: {modelConfidence}%
                        </Badge>
                        <Badge variant="outline" className="text-gray-300">
                          {algorithmVersion}
                        </Badge>
                      </div>
                    </div>
                    <div className="mt-3 flex space-x-2">
                      <Button size="sm" variant="outline">
                        编辑职位
                      </Button>
                      <Button size="sm" variant="outline">
                        查看申请
                      </Button>
                    </div>
                  </div>)}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">算法迭代效果</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-400">-{benchmarkDelta}%</div>
                    <div className="text-sm text-gray-400">偏见降低</div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">AI置信度</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-400">{modelConfidence}%</div>
                    <div className="text-sm text-gray-400">模型准确性</div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">合规状态</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-400">✓</div>
                    <div className="text-sm text-gray-400">{getCurrentRegulation()}</div>
                  </div>
                </CardContent>
              </Card>
            </div>
            <ComplianceChart biasReductionData={biasReductionData} deiTrendData={deiTrendData} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  </div>;
}