// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Progress } from '@/components/ui';
// @ts-ignore;
import { AlertTriangle, CheckCircle } from 'lucide-react';

export function BiasDetectionBar({
  score,
  threshold = 5
}) {
  const isSafe = score <= threshold;
  const getColor = () => {
    if (isSafe) return 'bg-green-500';
    if (score <= threshold * 2) return 'bg-yellow-500';
    return 'bg-red-500';
  };
  const getIcon = () => {
    if (isSafe) return <CheckCircle className="h-4 w-4 text-green-500" />;
    return <AlertTriangle className="h-4 w-4 text-red-500" />;
  };
  const getText = () => {
    if (isSafe) return '偏见风险低';
    if (score <= threshold * 2) return '偏见风险中等';
    return '偏见风险高，需人工复核';
  };
  return <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">偏见检测</span>
        <div className="flex items-center space-x-2">
          {getIcon()}
          <span className={`text-sm ${isSafe ? 'text-green-600' : 'text-red-600'}`}>
            {getText()}
          </span>
        </div>
      </div>
      <Progress value={Math.min(score, 100)} className={getColor()} />
      <p className="text-xs text-gray-500">
        阈值: {threshold}% | 当前: {score}%
      </p>
    </div>;
}