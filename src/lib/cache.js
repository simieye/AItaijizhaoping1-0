
// @ts-ignore;
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
};

// 缓存配置
const CACHE_CONFIG = {
  localStorage: {
    prefix: 'app_cache_',
    maxSize: 1024 * 1024, // 1MB
    ttl: 24 * 60 * 60 * 1000 // 24小时
  },
  indexedDB: {
    dbName: 'AppCacheDB',
    version: 1,
    stores: {
      largeData: 'large_data',
      userData: 'user_data',
      chatHistory: 'chat_history',
      jobListings: 'job_listings',
      resumeData: 'resume_data'
    }
  }
};

// 缓存状态管理
class CacheManager {
  constructor() {
    this.isOnline = navigator.onLine;
    this.syncQueue = [];
    this.setupEventListeners();
  }

  // 设置事件监听器
  setupEventListeners() {
    window.addEventListener('online', () => this.handleOnline());
    window.addEventListener('offline', () => this.handleOffline());
  }

  // 处理网络恢复
  async handleOnline() {
    this.isOnline = true;
    console.log('网络已恢复，开始同步缓存');
    
    // 同步队列中的数据
    await this.processSyncQueue();
    
    // 触发缓存更新事件
    window.dispatchEvent(new CustomEvent('cache-sync-complete'));
  }

  // 处理网络断开
  handleOffline() {
    this.isOnline = false;
    console.log('网络已断开，启用离线模式');
    window.dispatchEvent(new CustomEvent('cache-offline-mode'));
  }

  // 检查网络状态
  isNetworkAvailable() {
    return this.isOnline;
  }

  // 添加到同步队列
  addToSyncQueue(key, data) {
    this.syncQueue.push({ key, data, timestamp: Date.now() });
  }

  // 处理同步队列
  async processSyncQueue() {
    while (this.syncQueue.length > 0) {
      const item = this.syncQueue.shift();
      try {
        await this.syncToServer(item.key, item.data);
      } catch (error) {
        console.error('同步失败:', error);
        // 重新加入队列稍后重试
        this.syncQueue.push(item);
        break;
      }
    }
  }

  // 同步到服务器
  async syncToServer(key, data) {
    // 这里可以集成实际的API调用
    console.log(`同步 ${key} 到服务器`);
  }
}

// LocalStorage 缓存管理器
class LocalStorageCache {
  constructor() {
    this.prefix = CACHE_CONFIG.localStorage.prefix;
  }

  // 生成存储键
  generateKey(key) {
    return `${this.prefix}${key}`;
  }

  // 设置缓存
  set(key, data, ttl = CACHE_CONFIG.localStorage.ttl) {
    try {
      const item = {
        data,
        timestamp: Date.now(),
        ttl,
        stale: false
      };
      
      const serialized = JSON.stringify(item);
      
      // 检查大小限制
      if (serialized.length > CACHE_CONFIG.localStorage.maxSize) {
        console.warn('数据过大，建议使用IndexedDB');
        return false;
      }
      
      localStorage.setItem(this.generateKey(key), serialized);
      return true;
    } catch (error) {
      console.error('LocalStorage设置失败:', error);
      return false;
    }
  }

  // 获取缓存
  get(key) {
    try {
      const item = localStorage.getItem(this.generateKey(key));
      if (!item) return null;
      
      const parsed = JSON.parse(item);
      
      // 检查是否过期
      if (Date.now() - parsed.timestamp > parsed.ttl) {
        this.remove(key);
        return null;
      }
      
      return parsed.data;
    } catch (error) {
      console.error('LocalStorage读取失败:', error);
      return null;
    }
  }

  // 删除缓存
  remove(key) {
    try {
      localStorage.removeItem(this.generateKey(key));
    } catch (error) {
      console.error('LocalStorage删除失败:', error);
    }
  }

  // 清除过期缓存
  clearExpired() {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          this.get(key.replace(this.prefix, ''));
        }
      });
    } catch (error) {
      console.error('清除过期缓存失败:', error);
    }
  }

  // 获取缓存状态
  getCacheStatus(key) {
    try {
      const item = localStorage.getItem(this.generateKey(key));
      if (!item) return { exists: false, expired: true };
      
      const parsed = JSON.parse(item);
      const expired = Date.now() - parsed.timestamp > parsed.ttl;
      
      return {
        exists: true,
        expired,
        stale: parsed.stale || false,
        timestamp: parsed.timestamp,
        ttl: parsed.ttl
      };
    } catch (error) {
      return { exists: false, expired: true };
    }
  }
}

