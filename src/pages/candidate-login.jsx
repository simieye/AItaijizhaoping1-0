// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Button, Input, Card, CardContent, CardHeader, CardTitle, useToast } from '@/components/ui';
// @ts-ignore;
import { Mail, Lock, Eye, EyeOff, UserPlus, ArrowRight } from 'lucide-react';

// @ts-ignore;
import { cachedCallDataSource } from '@/lib/cache';
export default function CandidateLogin(props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const {
    toast
  } = useToast();
  const {
    $w
  } = props;

  // 表单验证
  const validateForm = () => {
    const newErrors = {};
    if (!email) {
      newErrors.email = '请输入邮箱地址';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = '请输入有效的邮箱地址';
    }
    if (!password) {
      newErrors.password = '请输入密码';
    } else if (password.length < 6) {
      newErrors.password = '密码长度至少6位';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 处理登录
  const handleLogin = async e => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    setLoading(true);
    try {
      // 使用缓存的API调用
      const response = await cachedCallDataSource($w, {
        dataSourceName: 'user',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              email: {
                $eq: email
              },
              role: {
                $eq: 'candidate'
              }
            }
          },
          select: {
            $master: true
          }
        }
      });
      const user = response.records?.[0];
      if (!user) {
        toast({
          title: '登录失败',
          description: '用户不存在或不是候选人',
          variant: 'destructive'
        });
        return;
      }

      // 验证密码（实际应用中应该使用加密验证）
      if (user.password !== password) {
        toast({
          title: '登录失败',
          description: '密码错误',
          variant: 'destructive'
        });
        return;
      }

      // 登录成功
      toast({
        title: '登录成功',
        description: `欢迎回来，${user.name || '候选人'}`,
        variant: 'success'
      });

      // 跳转到候选人仪表板
      $w.utils.navigateTo({
        pageId: 'candidate-dashboard',
        params: {
          userId: user._id
        }
      });
    } catch (error) {
      console.error('登录失败:', error);
      toast({
        title: '登录失败',
        description: error.message || '网络错误，请稍后重试',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // 跳转到注册页面
  const handleRegister = () => {
    $w.utils.navigateTo({
      pageId: 'candidate-register'
    });
  };

  // 跳转到忘记密码
  const handleForgotPassword = () => {
    $w.utils.navigateTo({
      pageId: 'forgot-password'
    });
  };
  return <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <style jsx>{`
        body {
          background: linear-gradient(135deg, #eff6ff 0%, #e0e7ff 100%);
        }
      `}</style>
      
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">候选人登录</h1>
          <p className="text-gray-600">欢迎回来，继续您的求职之旅</p>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">登录账户</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {/* 邮箱输入 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  邮箱地址
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input type="email" placeholder="请输入邮箱地址" value={email} onChange={e => setEmail(e.target.value)} className={`pl-10 ${errors.email ? 'border-red-500' : ''}`} data-cy="email-input" />
                </div>
                {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
              </div>

              {/* 密码输入 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  密码
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input type={showPassword ? 'text' : 'password'} placeholder="请输入密码" value={password} onChange={e => setPassword(e.target.value)} className={`pl-10 pr-10 ${errors.password ? 'border-red-500' : ''}`} data-cy="password-input" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password}</p>}
              </div>

              {/* 记住我和忘记密码 */}
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300" />
                  <span className="ml-2 text-sm text-gray-600">记住我</span>
                </label>
                <button type="button" onClick={handleForgotPassword} className="text-sm text-blue-600 hover:text-blue-500">
                  忘记密码？
                </button>
              </div>

              {/* 登录按钮 */}
              <Button type="submit" className="w-full" disabled={loading} data-cy="login-button">
                {loading ? <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    登录中...
                  </div> : <div className="flex items-center">
                    登录
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </div>}
              </Button>

              {/* 注册链接 */}
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  还没有账户？{' '}
                  <button type="button" onClick={handleRegister} className="text-blue-600 hover:text-blue-500 font-medium">
                    立即注册
                  </button>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* 帮助信息 */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            遇到问题？请联系客服 support@example.com
          </p>
        </div>
      </div>
    </div>;
}