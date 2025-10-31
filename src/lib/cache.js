
// 缓存管理器
class CacheManager {
  constructor() {
    this.cache = new Map();
    this.pendingRequests = new Map();
    this.errorStats = {
      totalRequests: 0,
      errorRequests: 0,
      last5MinErrors: []
    };
    this.tokenExpiry = 30 * 60 * 1000; // 30分钟
    this.tokenStartTime = Date.now();
  }

  // 生成缓存键
  generateKey(dataSourceName, methodName, params) {
    return `${dataSourceName}_${methodName}_${JSON.stringify(params)}`;
  }

  // 防抖函数
  debounce(func, delay = 300) {
    let timeoutId;
    return (...args) => {
      return new Promise((resolve) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => resolve(func.apply(this, args)), delay);
      });
    };
  }

  // 检查缓存是否有效
  isValid(key) {
    const cached = this.cache.get(key);
    if (!cached) return false;
    
    const now = Date.now();
    const isExpired = now - cached.timestamp > 60000; // 60秒过期
    
    if (isExpired) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  // 获取缓存
  get(key) {
    if (this.isValid(key)) {
      return this.cache.get(key).data;
    }
    return null;
  }

  // 设置缓存
  set(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  // 清除缓存
  clear() {
    this.cache.clear();
  }

  // 获取缓存统计
  getStats() {
    const totalRequests = this.errorStats.totalRequests;
    const errorRequests = this.errorStats.errorRequests;
    const errorRate = totalRequests > 0 ? (errorRequests / totalRequests) * 100 : 0;
    
    // 清理5分钟前的错误记录
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    this.errorStats.last5MinErrors = this.errorStats.last5MinErrors.filter(
      timestamp => timestamp > fiveMinutesAgo
    );
    
    return {
      hitRate: this.cache.size > 0 ? 100 : 0,
      totalRequests,
      errorRate: errorRate.toFixed(2),
      last5MinErrorCount: this.errorStats.last5MinErrors.length,
      cacheSize: this.cache.size,
      tokenRemaining: Math.max(0, this.tokenExpiry - (Date.now() - this.tokenStartTime))
    };
  }

  // 记录错误
  recordError() {
    this.errorStats.totalRequests++;
    this.errorStats.errorRequests++;
    this.errorStats.last5MinErrors.push(Date.now());
  }

  // 记录成功请求
  recordSuccess() {
    this.errorStats.totalRequests++;
  }

  // 更新token时间
  updateTokenExpiry(expiryMinutes = 30) {
    this.tokenExpiry = expiryMinutes * 60 * 1000;
    this.tokenStartTime = Date.now();
  }

  // 获取token剩余时间（分钟）
  getTokenRemainingMinutes() {
    const remaining = this.tokenExpiry - (Date.now() - this.tokenStartTime);
    return Math.max(0, Math.floor(remaining / 60000));
  }
}

// 创建全局缓存管理器实例
const cacheManager = new CacheManager();

// 防抖缓存调用
export const cachedCallDataSource = async ($w, request, options = {}) => {
  const {
    forceRefresh = false,
    debounceDelay = 300,
    retryOnTokenExpiry = true
  } = options;

  const key = cacheManager.generateKey(
    request.dataSourceName,
    request.methodName,
    request.params
  );

  // 如果强制刷新，清除缓存
  if (forceRefresh) {
    cacheManager.clear();
  }

  // 检查缓存
  if (!forceRefresh && cacheManager.get(key)) {
    return cacheManager.get(key);
  }

  // 检查是否有待处理的相同请求
  if (cacheManager.pendingRequests.has(key)) {
    return cacheManager.pendingRequests.get(key);
  }

  // 防抖包装的实际请求函数
  const debouncedRequest = cacheManager.debounce(async () => {
    try {
      const result = await $w.cloud.callDataSource(request);
      cacheManager.recordSuccess();
      cacheManager.set(key, result);
      return result;
    } catch (error) {
      cacheManager.recordError();
      
      // 处理token过期
      if (error.code === 'TOKEN_EXPIRED' && retryOnTokenExpiry) {
        try {
          // 尝试刷新token
          const refreshResult = await $w.cloud.callFunction({
            name: 'refreshAccessToken',
            data: {}
          });
          
          if (refreshResult.success) {
            cacheManager.updateTokenExpiry();
            // 重试原请求
            const retryResult = await $w.cloud.callDataSource(request);
            cacheManager.recordSuccess();
            cacheManager.set(key, retryResult);
            return retryResult;
          }
        } catch (refreshError) {
          console.error('Token刷新失败:', refreshError);
          throw error;
        }
      }
      
      throw error;
    } finally {
      cacheManager.pendingRequests.delete(key);
    }
  }, debounceDelay);

  // 执行防抖请求
  const promise = debouncedRequest();
  cacheManager.pendingRequests.set(key, promise);
  
  return promise;
};

// 防抖函数
export const debounce = (func, delay = 300) => {
  let timeoutId;
  return (...args) => {
    return new Promise((resolve) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => resolve(func.apply(this, args)), delay);
    });
  };
};

// 获取系统健康状态
export const getSystemHealth = () => {
  return cacheManager.getStats();
};

// 手动清除缓存
export const clearCache = () => {
  cacheManager.clear();
};

// 导出缓存管理器实例
export { cacheManager };