// IndexedDB 缓存管理器
class IndexedDBCache {
  constructor() {
    this.dbName = CACHE_CONFIG.indexedDB.dbName;
    this.version = CACHE_CONFIG.indexedDB.version;
    this.stores = CACHE_CONFIG.indexedDB.stores;
    this.db = null;
    this.init();
  }

  // 初始化数据库
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // 创建所有存储对象
        Object.values(this.stores).forEach(storeName => {
          if (!db.objectStoreNames.contains(storeName)) {
            const store = db.createObjectStore(storeName, { keyPath: 'key' });
            store.createIndex('timestamp', 'timestamp');
            store.createIndex('ttl', 'ttl');
          }
        });
      };
    });
  }

  // 设置缓存
  async set(storeName, key, data, ttl = 24 * 60 * 60 * 1000) {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      
      const item = {
        key,
        data,
        timestamp: Date.now(),
        ttl,
        stale: false
      };
      
      const request = store.put(item);
      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  }

  // 获取缓存
  async get(storeName, key) {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);
      
      request.onsuccess = () => {
        const item = request.result;
        
        if (!item) {
          resolve(null);
          return;
        }
        
        // 检查是否过期
        if (Date.now() - item.timestamp > item.ttl) {
          this.remove(storeName, key);
          resolve(null);
          return;
        }
        
        resolve(item.data);
      };
      
      request.onerror = () => reject(request.error);
    });
  }

  // 删除缓存
  async remove(storeName, key) {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);
      
      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  }

  // 清除过期缓存
  async clearExpired(storeName) {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const index = store.index('timestamp');
      
      const now = Date.now();
      const range = IDBKeyRange.upperBound(now - 24 * 60 * 60 * 1000);
      
      const request = index.openCursor(range);
      
      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          const item = cursor.value;
          if (Date.now() - item.timestamp > item.ttl) {
            cursor.delete();
          }
          cursor.continue();
        } else {
          resolve();
        }
      };
      
      request.onerror = () => reject(request.error);
    });
  }

  // 获取所有键
  async getAllKeys(storeName) {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAllKeys();
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // 清空存储
  async clear(storeName) {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();
      
      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  }
}

// 统一缓存管理器
class CacheManager {
  constructor() {
    this.localStorage = new LocalStorageCache();
    this.indexedDB = new IndexedDBCache();
    this.networkManager = new CacheManager();
    this.syncQueue = [];
  }

  // 智能选择存储方式
  async setCache(key, data, ttl = 24 * 60 * 60 * 1000) {
    try {
      // 根据数据大小选择存储方式
      const serialized = JSON.stringify(data);
      
      if (serialized.length < 100 * 1024) { // 小于100KB用localStorage
        return this.localStorage.set(key, data, ttl);
      } else { // 大于100KB用IndexedDB
        const storeName = this.determineStoreName(key);
        return this.indexedDB.set(storeName, key, data, ttl);
      }
    } catch (error) {
      console.error('设置缓存失败:', error);
      return false;
    }
  }

  // 获取缓存
  async getCache(key) {
    try {
      // 先尝试localStorage
      let data = this.localStorage.get(key);
      if (data !== null) return data;
      
      // 再尝试IndexedDB
      const storeName = this.determineStoreName(key);
      data = await this.indexedDB.get(storeName, key);
      
      return data;
    } catch (error) {
      console.error('获取缓存失败:', error);
      return null;
    }
  }

  // 确定存储的store名称
  determineStoreName(key) {
    if (key.includes('chat') || key.includes('message')) {
      return CACHE_CONFIG.indexedDB.stores.chatHistory;
    } else if (key.includes('job') || key.includes('position')) {
      return CACHE_CONFIG.indexedDB.stores.jobListings;
    } else if (key.includes('resume') || key.includes('profile')) {
      return CACHE_CONFIG.indexedDB.stores.resumeData;
    } else if (key.includes('user')) {
      return CACHE_CONFIG.indexedDB.stores.userData;
    } else {
      return CACHE_CONFIG.indexedDB.stores.largeData;
    }
  }

