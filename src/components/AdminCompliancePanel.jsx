// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Progress, Alert, AlertDescription, AlertTitle, useToast } from '@/components/ui';
// @ts-ignore;
import { Shield, AlertTriangle, CheckCircle, Download, RefreshCw, TrendingUp, Clock } from 'lucide-react';

// @ts-ignore;
import { ComplianceChart } from '@/components/ComplianceChart';
export function AdminCompliancePanel({
  className = '',
  onGenerateReport,
  onViewDetails
}) {
  const [complianceData, setComplianceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generatingReport, setGeneratingReport] = useState(false);
  const {
    toast
  } = useToast();

  // 模拟合规数据
  useEffect(() => {
    const loadComplianceData = async () => {
      try {
        setLoading(true);
        // 模拟API调用
        setTimeout(() => {
          setComplianceData({
            overallScore: 94,
            riskLevel: 'low',
            totalAudits: 156,
            passedAudits: 147,
            failedAudits: 3,
            warningAudits: 6,
            lastUpdated: new Date().toISOString(),
            recentAlerts: [{
              id: 1,
              type: 'bias',
              title: '职位描述偏见检测',
              description: '检测到3个职位存在潜在性别偏见',
              severity: 'medium',
              timestamp: new Date(Date.now() - 3600000).toISOString()
            }, {
              id: 2,
              type: 'privacy',
              title: '数据访问异常',
              description: '发现1个异常的数据访问请求',
              severity: 'low',
              timestamp: new Date(Date.now() - 7200000).toISOString()
            }, {
              id: 3,
              type: 'algorithm',
              title: 'AI决策透明度',
              description: '2个AI推荐结��缺乏充分解释',
              severity: 'medium',
              timestamp: new Date(Date.now() - 10800000).toISOString()
            }],
            trends: [{
              month: '1月',
              score: 89
            }, {
              month: '2月',
              score: 91
            }, {
              month: '3月',
              score: 92
            }, {
              month: '4月',
              score: 94
            }, {
              month: '5月',
              score: 94
            }, {
              month: '6月',
              score: 94
            }]
          });
          setLoading(false);
        }, 1000);
      } catch (error) {
        toast({
          title: '加载失败',
          description: '无法加载合规数据',
          variant: 'destructive'
        });
        setLoading(false);
      }
    };
    loadComplianceData();
  }, []);
  const handleGenerateReport = async () => {
    setGeneratingReport(true);
    try {
      // 模拟报告生成
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast({
        title: '报告生成成功',
        description: '合规审计报告已生成，可下载查看'
      });
      onGenerateReport?.();
    } catch (error) {
      toast({
        title: '生成失败',
        description: '无法生成合规报告',
        variant: 'destructive'
      });
    } finally {
      setGeneratingReport(false);
    }
  };
  const getSeverityColor = severity => {
    switch (severity) {
      case 'high':
        return 'text-red-600 bg-red-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'low':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };
  const getSeverityIcon = severity => {
    switch (severity) {
      case 'high':
        return <AlertTriangle className="h-4 w-4" />;
      case 'medium':
        return <AlertTriangle className="h-4 w-4" />;
      case 'low':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Shield className="h-4 w-4" />;
    }
  };
  const formatTime = timestamp => {
    const now = new Date();
    const alertTime = new Date(timestamp);
    const diff = now - alertTime;
    if (diff < 3600000) {
      return `${Math.floor(diff / 60000)}分钟前`;
    } else if (diff < 86400000) {
      return `${Math.floor(diff / 3600000)}小时前`;
    } else {
      return new Date(timestamp).toLocaleDateString('zh-CN');
    }
  };
  if (loading) {
    return <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            合规审计
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-gray-500">加载合规数据中...</div>
        </CardContent>
      </Card>;
  }
  return <div className={className}>
      {/* 合规概览 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              合规审计概览
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={handleGenerateReport} disabled={generatingReport}>
                {generatingReport ? <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    生成中...
                  </> : <>
                    <Download className="h-4 w-4 mr-2" />
                    生成报告
                  </>}
              </Button>
              <Button variant="outline" size="sm" onClick={() => onViewDetails?.()}>
                查看详情
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 合规评分 */}
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{complianceData.overallScore}%</div>
              <p className="text-sm text-gray-600">总体合规评分</p>
              <Progress value={complianceData.overallScore} className="mt-2" />
            </div>

            {/* 审计统计 */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">总审计数</span>
                <span className="font-semibold">{complianceData.totalAudits}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">通过</span>
                <span className="font-semibold text-green-600">{complianceData.passedAudits}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">警告</span>
                <span className="font-semibold text-yellow-600">{complianceData.warningAudits}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">失败</span>
                <span className="font-semibold text-red-600">{complianceData.failedAudits}</span>
              </div>
            </div>

            {/* 趋势图 */}
            <div>
              <ComplianceChart type="overview" height={150} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 最近警报 */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            最近警报
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {complianceData.recentAlerts.map(alert => <Alert key={alert.id} className="border-l-4">
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-full ${getSeverityColor(alert.severity)}`}>
                    {getSeverityIcon(alert.severity)}
                  </div>
                  <div className="flex-1">
                    <AlertTitle className="text-sm font-semibold">{alert.title}</AlertTitle>
                    <AlertDescription className="text-sm">{alert.description}</AlertDescription>
                    <div className="flex items-center justify-between mt-2">
                      <Badge variant="outline" className="text-xs">
                        {formatTime(alert.timestamp)}
                      </Badge>
                      <Button variant="ghost" size="sm" className="text-xs" onClick={() => onViewDetails?.(alert)}>
                        查看详情
                      </Button>
                    </div>
                  </div>
                </div>
              </Alert>)}
          </div>
        </CardContent>
      </Card>
    </div>;
}