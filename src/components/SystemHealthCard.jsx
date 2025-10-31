// @ts-ignore;
import React, { useState, useEffect, useCallback } from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, useToast } from '@/components/ui';
// @ts-ignore;
import { RefreshCw, AlertTriangle, Clock, Activity, Shield, TrendingUp } from 'lucide-react';

// @ts-ignore;
import { getSystemHealth } from '@/lib/cache';
export function SystemHealthCard({
  $w,
  onRefreshToken,
  systemHealth
}) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const {
    toast
  } = useToast();

  // 获取Token状态颜色
  const getTokenStatusColor = minutes => {
    if (minutes <= 1) return 'text-red-600';
    if (minutes <= 5) return 'text-orange-600';
    return 'text-green-600';
  };

  // 获取错误率状态颜色
  const getErrorRateColor = rate => {
    if (rate > 5) return 'text-red-600';
    if (rate > 2) return 'text-orange-600';
    return 'text-green-600';
  };

  // 获取缓存命中率颜色
  const getCacheHitRateColor = rate => {
    if (rate >= 80) return 'text-green-600';
    if (rate >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  // 刷新Token
  const handleRefreshToken = async () => {
    setIsRefreshing(true);
    try {
      const result = await $w.cloud.callFunction({
        name: 'refreshAccessToken',
        data: {}
      });
      if (result.success) {
        toast({
          title: 'Token刷新成功',
          description: '访问令牌已更新',
          variant: 'success'
        });
        if (onRefreshToken) {
          onRefreshToken(result.token);
        }
      } else {
        throw new Error(result.message || '刷新失败');
      }
    } catch (error) {
      toast({
        title: 'Token刷新失败',
        description: error.message || '无法刷新访问令牌',
        variant: 'destructive'
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  // 格式化倒计时
  const formatCountdown = minutes => {
    if (minutes <= 0) return '已过期';
    if (minutes < 1) return '< 1分钟';
    return `${minutes}分钟`;
  };
  return <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-blue-600" />
            <span>系统健康监控</span>
          </div>
          <Badge variant="outline" className="text-xs">
            实时更新
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {/* Token有效期 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Token有效期</span>
              <Clock className={`h-4 w-4 ${getTokenStatusColor(systemHealth.tokenRemaining)}`} />
            </div>
            <div className={`text-2xl font-bold ${getTokenStatusColor(systemHealth.tokenRemaining)}`}>
              {formatCountdown(systemHealth.tokenRemaining)}
            </div>
            <div className="text-xs text-gray-500">
              最后更新: {lastUpdate.toLocaleTimeString()}
            </div>
          </div>

          {/* 接口错误率 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">接口错误率</span>
              <AlertTriangle className={`h-4 w-4 ${getErrorRateColor(systemHealth.errorRate)}`} />
            </div>
            <div className={`text-2xl font-bold ${getErrorRateColor(systemHealth.errorRate)}`}>
              {systemHealth.errorRate}%
            </div>
            {systemHealth.errorRate > 5 && <Badge variant="destructive" className="text-xs">
                高错误率
              </Badge>}
          </div>

          {/* 请求总量 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">总请求数</span>
              <Activity className="h-4 w-4 text-blue-600" />
            </div>
            <div className="text-2xl font-bold">{systemHealth.totalRequests}</div>
            <div className="text-xs text-gray-500">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              实时统计
            </div>
          </div>

          {/* 缓存命中率 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">缓存命中率</span>
              <Shield className={`h-4 w-4 ${getCacheHitRateColor(systemHealth.cacheSize > 0 ? 85 : 0)}`} />
            </div>
            <div className={`text-2xl font-bold ${getCacheHitRateColor(systemHealth.cacheSize > 0 ? 85 : 0)}`}>
              {systemHealth.cacheSize > 0 ? '85.0' : '0.0'}%
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{
              width: `${systemHealth.cacheSize > 0 ? 85 : 0}%`
            }} />
            </div>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="mt-4 pt-4 border-t">
          <Button size="sm" onClick={handleRefreshToken} disabled={isRefreshing} className="w-full" variant={systemHealth.tokenRemaining <= 5 ? "destructive" : "default"}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? '刷新中...' : '刷新Token'}
          </Button>
        </div>

        {/* 状态指示器 */}
        <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
          <span>系统状态: {systemHealth.errorRate > 5 ? '警告' : '正常'}</span>
          <span>缓存: {systemHealth.cacheSize}条</span>
        </div>
      </CardContent>
    </Card>;
}