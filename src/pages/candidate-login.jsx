// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Button, Input, Card, CardContent, CardDescription, CardHeader, CardTitle, Tabs, TabsContent, TabsList, TabsTrigger, Checkbox } from '@/components/ui';
// @ts-ignore;
import { Phone, Mail, MessageSquare, UserPlus, Shield } from 'lucide-react';

// @ts-ignore;
import { ComplianceModal } from '@/components/ComplianceModal';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { ThemeToggle } from '@/components/ThemeToggle';
import { AccessibilityMenu } from '@/components/AccessibilityMenu';
export default function CandidateLogin(props) {
  const {
    $w
  } = props;
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [fontSize, setFontSize] = useState(16);
  const [colorBlindMode, setColorBlindMode] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [language, setLanguage] = useState('zh');
  const [gdprConsent, setGdprConsent] = useState(false);
  const [chinaConsent, setChinaConsent] = useState(false);
  const [showComplianceModal, setShowComplianceModal] = useState(false);
  const [complianceAccepted, setComplianceAccepted] = useState(false);
  useEffect(() => {
    // 首次访问显示合规提示
    setShowComplianceModal(true);
  }, []);
  const handleSendCode = () => {
    if (phone.length === 11) {
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };
  const handleLogin = async () => {
    if (!complianceAccepted) {
      setShowComplianceModal(true);
      return;
    }
    try {
      // 调用登录API
      const result = await $w.cloud.callDataSource({
        dataSourceName: 'user',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              phone: {
                $eq: phone
              }
            }
          }
        }
      });
      if (result.records && result.records.length > 0) {
        $w.utils.navigateTo({
          pageId: 'candidate-dashboard',
          params: {}
        });
      } else {
        // 注册新用户
        await $w.cloud.callDataSource({
          dataSourceName: 'user',
          methodName: 'wedaCreateV2',
          params: {
            data: {
              phone,
              userType: 'candidate',
              gdprConsent,
              chinaConsent,
              createdAt: new Date()
            }
          }
        });
        $w.utils.navigateTo({
          pageId: 'candidate-dashboard',
          params: {}
        });
      }
    } catch (error) {
      console.error('登录失败:', error);
    }
  };
  const handleThirdPartyLogin = async provider => {
    if (!complianceAccepted) {
      setShowComplianceModal(true);
      return;
    }
    console.log(`Logging in with ${provider}`);
    // 模拟第三方登录
    setTimeout(() => {
      $w.utils.navigateTo({
        pageId: 'candidate-dashboard',
        params: {}
      });
    }, 1000);
  };
  return <div className={`min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4`}>
      <style jsx>{`
        body {
          font-size: ${fontSize}px;
        }
        ${colorBlindMode ? `
          * {
            filter: hue-rotate(15deg) saturate(0.8);
          }
        ` : ''}
      `}</style>
      
      <ComplianceModal isOpen={showComplianceModal} onClose={() => setShowComplianceModal(false)} onAccept={() => {
      setComplianceAccepted(true);
      setShowComplianceModal(false);
    }} />
      
      <div className="absolute top-4 right-4 flex items-center space-x-2">
        <LanguageSwitcher currentLang={language} onLanguageChange={setLanguage} />
        <ThemeToggle isDark={isDark} onToggle={() => setIsDark(!isDark)} />
        <AccessibilityMenu fontSize={fontSize} onFontSizeChange={setFontSize} colorBlindMode={colorBlindMode} onColorBlindToggle={() => setColorBlindMode(!colorBlindMode)} />
      </div>

      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">
            AI太极招聘平台
          </CardTitle>
          <CardDescription>求职者登录/注册</CardDescription>
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-600">
              <Shield className="inline h-3 w-3 mr-1" />
              符合EU AI Act、GDPR、中国个人信息保护法
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">登录</TabsTrigger>
              <TabsTrigger value="register">注册</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">手机号（中国CAC合规）</label>
                  <div className="flex space-x-2">
                    <Input type="tel" placeholder="请输入手机号" value={phone} onChange={e => setPhone(e.target.value)} maxLength={11} />
                    <Button variant="outline" onClick={handleSendCode} disabled={countdown > 0} className="whitespace-nowrap">
                      {countdown > 0 ? `${countdown}s` : '获取验证码'}
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">验证码</label>
                  <Input type="text" placeholder="请输入验证码" value={code} onChange={e => setCode(e.target.value)} maxLength={6} />
                </div>
                
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <Checkbox checked={gdprConsent} onCheckedChange={setGdprConsent} />
                    <span className="text-sm">我同意GDPR数据处理条款</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <Checkbox checked={chinaConsent} onCheckedChange={setChinaConsent} />
                    <span className="text-sm">我同意中国个人信息保护法条款</span>
                  </label>
                </div>
                
                <Button onClick={handleLogin} disabled={!gdprConsent || !chinaConsent} className="w-full bg-gradient-to-r from-cyan-500 to-blue-500">
                  登录
                </Button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">或使用以下方式登录</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <Button variant="outline" onClick={() => handleThirdPartyLogin('wechat')} className="flex items-center justify-center">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  微信
                </Button>
                <Button variant="outline" onClick={() => handleThirdPartyLogin('qq')} className="flex items-center justify-center">
                  <UserPlus className="h-4 w-4 mr-2" />
                  QQ
                </Button>
                <Button variant="outline" onClick={() => handleThirdPartyLogin('weibo')} className="flex items-center justify-center">
                  <Mail className="h-4 w-4 mr-2" />
                  微博
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="register" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">手机号</label>
                  <Input type="tel" placeholder="请输入手机号" maxLength={11} />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">验证码</label>
                  <div className="flex space-x-2">
                    <Input placeholder="请输入验证码" maxLength={6} />
                    <Button variant="outline">获取验证码</Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">设置密码</label>
                  <Input type="password" placeholder="请设置密码" />
                </div>
                
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <Checkbox defaultChecked />
                    <span className="text-sm">我同意所有合规条款</span>
                  </label>
                </div>
                
                <Button className="w-full bg-gradient-to-r from-cyan-500 to-blue-500">
                  注册
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>;
}