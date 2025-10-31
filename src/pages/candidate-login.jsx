// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Label, Alert, AlertDescription, useToast } from '@/components/ui';
// @ts-ignore;
import { Eye, EyeOff, Mail, Lock, User, MessageSquare } from 'lucide-react';

// @ts-ignore;
import { CandidateAIChat } from '@/components/CandidateAIChat';
export default function CandidateLogin(props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [aiChatOpen, setAiChatOpen] = useState(false);
  const {
    toast
  } = useToast();
  const {
    $w
  } = props;
  const handleLogin = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      // 查询用户数据
      const userResponse = await $w.cloud.callDataSource({
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
      if (userResponse.records && userResponse.records.length > 0) {
        const user = userResponse.records[0];
        // 检查密码（实际应用中应该加密验证）
        if (user.password === password) {
          toast({
            title: '登录成功',
            description: `欢迎回来，${user.name || '候选人'}！`
          });
          $w.utils.navigateTo({
            pageId: 'candidate-dashboard'
          });
        } else {
          toast({
            title: '登录失败',
            description: '邮箱或密码错误',
            variant: 'destructive'
          });
        }
      } else {
        toast({
          title: '登录失败',
          description: '未找到候选人账户',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('登录错误:', error);
      toast({
        title: '登录失败',
        description: error.message || '网络错误，请重试',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  const handleRegister = () => {
    $w.utils.navigateTo({
      pageId: 'candidate-register'
    });
  };
  const handleForgotPassword = () => {
    $w.utils.navigateTo({
      pageId: 'candidate-forgot-password'
    });
  };
  return <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <style jsx>{`
        body {
          background: linear-gradient(135deg, #eff6ff 0%, #e0e7ff 100%);
        }
      `}</style>
      
      <div className="w-full max-w-md">
        <Card className="shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">候选人登录</CardTitle>
            <CardDescription className="text-center">
              登录您的候选人账户，开启求职之旅
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">邮箱</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input id="email" type="email" placeholder="name@example.com" value={email} onChange={e => setEmail(e.target.value)} required className="pl-10" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">密码</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="请输入密码" value={password} onChange={e => setPassword(e.target.value)} required className="pl-10 pr-10" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? '登录中...' : '登录'}
              </Button>
            </form>
            <div className="mt-4 text-center space-y-2">
              <Button variant="link" className="text-sm" onClick={handleForgotPassword}>
                忘记密码？
              </Button>
              <div className="text-sm text-gray-600">
                还没有账户？{' '}
                <Button variant="link" className="text-sm p-0 h-auto" onClick={handleRegister}>
                  立即注册
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI客服按钮 */}
      <Button className="fixed bottom-6 right-6 rounded-full h-14 w-14 shadow-lg bg-blue-500 hover:bg-blue-600" onClick={() => setAiChatOpen(true)}>
        <MessageSquare className="h-6 w-6" />
      </Button>

      {/* AI客服抽屉 */}
      <CandidateAIChat isOpen={aiChatOpen} onClose={() => setAiChatOpen(false)} userId="candidate_login" userName="候选人" onMessageSent={(userMsg, botMsg) => {
      console.log('登录页面AI对话:', {
        user: userMsg,
        bot: botMsg
      });
    }} />
    </div>;
}