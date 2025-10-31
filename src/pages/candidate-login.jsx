// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Input, Checkbox, Alert, AlertDescription, AlertTitle, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, useToast } from '@/components/ui';
// @ts-ignore;
import { Eye, EyeOff, Shield, Clock, Phone, Mail } from 'lucide-react';

export default function CandidateLogin(props) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [gdprConsent, setGdprConsent] = useState(false);
  const [showAiConsent, setShowAiConsent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isPhoneLogin, setIsPhoneLogin] = useState(false);
  const [consentLog, setConsentLog] = useState(null);
  const {
    toast
  } = useToast();
  const {
    $w
  } = props;

  // 从本地存储恢复GDPR同意状态
  useEffect(() => {
    const savedConsent = localStorage.getItem('gdpr_consent_candidate');
    if (savedConsent) {
      setGdprConsent(JSON.parse(savedConsent));
    }
  }, []);

  // 验证码倒计时
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  // 保存GDPR同意状态
  const handleGdprChange = checked => {
    setGdprConsent(checked);
    localStorage.setItem('gdpr_consent_candidate', JSON.stringify(checked));

    // 记录同意日志
    if (checked) {
      recordConsent('gdpr', 'candidate');
    }
  };

  // 记录同意日志
  const recordConsent = async (type, userType) => {
    try {
      await $w.cloud.callDataSource({
        dataSourceName: 'consent_log',
        methodName: 'wedaCreateV2',
        params: {
          data: {
            consentType: type,
            userType: userType,
            userId: $w.auth.currentUser?.userId || 'anonymous',
            regulation: getCurrentRegulation(),
            timestamp: new Date().toISOString(),
            ipAddress: 'auto-detected',
            userAgent: navigator.userAgent
          }
        }
      });
    } catch (error) {
      console.error('记录同意日志失败:', error);
    }
  };

  // 获取当前法规
  const getCurrentRegulation = () => {
    const region = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (region.includes('Europe')) return 'EU_AI_Act';
    if (region.includes('America')) return 'US_State_Bias_Audit';
    if (region.includes('Asia/Shanghai')) return 'China_Content_Review';
    return 'EU_AI_Act';
  };

  // 发送验证码
  const sendCode = async () => {
    if (!phone || !/^\d{11}$/.test(phone)) {
      toast({
        title: "手机号格式错误",
        description: "请输入正确的11位手机号码",
        variant: "destructive"
      });
      return;
    }
    setCountdown(60);
    try {
      // 模拟发送验证码
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "验证码已发送",
        description: `验证码已发送至 ${phone.slice(0, 3)}****${phone.slice(-4)}`
      });
    } catch (error) {
      toast({
        title: "发送失败",
        description: "请稍后重试",
        variant: "destructive"
      });
    }
  };

  // 处理登录
  const handleLogin = async e => {
    e.preventDefault();
    if (!gdprConsent) {
      toast({
        title: "请同意GDPR数据授权",
        description: "根据EU AI Act要求，必须同意数据使用条款",
        variant: "destructive"
      });
      return;
    }
    try {
      // 记录登录同意
      await recordConsent('login', 'candidate');

      // 模拟登录成功
      toast({
        title: "登录成功",
        description: "正在跳转到候选人仪表盘..."
      });
      setTimeout(() => {
        $w.utils.navigateTo({
          pageId: 'candidate-dashboard',
          params: {
            regulation: getCurrentRegulation()
          }
        });
      }, 1500);
    } catch (error) {
      toast({
        title: "登录失败",
        description: error.message || "请检查网络连接",
        variant: "destructive"
      });
    }
  };

  // 处理注册
  const handleRegister = async e => {
    e.preventDefault();
    if (!gdprConsent) {
      toast({
        title: "请同意GDPR数据授权",
        description: "根据EU AI Act要求，必须同意数据使用条款",
        variant: "destructive"
      });
      return;
    }
    try {
      // 记录注册同意
      await recordConsent('registration', 'candidate');
      toast({
        title: "注册成功",
        description: "正在跳转到简历上传页面..."
      });
      setTimeout(() => {
        $w.utils.navigateTo({
          pageId: 'candidate-resume-upload',
          params: {
            regulation: getCurrentRegulation()
          }
        });
      }, 1500);
    } catch (error) {
      toast({
        title: "注册失败",
        description: error.message || "请稍后重试",
        variant: "destructive"
      });
    }
  };
  return <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-50 flex items-center justify-center p-4">
      <style jsx>{`
        body {
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
        }
      `}</style>
      
      <div className="w-full max-w-md">
        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl">候选人登录</CardTitle>
            <CardDescription>AI太极合规招聘平台</CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="flex justify-center mb-6">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button className={`px-4 py-2 rounded-md text-sm font-medium ${!isPhoneLogin ? 'bg-white shadow-sm' : 'text-gray-500'}`} onClick={() => setIsPhoneLogin(false)}>
                  邮箱登录
                </button>
                <button className={`px-4 py-2 rounded-md text-sm font-medium ${isPhoneLogin ? 'bg-white shadow-sm' : 'text-gray-500'}`} onClick={() => setIsPhoneLogin(true)}>
                  手机登录
                </button>
              </div>
            </div>

            <form onSubmit={isLogin ? handleLogin : handleRegister}>
              {isPhoneLogin ? <>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">手机号</label>
                      <div className="flex space-x-2">
                        <Input type="tel" placeholder="请输入手机号" value={phone} onChange={e => setPhone(e.target.value)} className="flex-1" />
                        <Button type="button" variant="outline" onClick={sendCode} disabled={countdown > 0} className="w-28">
                          {countdown > 0 ? `${countdown}s` : '发送验证码'}
                        </Button>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium">验证码</label>
                      <Input type="text" placeholder="请输入验证码" value={code} onChange={e => setCode(e.target.value)} />
                    </div>
                  </div>
                </> : <>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">邮箱</label>
                      <Input type="email" placeholder="请输入邮箱" value={email} onChange={e => setEmail(e.target.value)} />
                    </div>
                    <div>
                      <label className="text-sm font-medium">密码</label>
                      <div className="relative">
                        <Input type={showPassword ? "text" : "password"} placeholder="请输入密码" value={password} onChange={e => setPassword(e.target.value)} />
                        <button type="button" className="absolute right-3 top-1/2 transform -translate-y-1/2" onClick={() => setShowPassword(!showPassword)}>
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </>}

              {!isLogin && <div className="space-y-4 mt-4">
                  <div>
                    <label className="text-sm font-medium">确认密码</label>
                    <Input type="password" placeholder="请再次输入密码" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">姓名</label>
                    <Input placeholder="请输入真实姓名" />
                  </div>
                </div>}

              <div className="space-y-4 mt-6">
                <div className="flex items-start space-x-2">
                  <Checkbox id="gdpr" checked={gdprConsent} onCheckedChange={handleGdprChange} />
                  <label htmlFor="gdpr" className="text-sm text-gray-600">
                    我已阅读并同意
                    <button type="button" className="text-blue-600 underline ml-1" onClick={() => setShowAiConsent(true)}>
                      AI使用条款
                    </button>
                    和
                    <button type="button" className="text-blue-600 underline ml-1">
                      GDPR数据授权
                    </button>
                  </label>
                </div>

                <Button type="submit" className="w-full bg-gradient-to-r from-cyan-500 to-blue-500">
                  {isLogin ? '登录' : '注册'}
                </Button>
              </div>
            </form>

            <div className="text-center mt-4">
              <button type="button" className="text-sm text-blue-600 hover:underline" onClick={() => setIsLogin(!isLogin)}>
                {isLogin ? '还没有账号？立即注册' : '已有账号？立即登录'}
              </button>
            </div>
          </CardContent>
        </Card>

        {/* AI使用告知弹窗 */}
        <Dialog open={showAiConsent} onOpenChange={setShowAiConsent}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>AI使用告知</DialogTitle>
              <DialogDescription>
                <div className="space-y-4 text-sm">
                  <div>
                    <h4 className="font-semibold mb-2">数据使用说明</h4>
                    <p>根据{getCurrentRegulation()}法规要求，我们使用AI技术：</p>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>分析您的简历和面试表现</li>
                      <li>提供职位匹配建议</li>
                      <li>检测招聘过程中的潜在偏见</li>
                      <li>确保招聘过程的公平性</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">数据保护措施</h4>
                    <ul className="list-disc list-inside space-y-1">
                      <li>所有数据经过加密存储</li>
                      <li>您可以随时撤回数据使用授权</li>
                      <li>数据仅用于招聘相关用途</li>
                      <li>符合GDPR和CCPA隐私保护要求</li>
                    </ul>
                  </div>
                  
                  <div className="bg-yellow-50 p-3 rounded-lg">
                    <p className="text-yellow-800">
                      <strong>重要：</strong>继续使用本服务即表示您同意AI分析您的数据用于招聘目的。
                    </p>
                  </div>
                </div>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button onClick={() => setShowAiConsent(false)}>我已了解</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>;
}