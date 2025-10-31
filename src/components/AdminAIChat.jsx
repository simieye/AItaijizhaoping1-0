// @ts-ignore;
import React, { useState, useEffect, useRef } from 'react';
// @ts-ignore;
import { Button, Card, CardContent, Input, ScrollArea, Avatar, AvatarFallback, AvatarImage, Badge, useToast } from '@/components/ui';
// @ts-ignore;
import { MessageSquare, X, Send, Mic, MicOff, Bot, User, Phone, Volume2, VolumeX } from 'lucide-react';

export function AdminAIChat({
  isOpen = false,
  onClose,
  onMessageSent,
  className = ''
}) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isHumanSupport, setIsHumanSupport] = useState(false);
  const messagesEndRef = useRef(null);
  const {
    toast
  } = useToast();

  // 初始化欢迎消息
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        id: '1',
        content: '您好！我是AI管理助手，可以帮您：\n• 查询系统数据\n• 生成合规报告\n• 分析业务趋势\n• 提供技术支持\n\n需要转人工客服请说"转人工"',
        sender: 'bot',
        timestamp: new Date().toISOString(),
        type: 'welcome'
      }]);
    }
  }, [isOpen]);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  const sendMessage = async () => {
    if (!inputMessage.trim()) return;
    const userMessage = {
      id: Date.now().toString(),
      content: inputMessage.trim(),
      sender: 'user',
      timestamp: new Date().toISOString(),
      type: 'text'
    };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);
    try {
      // 模拟AI响应
      setTimeout(() => {
        let botResponse = '';
        if (inputMessage.includes('转人工')) {
          setIsHumanSupport(true);
          botResponse = '正在为您转接人工客服，请稍候...';
        } else if (inputMessage.includes('合规报告')) {
          botResponse = '正在生成合规报告...\n\n📊 当前合规评分：94%\n⚠️ 发现3个潜在风险\n📈 建议优化：职位描述偏见检测\n\n报告已生成，可在"合规审计"模块查看详情。';
        } else if (inputMessage.includes('用户统计')) {
          botResponse = '📈 用户统计概览：\n• 总用户数：1,247人\n• 今日新增：23人\n• 活跃用户：892人\n• 候选人：687人\n• 招聘者：234人\n• 管理员：8人';
        } else if (inputMessage.includes('风险警报')) {
          botResponse = '🚨 当前风险警报：\n• 偏见检测：3个职位需关注\n• 隐私合规：1个数据访问异常\n• 算法透明：2个AI决策需解释\n\n建议立即查看"合规审计"模块';
        } else {
          botResponse = `收到您的消息："${inputMessage}"\n\n我可以帮您：\n1. 查询系统数据\n2. 生成各类报告\n3. 分析业务趋势\n4. 提供技术支持\n\n请告诉我您需要什么帮助？`;
        }
        const botMessage = {
          id: (Date.now() + 1).toString(),
          content: botResponse,
          sender: 'bot',
          timestamp: new Date().toISOString(),
          type: 'response'
        };
        setMessages(prev => [...prev, botMessage]);
        setIsTyping(false);
        onMessageSent?.(userMessage, botMessage);
      }, 1000);
    } catch (error) {
      toast({
        title: '发送失败',
        description: '消息发送失败，请重试',
        variant: 'destructive'
      });
      setIsTyping(false);
    }
  };
  const startListening = () => {
    setIsListening(true);
    toast({
      title: '语音识别',
      description: '正在聆听...'
    });

    // 模拟语音识别
    setTimeout(() => {
      setIsListening(false);
      setInputMessage('帮我生成最新的合规报告');
    }, 2000);
  };
  const stopListening = () => {
    setIsListening(false);
  };
  const toggleMute = () => {
    setIsMuted(!isMuted);
  };
  const requestHumanSupport = () => {
    setIsHumanSupport(true);
    const humanMessage = {
      id: Date.now().toString(),
      content: '正在为您转接人工客服，预计等待时间：2分钟',
      sender: 'bot',
      timestamp: new Date().toISOString(),
      type: 'human-transfer'
    };
    setMessages(prev => [...prev, humanMessage]);
  };
  const formatTime = timestamp => {
    return new Date(timestamp).toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  if (!isOpen) return null;
  return <div className={`${className} fixed inset-y-0 right-0 w-96 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 shadow-lg z-50`}>
      {/* 头部 */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center space-x-2">
          <Bot className="h-5 w-5 text-blue-500" />
          <h3 className="font-semibold">AI管理助手</h3>
          {isHumanSupport && <Badge variant="secondary" className="text-xs">
              人工客服
            </Badge>}
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" onClick={toggleMute} className="p-1">
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="sm" onClick={onClose} className="p-1">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* 消息区域 */}
      <ScrollArea className="flex-1 h-[calc(100vh-200px)] p-4">
        <div className="space-y-4">
          {messages.map(message => <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex items-end space-x-2 max-w-[80%]`}>
                {message.sender === 'bot' && <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>}
                <div className={`rounded-lg px-4 py-2 ${message.sender === 'user' ? 'bg-blue-500 text-white' : message.type === 'human-transfer' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>
                  <p className="text-sm whitespace-pre-line">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">{formatTime(message.timestamp)}</p>
                </div>
                {message.sender === 'user' && <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>}
              </div>
            </div>)}

          {isTyping && <div className="flex justify-start">
              <div className="flex items-end space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-gray-100 rounded-lg px-4 py-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{
                  animationDelay: '0.1s'
                }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{
                  animationDelay: '0.2s'
                }}></div>
                  </div>
                </div>
              </div>
            </div>}

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* 输入区域 */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" onClick={isListening ? stopListening : startListening} className={`${isListening ? 'text-red-500' : ''}`}>
            {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </Button>
          
          <Input value={inputMessage} onChange={e => setInputMessage(e.target.value)} onKeyPress={e => e.key === 'Enter' && !isTyping && sendMessage()} placeholder="输入消息或点击麦克风..." className="flex-1" disabled={isTyping} />
          
          <Button onClick={sendMessage} disabled={isTyping || !inputMessage.trim()} size="sm">
            <Send className="h-4 w-4" />
          </Button>
        </div>

        {/* 快捷操作 */}
        <div className="flex items-center space-x-2 mt-2">
          <Button variant="outline" size="sm" onClick={() => setInputMessage('生成合规报告')} className="text-xs">
            合规报告
          </Button>
          <Button variant="outline" size="sm" onClick={() => setInputMessage('查看用户统计')} className="text-xs">
            用户统计
          </Button>
          <Button variant="outline" size="sm" onClick={requestHumanSupport} className="text-xs">
            <Phone className="h-3 w-3 mr-1" />
            转人工
          </Button>
        </div>
      </div>
    </div>;
}