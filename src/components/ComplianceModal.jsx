// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, Button, Badge, Card, CardContent, useToast } from '@/components/ui';
// @ts-ignore;
import { Shield, CheckCircle, AlertCircle, XCircle, Loader2 } from 'lucide-react';

export function ComplianceModal({
  open,
  onOpenChange,
  jobData = {},
  regulation = 'EU_AI_Act',
  className = ''
}) {
  const [complianceResults, setComplianceResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const {
    toast
  } = useToast();
  useEffect(() => {
    if (open && jobData) {
      checkCompliance();
    }
  }, [open, jobData]);
  const checkCompliance = async () => {
    setLoading(true);
    setError(null);
    try {
      // 模拟合规检查
      setTimeout(() => {
        const results = {
          overall: Math.random() > 0.3 ? 'compliant' : 'warning',
          checks: [{
            name: '偏见检测',
            status: Math.random() > 0.2 ? 'pass' : 'warning',
            score: Math.floor(Math.random() * 30) + 70,
            description: '检测职位描述中的潜在偏见'
          }, {
            name: '隐私合规',
            status: Math.random() > 0.1 ? 'pass' : 'fail',
            score: Math.floor(Math.random() * 20) + 80,
            description: '确保符合GDPR等隐私法规'
          }, {
            name: '算法透明度',
            status: Math.random() > 0.15 ? 'pass' : 'warning',
            score: Math.floor(Math.random() * 25) + 75,
            description: 'AI决策过程的可解释性'
          }, {
            name: '公平性评估',
            status: Math.random() > 0.2 ? 'pass' : 'warning',
            score: Math.floor(Math.random() * 20) + 80,
            description: '确保招聘过程的公平性'
          }],
          recommendations: ['建议使用更中性的职位描述语言', '增加算法决策的透明度说明', '定期审查招聘流程的公平性']
        };
        setComplianceResults(results);
        setLoading(false);
      }, 1500);
    } catch (err) {
      setError(err.message);
      setLoading(false);
      toast({
        title: "合规检查失败",
        description: "无法完成合规检查，请稍后重试",
        variant: "destructive"
      });
    }
  };
  const getStatusIcon = status => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'fail':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };
  const getStatusBadge = status => {
    switch (status) {
      case 'pass':
        return <Badge variant="default" className="bg-green-500">通过</Badge>;
      case 'warning':
        return <Badge variant="secondary" className="bg-yellow-500">警告</Badge>;
      case 'fail':
        return <Badge variant="destructive">失败</Badge>;
      default:
        return null;
    }
  };
  if (!open) return null;
  return <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`${className} max-w-2xl`}>
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            合规性检查报告
          </DialogTitle>
          <DialogDescription>
            基于 {regulation} 的AI招聘合规性评估
          </DialogDescription>
        </DialogHeader>

        {loading && <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">正在检查合规性...</span>
          </div>}

        {error && <div className="text-center py-8">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600">{error}</p>
          </div>}

        {complianceResults && !loading && !error && <div className="space-y-4">
            {/* 总体状态 */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">总体合规状态</h3>
                    <p className="text-sm text-gray-600">基于当前法规的评估结果</p>
                  </div>
                  {complianceResults.overall === 'compliant' ? <Badge className="bg-green-500">合规</Badge> : <Badge variant="secondary" className="bg-yellow-500">需要关注</Badge>}
                </div>
              </CardContent>
            </Card>

            {/* 详细检查项 */}
            <div className="space-y-3">
              <h3 className="font-semibold">详细检查项</h3>
              {complianceResults.checks.map((check, index) => <Card key={index}>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(check.status)}
                        <div>
                          <p className="font-medium">{check.name}</p>
                          <p className="text-sm text-gray-600">{check.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">{check.score}%</span>
                        {getStatusBadge(check.status)}
                      </div>
                    </div>
                  </CardContent>
                </Card>)}
            </div>

            {/* 建议 */}
            {complianceResults.recommendations.length > 0 && <div className="space-y-3">
                <h3 className="font-semibold">改进建议</h3>
                <ul className="space-y-2">
                  {complianceResults.recommendations.map((rec, index) => <li key={index} className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5" />
                      <span className="text-sm">{rec}</span>
                    </li>)}
                </ul>
              </div>}
          </div>}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            关闭
          </Button>
          <Button onClick={checkCompliance} disabled={loading}>
            重新检查
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>;
}