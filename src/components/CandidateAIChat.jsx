// @ts-ignore;
import React, { useState, useEffect, useRef } from 'react';
// @ts-ignore;
import { Button, Card, CardContent, CardHeader, CardTitle, Textarea, useToast } from '@/components/ui';
// @ts-ignore;
import { Send, Bot, User, X, RefreshCw } from 'lucide-react';

// @ts-ignore;
import { cachedCallDataSource } from '@/lib/cache';
export function CandidateAIChat({
  isOpen,
  onClose,
  userId,
  userName,
  jobId = null,
  interviewType = 'general',
  onMessageSent
}) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const {
    toast
  } = useToast();

  // 初始化对话
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      initializeChat();
    }
  }, [isOpen]);

  // 滚动到底部
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  };

  // 初始化对话
  const initializeChat = async () => {
    try {
      const welcomeMessage = getWelcomeMessage(interviewType);
      setMessages([{
        id: Date.now(),
        content: welcomeMessage,
        sender: 'bot',
        timestamp: new Date().toISOString()
      }]);
    } catch (error) {
      console.error('初始化对话失败:', error);
    }
  };

  // 获取欢迎消息
  const getWelcomeMessage = type => {
    const messages = {
      technical: '您好！我是AI技术面试官。我将针对您的技术能力进行评估。请准备好回答一些技术相关的问题。',
      behavioral: '您好！我是AI行为面试官。我将了解您的工作经验和行为特点。请分享一些您过往的经历。',
      general: '您好！我是AI助手。我可以帮助您了解职位信息、准备面试，或回答其他问题。',
      resume: '您好！我来帮您分析简历。请告诉我您想了解哪方面的建议？'
    };
    return messages[type] || messages.general;
  };

  // 发送消息
  const sendMessage = async () => {
    if (!inputMessage.trim() || loading) return;
    const userMessage = {
      id: Date.now(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);
    setTyping(true);
    try {
      // 调用AI服务
      const response = await cachedCallDataSource(null, {
        dataSourceName: 'ai_chat',
        methodName: 'wedaCreateV2',
        params: {
          data: {
            userId,
            userName,
            message: inputMessage,
            jobId,
            interviewType,
            timestamp: new Date().toISOString()
          }
        }
      });

      // 模拟AI响应
      const aiResponse = await generateAIResponse(inputMessage, interviewType);
      const botMessage = {
        id: Date.now() + 1,
        content: aiResponse,
        sender: 'bot',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, botMessage]);
      if (onMessageSent) {
        onMessageSent(userMessage, botMessage);
      }
    } catch (error) {
      console.error('发送消息失败:', error);
      toast({
        title: '发送失败',
        description: '无法连接到AI服务，请稍后重试',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
      setTyping(false);
    }
  };

  // 生成AI响应
  const generateAIResponse = async (message, type) => {
    // 模拟AI响应逻辑
    const responses = {
      technical: ['这是一个很好的技术问题。让我为您详细解答...', '基于您的经验，我建议您关注以下几个方面...', '从技术角度来看，这个问题可以这样解决...'],
      behavioral: ['这是一个很好的经历分享。让我为您提供一些建议...', '根据STAR法则，您可以这样组织您的回答...', '这个经历很好地展示了您的能力...'],
      general: ['感谢您的提问。让我为您提供相关信息...', '这是一个很好的问题。让我为您详细说明...', '基于当前情况，我的建议是...']
    };
    const typeResponses = responses[type] || responses.general;
    return typeResponses[Math.floor(Math.random() * typeResponses.length)];
  };

  // 处理键盘事件
  const handleKeyPress = e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // 清空对话
  const clearChat = () => {
    setMessages([]);
    initializeChat();
  };
  if (!isOpen) return null;
  return <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl h-96 flex flex-col">
        {/* 头部 */}
        <CardHeader className="flex flex-row items-center justify-between border-b p-4">
          <CardTitle className="flex items-center">
            <Bot className="h-5 w-5 mr-2 text-blue-500" />
            <span>AI助手</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={clearChat} className="h-8 w-8 p-0">
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        {/* 消息区域 */}
        <CardContent className="flex-1 overflow-y-auto p-4">
          <div className="space-y-4">
            {messages.map(message => <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${message.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'}`}>
                  <div className="flex items-start">
                    {message.sender === 'bot' && <Bot className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />}
                    {message.sender === 'user' && <User className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />}
                    <div>
                      <p className="text-sm">{message.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>)}
            {typing && <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Bot className="h-4 w-4" />
                    <div className="flex space-x-1">
                      <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{
                    animationDelay: '0.1s'
                  }}></div>
                      <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{
                    animationDelay: '0.2s'
                  }}></div>
                    </div>
                  </div>
                </div>
              </div>}
            <div ref={messagesEndRef} />
          </div>
        </CardContent>

        {/* 输入区域 */}
        <div className="border-t p-4">
          <div className="flex space-x-2">
            <Textarea value={inputMessage} onChange={e => setInputMessage(e.target.value)} onKeyPress={handleKeyPress} placeholder="输入您的问题..." className="flex-1 resize-none" rows={2} disabled={loading} />
            <Button onClick={sendMessage} disabled={!inputMessage.trim() || loading} className="h-full">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>;
}