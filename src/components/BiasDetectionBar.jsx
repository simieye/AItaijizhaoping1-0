// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Card, CardContent, Progress, Badge } from '@/components/ui';
// @ts-ignore;
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';

export function BiasDetectionBar({
  biasScore = 0,
  alerts = [],
  className = '',
  showDetails = true
}) {
  // 确保分数在0-100范围内
  const normalizedScore = Math.max(0, Math.min(100, biasScore));

  // 根据分数确定风险等级
  const getRiskLevel = score => {
    if (score <= 3) return {
      level: 'low',
      color: 'text-green-500',
      bgColor: 'bg-green-100',
      label: '低风险'
    };
    if (score <= 6) return {
      level: 'medium',
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-100',
      label: '中风险'
    };
    return {
      level: 'high',
      color: 'text-red-500',
      bgColor: 'bg-red-100',
      label: '高风险'
    };
  };
  const riskLevel = getRiskLevel(normalizedScore);

  // 获取对应的图标
  const getIcon = () => {
    switch (riskLevel.level) {
      case 'low':
        return <CheckCircle className="h-4 w-4" />;
      case 'medium':
        return <AlertTriangle className="h-4 w-4" />;
      case 'high':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };
  return <Card className={className}>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {getIcon()}
              <span className={`font-medium ${riskLevel.color}`}>
                偏见风险等级: {riskLevel.label}
              </span>
            </div>
            <Badge variant={riskLevel.level === 'low' ? 'default' : 'secondary'} className={riskLevel.bgColor}>
              {normalizedScore}%
            </Badge>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>偏见风险评分</span>
              <span>{normalizedScore}/100</span>
            </div>
            <Progress value={normalizedScore} className={`h-2 ${riskLevel.level === 'low' ? 'bg-green-200' : riskLevel.level === 'medium' ? 'bg-yellow-200' : 'bg-red-200'}`} />
          </div>

          {showDetails && alerts.length > 0 && <div className="space-y-2">
              <h4 className="text-sm font-medium">检测到的偏见:</h4>
              <ul className="space-y-1">
                {alerts.map((alert, index) => <li key={index} className="text-sm text-gray-600 flex items-start">
                    <span className="mr-2">•</span>
                    {alert}
                  </li>)}
              </ul>
            </div>}

          {normalizedScore > 5 && <div className="text-xs text-gray-500">
              建议：请检查职位描述中的用词，确保使用中性、包容性的语言
            </div>}
        </div>
      </CardContent>
    </Card>;
}