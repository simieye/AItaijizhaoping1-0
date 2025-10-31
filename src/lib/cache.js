
// 缓存管理工具
class CacheManager {
  constructor() {
    this.cache = new Map();
    this.defaultTTL = 5 * 60 * 1000; // 5分钟
  }

  // 生成缓存key
  generateKey(dataSourceName, methodName, params) {
    return `${dataSourceName}_${methodName}_${JSON.stringify(params)}`;
  }

  // 设置缓存
  set(key, data, ttl = this.defaultTTL) {
    const expiresAt = Date.now() + ttl;
    this.cache.set(key, {
      data,
      expiresAt,
      timestamp: Date.now()
    });
  }

  // 获取缓存
  get(key) {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    if (Date.now() > cached.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  // 检查缓存是否有效
  isValid(key) {
    const cached = this.cache.get(key);
    if (!cached) return false;
    
    return Date.now() <= cached.expiresAt;
  }

  // 清除缓存
  clear(key) {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }

  // 获取缓存统计
  getStats() {
    const now = Date.now();
    let validCount = 0;
    let expiredCount = 0;
    
    for (const [key, value] of this.cache) {
      if (now <= value.expiresAt) {
        validCount++;
      } else {
        expiredCount++;
      }
    }
    
    return {
      total: this.cache.size,
      valid: validCount,
      expired: expiredCount,
      hitRate: this.cache.size > 0 ? (validCount / this.cache.size * 100).toFixed(2) : 0
    };
  }

  // 清理过期缓存
  cleanup() {
    const now = Date.now();
    for (const [key, value] of this.cache) {
      if (now > value.expiresAt) {
        this.cache.delete(key);
      }
    }
  }
}

// 创建全局缓存实例
export const cacheManager = new CacheManager();

// 防抖函数
export const debounce = (func, delay = 300) => {
  let timeoutId;
  return (...args) => {
    return new Promise((resolve, reject) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(async () => {
        try {
          const result = await func(...args);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      }, delay);
    });
  };
};

// 节流函数
export const throttle = (func, delay = 300) => {
  let lastCall = 0;
  return (...args) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      return func(...args);
    }
  };
};

// 带缓存的数据源调用包装器
export const cachedCallDataSource = async ($w, params, options = {}) => {
  const {
    useCache = true,
    ttl = 5 * 60 * 1000,
    forceRefresh = false
  } = options;

  const key = cacheManager.generateKey(
    params.dataSourceName,
    params.methodName,
    params.params
  );

  // 如果强制刷新，清除缓存
  if (forceRefresh) {
    cacheManager.clear(key);
  }

  // 检查缓存
  if (useCache && cacheManager.isValid(key)) {
    console.log(`Cache hit for ${key}`);
    return cacheManager.get(key);
  }

  try {
    // 执行实际请求
    const result = await $w.cloud.callDataSource(params);
    
    // 缓存结果
    if (useCache) {
      cacheManager.set(key, result, ttl);
    }
    
    console.log(`Cache miss for ${key}, fetched from API`);
    return result;
  } catch (error) {
    console.error(`API call failed for ${key}:`, error);
    throw error;
  }
};

// 缓存监控工具
export const useCacheMonitor = () => {
  const [stats, setStats] = useState(cacheManager.getStats());

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(cacheManager.getStats());
      cacheManager.cleanup();
    }, 10000); // 每10秒清理一次

    return () => clearInterval(interval);
  }, []);

  return {
    stats,
    clearCache: () => cacheManager.clear(),
    getCache: (key) => cacheManager.get(key),
    setCache: (key, data, ttl) => cacheManager.set(key, data, ttl)
  };
};
