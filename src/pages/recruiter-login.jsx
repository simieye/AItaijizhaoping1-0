// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Button, Input, Card, CardContent, CardDescription, CardHeader, CardTitle, Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui';
// @ts-ignore;
import { Mail, Building, Shield } from 'lucide-react';

import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { ThemeToggle } from '@/components/ThemeToggle';
import { AccessibilityMenu } from '@/components/AccessibilityMenu';
export default function RecruiterLogin(props) {
  const {
    $w
  } = props;
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [fontSize, setFontSize] = useState(16);
  const [colorBlindMode, setColorBlindMode] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [language, setLanguage] = useState('zh');
  const handleSendCode = () => {
    if (email.includes('@')) {
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
  const handleLogin = () => {
    // Mock login success
    $w.utils.navigateTo({
      pageId: 'recruiter-dashboard',
      params: {}
    });
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
          <CardDescription>企业招聘者登录/注册</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">企业登录</TabsTrigger>
              <TabsTrigger value="register">企业注册</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">企业邮箱</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input type="email" placeholder="请输入企业邮箱" value={email} onChange={e => setEmail(e.target.value)} className="pl-10" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">验证码</label>
                  <div className="flex space-x-2">
                    <Input type="text" placeholder="请输入验证码" value={code} onChange={e => setCode(e.target.value)} maxLength={6} />
                    <Button variant="outline" onClick={handleSendCode} disabled={countdown > 0} className="whitespace-nowrap">
                      {countdown > 0 ? `${countdown}s` : '获取验证码'}
                    </Button>
                  </div>
                </div>
                
                <Button onClick={handleLogin} className="w-full bg-gradient-to-r from-cyan-500 to-blue-500">
                  企业登录
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="register" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">企业名称</label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input placeholder="请输入企业名称" className="pl-10" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">企业邮箱</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input type="email" placeholder="请输入企业邮箱" className="pl-10" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">营业执照号</label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input placeholder="请输入营业执照号" className="pl-10" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">验证码</label>
                  <div className="flex space-x-2">
                    <Input placeholder="请输入验证码" maxLength={6} />
                    <Button variant="outline">获取验证码</Button>
                  </div>
                </div>
                
                <Button className="w-full bg-gradient-to-r from-cyan-500 to-blue-500">
                  企业注册
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>;
}