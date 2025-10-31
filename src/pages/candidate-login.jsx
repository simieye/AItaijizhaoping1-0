// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Button, Input, Card, CardContent, CardHeader, CardTitle, Alert, AlertDescription, AlertTitle, useToast } from '@/components/ui';
// @ts-ignore;
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';

// @ts-ignore;
import { cachedCallDataSource } from '@/lib/cache';
export default function CandidateLogin(props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const {
    toast
  } = useToast();
  const {
    $w
  } = props;

  // 检查是否已登录
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const tcb = await $w.cloud.getCloudInstance();
        const auth = tcb.auth({
          persistence: 'local'
        });
        const user = auth.currentUser;
        if (user) {
          $w.utils.navigateTo({
            pageId: 'candidate-dashboard'
          });
        }
      } catch (error) {
        console.log('用户未登录或登录状态无效');
      }
    };
    checkAuth();
  }, []);

  // 处理登录
  const handleLogin = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // 验证输入
      if (!email || !password) {
        setError('请填写邮箱和密码');
        setLoading(false);
        return;
      }
      if (!/\S+@\S+\.\S+/.test(email)) {
        setError('请输入有效的邮箱地址');
        setLoading(false);
        return;
      }

      // 使用云开发登录
      const tcb = await $w.cloud.getCloudInstance();
      const auth = tcb.auth({
        persistence: rememberMe ? 'local' : 'session'
      });
      const loginResult = await auth.signInWithEmailAndPassword(email, password);
      if (loginResult.user) {
        toast({
          title: '登录成功',
          description: '欢迎回来！',
          variant: 'success'
        });

        // 获取候选人信息
        try {
          const candidateData = await cachedCallDataSource($w, {
            dataSourceName: 'candidate_profile',
            methodName: 'wedaGetRecordsV2',
            params: {
              filter: {
                where: {
                  email: {
                    $eq: email
                  }
                }
              },
              select: {
                $master: true
              }
            }
          });
          if (candidateData.records && candidateData.records.length > 0) {
            // 已存在候选人资料
            $w.utils.navigateTo({
              pageId: 'candidate-dashboard'
            });
          } else {
            // 新用户，跳转到完善资料页面
            $w.utils.navigateTo({
              pageId: 'candidate-profile-setup',
              params: {
                email: email
              }
            });
          }
        } catch (error) {
          console.error('获取候选人信息失败:', error);
          // 即使有错误也跳转到仪表板
          $w.utils.navigateTo({
            pageId: 'candidate-dashboard'
          });
        }
      }
    } catch (error) {
      console.error('登录失败:', error);
      let errorMessage = '登录失败，请重试';
      if (error.code === 'INVALID_EMAIL') {
        errorMessage = '邮箱格式不正确';
      } else if (error.code === 'USER_NOT_FOUND') {
        errorMessage = '用户不存在，请先注册';
      } else if (error.code === 'WRONG_PASSWORD') {
        errorMessage = '密码错误';
      } else if (error.code === 'NETWORK_ERROR') {
        errorMessage = '网络连接失败，请检查网络';
      }
      setError(errorMessage);
      toast({
        title: '登录失败',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // 处理注册
  const handleRegister = () => {
    $w.utils.navigateTo({
      pageId: 'candidate-register'
    });
  };

  // 处理忘记密码
  const handleForgotPassword = () => {
    $w.utils.navigateTo({
      pageId: 'candidate-forgot-password'
    });
  };

  // 处理游客访问
  const handleGuestAccess = () => {
    $w.utils.navigateTo({
      pageId: 'candidate-dashboard'
    });
  };
  return <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <style jsx>{`
        body {
          background: linear-gradient(135deg, #eff6ff 0%, #ffffff 50%, #faf5ff 100%);
        }
        .dark body {
          background: linear-gradient(135deg, #111827 0%, #1f2937 50%, #374151 100%);
        }
      `}</style>
      
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
              <User className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              候选人登录
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              登录您的候选人账户
            </p>
          </div>

          {/* 登录卡片 */}
          <Card className="border-0 shadow-xl">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl text-center">欢迎回来</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                {/* 错误提示 */}
                {error && <Alert variant="destructive">
                    <AlertTitle>登录失败</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>}

                {/* 邮箱输入 */}
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    邮箱地址
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input id="email" type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} className="pl-10" required />
                  </div>
                </div>

                {/* 密码输入 */}
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium">
                    密码
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="请输入密码" value={password} onChange={e => setPassword(e.target.value)} className="pl-10 pr-10" required />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* 记住我 */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} className="rounded border-gray-300" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">记住我</span>
                  </label>
                  <button type="button" onClick={handleForgotPassword} className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400">
                    忘记密码？
                  </button>
                </div>

                {/* 登录按钮 */}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? '登录中...' : '登录'}
                </Button>

                {/* 其他选项 */}
                <div className="space-y-3 text-center">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    还没有账户？{' '}
                    <button type="button" onClick={handleRegister} className="text-blue-600 hover:text-blue-800 dark:text-blue-400 font-medium">
                      立即注册
                    </button>
                  </div>
                  
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <button type="button" onClick={handleGuestAccess} className="text-gray-500 hover:text-gray-700 dark:text-gray-400">
                      游客访问
                    </button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* 底部信息 */}
          <div className="text-center mt-6">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              使用AI招聘平台，开启智能求职之旅
            </p>
          </div>
        </div>
      </div>
    </div>;
}