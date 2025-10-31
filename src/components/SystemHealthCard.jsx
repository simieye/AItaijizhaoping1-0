// @ts-ignore;
import React, { useState, useEffect, useCallback } from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, useToast } from '@/components/ui';
// @ts-ignore;
import { RefreshCw, AlertTriangle, Clock, Activity, Shield, TrendingUp } from 'lucide-react';

export function SystemHealthCard({
  $w,
  onRefreshToken
}) {
  const [tokenExpiry, setTokenExpiry] = useState(30); // 默认30分钟
  const [errorRate, setErrorRate] = useState(0);
  const [requestCount, setRequestCount] = useState(0);
  const [cacheHitRate, setCacheHitRate] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const {
    toast
  } = useToast();

  // 模拟获取系统健康数据
  const fetchSystemHealth = useCallback(async () => {
    try {
      // 模拟API调用获取系统健康数据
      const mockData = {
        tokenExpiry: Math.floor(Math.random() * 60) + 1,
        // 1-60分钟
        errorRate: Math.random() * 10,
        // 0-10%
        requestCount: Math.floor(Math.random() * 1000) + 100,
        // 100-1100
        cacheHitRate: Math.random() * 100 // 0-100%
      };
      setTokenExpiry(mockData.tokenExpiry);
      setErrorRate(mockData.errorRate);
      setRequestCount(mockData.requestCount);
      setCacheHitRate(mockData.cacheHitRate);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('获取系统健康数据失败:', error);
      toast({
        title: '获取系统健康数据失败',
        description: error.message || '无法获取系统状态',
        variant: 'destructive'
      });
    }
  }, [toast]);

  // 刷新Token
  const handleRefreshToken = async () => {
    setIsRefreshing(true);
    try {
      // 调用刷新Token的云函数
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
        setTokenExpiry(30); // 重置为30分钟
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

  // 倒计时格式化
  const formatCountdown = minutes => {
    if (minutes <= 0) return '已过期';
    if (minutes < 1) return '< 1分钟';
    return `${minutes}分钟`;
  };

  // 获取Token状态颜色
  const getTokenStatusColor = () => {
    if (tokenExpiry <= 1) return 'text-red-600';
    if (tokenExpiry <= 5) return 'text-orange-600';
    return 'text-green-600';
  };

  // 获取错误率状态颜色
  const getErrorRateColor = () => {
    if (errorRate > 5) return 'text-red-600';
    if (errorRate > 2) return 'text-orange-600';
    return 'text-green-600';
  };

  // 获取缓存命中率颜色
  const getCacheHitRateColor = () => {
    if (cacheHitRate >= 80) return 'text-green-600';
    if (cacheHitRate >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  // 每秒更新倒计时
  useEffect(() => {
    const interval = setInterval(() => {
      setTokenExpiry(prev => Math.max(0, prev - 1 / 60)); // 每分钟减少1
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // 每30秒更新其他指标
  useEffect(() => {
    fetchSystemHealth();
    const interval = setInterval(fetchSystemHealth, 30000);
    return () => clearInterval(interval);
  }, [fetchSystemHealth]);
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
              <Clock className={`h-4 w-4 ${getTokenStatusColor()}`} />
            </div>
            <div className="text-2xl font-bold">{formatCountdown(tokenExpiry)}</div>
            <div className="text-xs text-gray-500">
              最后更新: {lastUpdate.toLocaleTimeString()}
            </div>
          </div>

          {/* 接口错误率 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">接口错误率</span>
              <AlertTriangle className={`h-4 w-4 ${getErrorRateColor()}`} />
            </div>
            <div className={`text-2xl font-bold ${getErrorRateColor()}`}>
              {errorRate.toFixed(1)}%
            </div>
            {errorRate > 5 && <Badge variant="destructive" className="text-xs">
                高错误率
              </Badge>}
          </div>

          {/* 请求总量 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">1小时请求量</span>
              <Activity className="h-4 w-4 text-blue-600" />
            </div>
            <div className="text-2xl font-bold">{requestCount}</div>
            <div className="text-xs text-gray-500">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              实时统计
            </div>
          </div>

          {/* 缓存命中率 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">缓存命中率</span>
              <Shield className={`h-4 w-4 ${getCacheHitRateColor()}`} />
            </div>
            <div className={`text-2xl font-bold ${getCacheHitRateColor()}`}>
              {cacheHitRate.toFixed(1)}%
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{
              width: `${cacheHitRate}%`
            }} />
            </div>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="mt-4 pt-4 border-t">
          <Button size="sm" onClick={handleRefreshToken} disabled={isRefreshing} className="w-full" variant={tokenExpiry <= 5 ? "destructive" : "default"}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? '刷新中...' : '刷新Token'}
          </Button>
        </div>

        {/* 状态指示器 */}
        <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
          <span>系统状态: {errorRate > 5 ? '警告' : '正常'}</span>
          <span>更新频率: 30秒</span>
        </div>
      </CardContent>
    </Card>;
}