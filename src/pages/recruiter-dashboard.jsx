// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Progress, Skeleton } from '@/components/ui';
// @ts-ignore;
import { TrendingUp, Users, FileText, Shield, Download, Calendar, Clock, AlertTriangle, CheckCircle } from 'lucide-react';

// @ts-ignore;
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { ThemeToggle } from '@/components/ThemeToggle';
import { AccessibilityMenu } from '@/components/AccessibilityMenu';
export default function RecruiterDashboard(props) {
  const {
    $w
  } = props;
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalCandidates: 0,
    interviewsScheduled: 0,
    complianceScore: 95,
    diversityScore: 82
  });
  const [recentJobs, setRecentJobs] = useState([]);
  const [complianceAlerts, setComplianceAlerts] = useState([]);
  const [fontSize, setFontSize] = useState(16);
  const [colorBlindMode, setColorBlindMode] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [language, setLanguage] = useState('zh');

  // 模拟数据
  const mockStats = {
    totalJobs: 15,
    activeJobs: 8,
    totalCandidates: 234,
    interviewsScheduled: 12,
    complianceScore: 95,
    diversityScore: 82
  };
  const mockJobs = [{
    id: '1',
    title: '高级前端工程师',
    company: '科技巨头',
    candidates: 45,
    interviews: 8,
    status: 'active',
    biasScore: 2,
    diversityScore: 85
  }, {
    id: '2',
    title: '全栈开发工程师',
    company: '创新企业',
    candidates: 32,
    interviews: 5,
    status: 'active',
    biasScore: 3,
    diversityScore: 78
  }, {
    id: '3',
    title: '数据科学家',
    company: 'AI独角兽',
    candidates: 28,
    interviews: 3,
    status: 'active',
    biasScore: 1,
    diversityScore: 92
  }];
  const mockComplianceAlerts = [{
    id: 1,
    type: 'warning',
    title: '偏见检测提醒',
    description: '职位描述中检测到潜在偏见词汇',
    action: '立即修正',
    severity: 'medium'
  }, {
    id: 2,
    type: 'info',
    title: '合规审计到期',
    description: 'EU AI Act年度审计即将到期',
    action: '安排审计',
    severity: 'low'
  }, {
    id: 3,
    type: 'success',
    title: '多样性目标达成',
    description: '本月多样性招聘目标已超额完成',
    action: '查看报告',
    severity: 'low'
  }];
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      // 模拟数据加载
      setTimeout(() => {
        setStats(mockStats);
        setRecentJobs(mockJobs);
        setComplianceAlerts(mockComplianceAlerts);
        setLoading(false);
      }, 1000);
    };
    loadData();
  }, []);
  const handleExportComplianceReport = async type => {
    const report = {
      type,
      generatedAt: new Date(),
      recruiterId: $w.auth.currentUser?.userId || 'mock-recruiter-id',
      compliance: {
        euAIAct: true,
        gdpr: true,
        chinaPIPL: true,
        usStateBiasAudit: true
      },
      metrics: {
        totalJobs: stats.totalJobs,
        activeJobs: stats.activeJobs,
        totalCandidates: stats.totalCandidates,
        complianceScore: stats.complianceScore,
        diversityScore: stats.diversityScore
      }
    };
    console.log(`导出${type}合规报告:`, report);
    alert(`${type}合规报告已生成！`);
  };
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
          <Skeleton className="h-8 w-48 mb-6" />
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
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">
            招聘者仪表盘（合规版）
          </h1>
          <div className="flex items-center space-x-2">
            <LanguageSwitcher currentLang={language} onLanguageChange={setLanguage} />
            <ThemeToggle isDark={isDark} onToggle={() => setIsDark(!isDark)} />
            <AccessibilityMenu fontSize={fontSize} onFontSizeChange={setFontSize} colorBlindMode={colorBlindMode} onColorBlindToggle={() => setColorBlindMode(!colorBlindMode)} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                总职位数
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <FileText className="h-8 w-8 text-cyan-500" />
                <span className="text-2xl font-bold">{stats.totalJobs}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                活跃职位
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <TrendingUp className="h-8 w-8 text-green-500" />
                <span className="text-2xl font-bold">{stats.activeJobs}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                总候选人
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Users className="h-8 w-8 text-purple-500" />
                <span className="text-2xl font-bold">{stats.totalCandidates}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                面试安排
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Calendar className="h-8 w-8 text-orange-500" />
                <span className="text-2xl font-bold">{stats.interviewsScheduled}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>最近发布的职位</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentJobs.map(job => <div key={job.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold">{job.title}</h3>
                          <p className="text-sm text-gray-600">{job.company}</p>
                        </div>
                        <Badge variant={job.status === 'active' ? 'default' : 'secondary'}>
                          {job.status}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>{job.candidates} 位候选人</span>
                        <span>{job.interviews} 场面试</span>
                        <Badge variant="secondary" className="bg-green-100">
                          多样性: {job.diversityScore}
                        </Badge>
                        <Badge variant={job.biasScore <= 3 ? "default" : "destructive"}>
                          偏见风险: {job.biasScore}/10
                        </Badge>
                      </div>
                      
                      <div className="mt-3">
                        <div className="flex justify-between text-sm mb-1">
                          <span>招聘进度</span>
                          <span>{Math.round(job.interviews / job.candidates * 100)}%</span>
                        </div>
                        <Progress value={job.interviews / job.candidates * 100} />
                      </div>
                    </div>)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>合规审计模块</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">整体合规评分</span>
                    <Badge variant="default">{stats.complianceScore}/100</Badge>
                  </div>
                  <Progress value={stats.complianceScore} />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">多样性招聘评分</span>
                    <Badge variant="default">{stats.diversityScore}/100</Badge>
                  </div>
                  <Progress value={stats.diversityScore} />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <Button variant="outline" onClick={() => handleExportComplianceReport('EU AI Act')} className="w-full">
                      <Shield className="h-4 w-4 mr-2" />
                      导出EU AI Act报告
                    </Button>
                    <Button variant="outline" onClick={() => handleExportComplianceReport('GDPR')} className="w-full">
                      <Shield className="h-4 w-4 mr-2" />
                      导出GDPR报告
                    </Button>
                    <Button variant="outline" onClick={() => handleExportComplianceReport('中国PIPL')} className="w-full">
                      <Shield className="h-4 w-4 mr-2" />
                      导出中国PIPL报告
                    </Button>
                    <Button variant="outline" onClick={() => handleExportComplianceReport('US州级审计')} className="w-full">
                      <Shield className="h-4 w-4 mr-2" />
                      导出US州级审计报告
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>合规提醒</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {complianceAlerts.map(alert => <div key={alert.id} className={`p-3 rounded-lg border-l-4 ${alert.type === 'warning' ? 'border-yellow-500 bg-yellow-50' : alert.type === 'error' ? 'border-red-500 bg-red-50' : 'border-green-500 bg-green-50'}`}>
                      <div className="flex items-start">
                        {alert.type === 'warning' ? <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" /> : alert.type === 'error' ? <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" /> : <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />}
                        <div className="ml-2">
                          <h4 className="font-medium text-sm">{alert.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{alert.description}</p>
                          <Button size="sm" variant="outline" className="mt-2">
                            {alert.action}
                          </Button>
                        </div>
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
                pageId: 'recruiter-job-post',
                params: {}
              })} className="w-full bg-gradient-to-r from-cyan-500 to-blue-500">
                  发布新职位
                </Button>
                <Button onClick={() => $w.utils.navigateTo({
                pageId: 'recruiter-candidates',
                params: {}
              })} variant="outline" className="w-full">
                  查看候选人
                </Button>
                <Button onClick={() => $w.utils.navigateTo({
                pageId: 'recruiter-communication',
                params: {}
              })} variant="outline" className="w-full">
                  候选人沟通
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>合规统计</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">EU AI Act合规</span>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">GDPR数据保护</span>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">中国PIPL合规</span>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">US州级偏见审计</span>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>;
}