  // 清除过期缓存
  async clearExpired() {
    try {
      this.localStorage.clearExpired();
      
      // 清除所有IndexedDB存储的过期数据
      const stores = Object.values(CACHE_CONFIG.indexedDB.stores);
      for (const storeName of stores) {
        await this.indexedDB.clearExpired(storeName);
      }
    } catch (error) {
      console.error('清除过期缓存失败:', error);
    }
  }

  // 获取缓存状态
  async getCacheStatus(key) {
    const localStatus = this.localStorage.getCacheStatus(key);
    if (localStatus.exists) return localStatus;
    
    const storeName = this.determineStoreName(key);
    const data = await this.indexedDB.get(storeName, key);
    
    return {
      exists: data !== null,
      expired: false,
      stale: false
    };
  }

  // 标记缓存为过期
  async markStale(key) {
    try {
      const item = this.localStorage.get(key);
      if (item) {
        const status = this.localStorage.getCacheStatus(key);
        if (status.exists) {
          this.localStorage.set(key, item, 0); // 立即过期
        }
      }
    } catch (error) {
      console.error('标记缓存过期失败:', error);
    }
  }

  // 网络异常时的降级处理
  async handleNetworkError(key, fallbackData = null) {
    console.log('网络异常，尝试使用缓存数据');
    
    const cachedData = await this.getCache(key);
    if (cachedData !== null) {
      // 标记为过期数据
      await this.markStale(key);
      return {
        data: cachedData,
        fromCache: true,
        stale: true
      };
    }
    
    return {
      data: fallbackData,
      fromCache: false,
      stale: false
    };
  }

  // 网络恢复后的同步
  async syncOnReconnect() {
    if (this.networkManager.isNetworkAvailable()) {
      console.log('网络恢复，开始同步缓存');
      await this.clearExpired();
      
      // 触发同步事件
      window.dispatchEvent(new CustomEvent('cache-sync-start'));
    }
  }

  // 获取缓存统计
  async getCacheStats() {
    try {
      const stats = {
        localStorage: {
          keys: 0,
          size: 0
        },
        indexedDB: {
          stores: {}
        }
      };
      
      // localStorage统计
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(CACHE_CONFIG.localStorage.prefix)) {
          stats.localStorage.keys++;
          stats.localStorage.size += localStorage.getItem(key).length;
        }
      });
      
      // IndexedDB统计
      const stores = Object.values(CACHE_CONFIG.indexedDB.stores);
      for (const storeName of stores) {
        const keys = await this.indexedDB.getAllKeys(storeName);
        stats.indexedDB.stores[storeName] = keys.length;
      }
      
      return stats;
    } catch (error) {
      console.error('获取缓存统计失败:', error);
      return null;
    }
  }
}

// 创建全局缓存实例
const cacheManager = new CacheManager();

// 导出缓存方法
export const setCache = (key, data, ttl) => cacheManager.setCache(key, data, ttl);
export const getCache = (key) => cacheManager.getCache(key);
export const clearExpired = () => cacheManager.clearExpired();
export const getCacheStats = () => cacheManager.getCacheStats();
export const handleNetworkError = (key, fallbackData) => cacheManager.handleNetworkError(key, fallbackData);

// 网络状态监听
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    cacheManager.syncOnReconnect();
  });
}

// 缓存工具函数
export const cacheUtils = {
  // 缓存用户基础信息
  cacheUserProfile: async (userData) => {
    return setCache('user_profile', userData, 24 * 60 * 60 * 1000);
  },
  
  // 获取用户基础信息
  getUserProfile: async () => {
    return getCache('user_profile');
  },
  
  // 缓存职位列表
  cacheJobListings: async (jobs) => {
    return setCache('job_listings', jobs, 5 * 60 * 1000); // 5分钟
  },
  
  // 获取职位列表
  getJobListings: async () => {
    return getCache('job_listings');
  },
  
  // 缓存聊天记录
  cacheChatHistory: async (chatId, messages) => {
    return setCache(`chat_${chatId}`, messages, 7 * 24 * 60 * 60 * 1000); // 7天
  },
  
  // 获取聊天记录
  getChatHistory: async (chatId) => {
    return getCache(`chat_${chatId}`);
  },
  
  // 缓存简历数据
  cacheResumeData: async (resumeData) => {
    return setCache('resume_data', resumeData, 24 * 60 * 60 * 1000);
  },
  
  // 获取简历数据
  getResumeData: async () => {
    return getCache('resume_data');
  }
};

// 导出缓存管理器实例
export default cacheManager;
    