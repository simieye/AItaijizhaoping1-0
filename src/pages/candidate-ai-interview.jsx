// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Progress, Alert, AlertDescription } from '@/components/ui';
// @ts-ignore;
import { Mic, Video, MessageSquare, Clock, Smile, TrendingUp, CheckCircle, Download, Shield } from 'lucide-react';

// @ts-ignore;
import { ChatInterface } from '@/components/ChatInterface';
import { BiasDetectionBar } from '@/components/BiasDetectionBar';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { ThemeToggle } from '@/components/ThemeToggle';
import { AccessibilityMenu } from '@/components/AccessibilityMenu';
export default function CandidateAIInterview(props) {
  const {
    $w
  } = props;
  const [messages, setMessages] = useState([{
    content: '您好！我是AI面试官小太极。请先简单介绍一下自己吧。请注意，所有AI决策都将由人类进行最终复核。',
    isUser: false,
    timestamp: '14:30',
    source: 'AI'
  }]);
  const [mode, setMode] = useState('text');
  const [interviewProgress, setInterviewProgress] = useState(25);
  const [biasScore, setBiasScore] = useState(3);
  const [humanReviewWeight, setHumanReviewWeight] = useState(70);
  const [showXAIReport, setShowXAIReport] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const [colorBlindMode, setColorBlindMode] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [language, setLanguage] = useState('zh');
  const [emotionData, setEmotionData] = useState([{
    emotion: '自信',
    value: 75
  }, {
    emotion: '专注',
    value: 85
  }, {
    emotion: '热情',
    value: 60
  }, {
    emotion: '紧张',
    value: 30
  }]);
  useEffect(() => {
    // 模拟偏见检测
    const timer = setInterval(() => {
      setBiasScore(Math.floor(Math.random() * 8) + 1);
    }, 5000);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    // 模拟面试进度
    const timer = setInterval(() => {
      setInterviewProgress(prev => Math.min(100, prev + 5));
    }, 30000);
    return () => clearInterval(timer);
  }, []);
  const handleSendMessage = async content => {
    const newMessage = {
      content,
      isUser: true,
      timestamp: new Date().toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit'
      }),
      source: '用户'
    };
    setMessages([...messages, newMessage]);

    // 保存消息到数据库
    try {
      await $w.cloud.callDataSource({
        dataSourceName: 'chat_message',
        methodName: 'wedaCreateV2',
        params: {
          data: {
            candidateId: $w.auth.currentUser?.userId || 'mock-user-id',
            message: content,
            isUser: true,
            timestamp: new Date(),
            biasScore
          }
        }
      });
    } catch (error) {
      console.error('消息保存失败:', error);
    }

    // 模拟AI回复
    setTimeout(() => {
      const aiResponses = ['很好！能详细说说你在React项目中的具体贡献吗？', '你如何处理团队中的技术分歧？', '请描述一次你解决复杂bug的经历。', '你对AI在招聘中的应用有什么看法？'];
      const aiMessage = {
        content: aiResponses[Math.floor(Math.random() * aiResponses.length)],
        isUser: false,
        emotion: ['自信', '专业', '友好'][Math.floor(Math.random() * 3)],
        timestamp: new Date().toLocaleTimeString('zh-CN', {
          hour: '2-digit',
          minute: '2-digit'
        }),
        source: 'AI'
      };
      setMessages(prev => [...prev, aiMessage]);
    }, 1500);
  };
  const generateXAIReport = async () => {
    // 生成AI决策解释报告
    const report = {
      candidateId: $w.auth.currentUser?.userId || 'mock-user-id',
      interviewId: 'mock-interview-123',
      decisions: [{
        question: '技术能力评估',
        aiScore: 85,
        humanReview: 70,
        explanation: '基于代码质量、项目经验和技术深度综合评估'
      }, {
        question: '沟通能力评估',
        aiScore: 78,
        humanReview: 82,
        explanation: '基于语言表达清晰度和逻辑性评估'
      }],
      biasAnalysis: {
        detectedBias: 3,
        threshold: 5,
        recommendations: ['增加技术测试环节', '邀请更多面试官参与']
      },
      generatedAt: new Date()
    };
    console.log('XAI报告生成:', report);
    setShowXAIReport(true);
  };
  return <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 p-4`}>
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

      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">
            AI智能面试（合规版）
          </h1>
          <div className="flex items-center space-x-2">
            <LanguageSwitcher currentLang={language} onLanguageChange={setLanguage} />
            <ThemeToggle isDark={isDark} onToggle={() => setIsDark(!isDark)} />
            <AccessibilityMenu fontSize={fontSize} onFontSizeChange={setFontSize} colorBlindMode={colorBlindMode} onColorBlindToggle={() => setColorBlindMode(!colorBlindMode)} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <Card className="h-[600px]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>AI面试对话</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">
                      <Clock className="h-4 w-4 mr-1" />
                      预计剩余15分钟
                    </Badge>
                    <Badge variant="secondary" className="bg-green-100">
                      人类复核权重: {humanReviewWeight}%
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="h-[calc(100%-80px)]">
                <ChatInterface messages={messages} onSendMessage={handleSendMessage} mode={mode} onModeChange={setMode} />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">合规监控</CardTitle>
              </CardHeader>
              <CardContent>
                <BiasDetectionBar score={biasScore} threshold={5} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">面试进度</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>总体进度</span>
                      <span>{interviewProgress}%</span>
                    </div>
                    <Progress value={interviewProgress} />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
                      <span>自我介绍</span>
                    </div>
                    <div className="flex items-center">
                      <TrendingUp className="h-4 w-4 mr-1 text-blue-500" />
                      <span>技能评估</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1 text-gray-400" />
                      <span>项目经验</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1 text-gray-400" />
                      <span>Q&A环节</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">情绪分析</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {emotionData.map(item => <div key={item.emotion} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{item.emotion}</span>
                        <span>{item.value}%</span>
                      </div>
                      <Progress value={item.value} className="h-2" />
                    </div>)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">AI决策解释</CardTitle>
              </CardHeader>
              <CardContent>
                <Button onClick={generateXAIReport} className="w-full" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  生成XAI报告
                </Button>
                {showXAIReport && <Alert className="mt-2">
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      AI决策解释报告已生成，包含偏见分析和人类复核建议
                    </AlertDescription>
                  </Alert>}
              </CardContent>
            </Card>

            <Alert className="border-blue-500 bg-blue-50">
              <Shield className="h-4 w-4" />
              <AlertDescription>
                <strong>合规提醒</strong>
                <br />
                所有AI评估结果将由人类面试官进行最终复核，确保公平性
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </div>
    </div>;
}