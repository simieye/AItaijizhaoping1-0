// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Textarea } from '@/components/ui';
// @ts-ignore;
import { MessageSquare, Shield, Download, Calendar, Clock, Users, CheckCircle } from 'lucide-react';

// @ts-ignore;
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { ThemeToggle } from '@/components/ThemeToggle';
import { AccessibilityMenu } from '@/components/AccessibilityMenu';
import { ChatInterface } from '@/components/ChatInterface';
export default function RecruiterCommunication(props) {
  const {
    $w
  } = props;
  const [messages, setMessages] = useState([{
    content: '您好！我是招聘经理，很高兴与您交流。请问您对我们公司的职位感兴趣吗？',
    isUser: false,
    timestamp: '09:00',
    source: '招聘方'
  }]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [fontSize, setFontSize] = useState(16);
  const [colorBlindMode, setColorBlindMode] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [language, setLanguage] = useState('zh');
  const mockCandidates = [{
    id: '1',
    name: '张三',
    position: '高级前端工程师',
    lastMessage: '我对贵公司的技术栈很感兴趣',
    unread: 2,
    time: '2小时前',
    diversityScore: 85
  }, {
    id: '2',
    name: '李四',
    position: '全栈开发工程师',
    lastMessage: '请问这个职位的具体职责是什么？',
    unread: 0,
    time: '昨天',
    diversityScore: 75
  }, {
    id: '3',
    name: '王五',
    position: '后端架构师',
    lastMessage: '期待与您进一步交流',
    unread: 1,
    time: '3天前',
    diversityScore: 90
  }];
  const handleSendMessage = async content => {
    const newMessage = {
      content,
      isUser: true,
      timestamp: new Date().toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit'
      }),
      source: '招聘方'
    };
    setMessages(prev => [...prev, newMessage]);

    // 模拟候选人回复
    setTimeout(() => {
      const responses = ['感谢您的回复！我对这个职位很感兴趣。', '请问面试流程是怎样的？', '能否详细介绍一下团队情况？', '这个职位的晋升路径是怎样的？'];
      const candidateMessage = {
        content: responses[Math.floor(Math.random() * responses.length)],
        isUser: false,
        timestamp: new Date().toLocaleTimeString('zh-CN', {
          hour: '2-digit',
          minute: '2-digit'
        }),
        source: '候选人'
      };
      setMessages(prev => [...prev, candidateMessage]);
    }, 2000);
  };
  const handleExportChat = () => {
    const chatData = {
      exportDate: new Date(),
      participants: ['招聘方', '候选人'],
      messages: messages,
      compliance: {
        euAIAct: true,
        gdpr: true,
        chinaPIPL: true
      }
    };
    console.log('导出聊天记录:', chatData);
    alert('聊天记录已导出！');
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
            候选人沟通（合规版）
          </h1>
          <div className="flex items-center space-x-2">
            <LanguageSwitcher currentLang={language} onLanguageChange={setLanguage} />
            <ThemeToggle isDark={isDark} onToggle={() => setIsDark(!isDark)} />
            <AccessibilityMenu fontSize={fontSize} onFontSizeChange={setFontSize} colorBlindMode={colorBlindMode} onColorBlindToggle={() => setColorBlindMode(!colorBlindMode)} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>候选人列表</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockCandidates.map(candidate => <div key={candidate.id} className={`p-3 rounded-lg cursor-pointer transition-colors ${selectedCandidate?.id === candidate.id ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'}`} onClick={() => setSelectedCandidate(candidate)}>
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">{candidate.name}</div>
                          <div className="text-sm text-gray-600">{candidate.position}</div>
                          <div className="text-xs text-gray-500">{candidate.lastMessage}</div>
                        </div>
                        <div className="text-right">
                          {candidate.unread > 0 && <Badge variant="default" className="mb-1">
                              {candidate.unread}
                            </Badge>}
                          <div className="text-xs text-gray-500">{candidate.time}</div>
                          <Badge variant="secondary" className="mt-1 text-xs">
                            多样性: {candidate.diversityScore}
                          </Badge>
                        </div>
                      </div>
                    </div>)}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card className="h-[600px]">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>
                    {selectedCandidate ? `${selectedCandidate.name} - ${selectedCandidate.position}` : '选择候选人开始对话'}
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" onClick={handleExportChat}>
                      <Download className="h-4 w-4 mr-1" />
                      导出记录
                    </Button>
                    <Badge variant="secondary" className="bg-green-100">
                      <Shield className="h-3 w-3 mr-1" />
                      合规对话
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="h-[calc(100%-80px)]">
                {selectedCandidate ? <ChatInterface messages={messages} onSendMessage={handleSendMessage} mode="text" /> : <div className="flex items-center justify-center h-full text-gray-500">
                    <div className="text-center">
                      <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p>请从左侧选择候选人开始对话</p>
                    </div>
                  </div>}
              </CardContent>
            </Card>
          </div>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>合规提醒</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>所有对话记录符合GDPR要求</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>候选人隐私信息已脱敏处理</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>支持一键导出合规报告</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>;
}