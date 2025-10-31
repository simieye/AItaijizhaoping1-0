// @ts-ignore;
import React, { useState, useEffect, useRef } from 'react';
// @ts-ignore;
import { Button, Card, CardContent, CardHeader, CardTitle, Textarea, useToast } from '@/components/ui';
// @ts-ignore;
import { Send, X, Bot, User, MessageSquare } from 'lucide-react';

export function RecruiterAIChat({
  isOpen,
  onClose,
  userId,
  userName,
  onMessageSent
}) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const {
    toast
  } = useToast();

  // 滚动到最新消息
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  };

  // 发送消息
  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;
    const userMessage = {
      id: Date.now(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);
    try {
      // 模拟AI响应
      const botResponse = await generateBotResponse(inputMessage);
      const botMessage = {
        id: Date.now() + 1,
        content: botResponse,
        sender: 'bot',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, botMessage]);
      if (onMessageSent) {
        onMessageSent(userMessage, botMessage);
      }
    } catch (error) {
      toast({
        title: '发送失败',
        description: '无法获取AI回复，请重试',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // 生成AI回复
  const generateBotResponse = async message => {
    // 模拟延迟
    await new Promise(resolve => setTimeout(resolve, 1000));
    const responses = ['我理解您的需求。作为招聘者，您可以使用我们的AI工具来筛选候选人、分析简历匹配度，以及优化职位描述。', '您可以通过仪表板查看候选人的匹配分数和多样性指标，这些数据由我们的AI算法实时计算。', '如果您需要设置特定的筛选条件，我可以帮您配置AI筛选规则，确保找到最合适的候选人。', '我们的系统支持批量处理候选人申请，您可以一次性查看多个候选人的AI评估报告。', '有任何关于AI功能的问题，我都可以为您提供详细的操作指导。'];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  // 初始化欢迎消息
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage = {
        id: Date.now(),
        content: `您好 ${userName}！我是招聘AI助手，可以帮您解答关于候选人筛选、职位发布、数据分析等方面的问题。`,
        sender: 'bot',
        timestamp: new Date().toISOString()
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, userName]);

  // 自动滚动
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  if (!isOpen) return null;
  return <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <style jsx>{`
        .chat-container {
          max-height: 80vh;
          display: flex;
          flex-direction: column;
        }
        .messages-container {
          flex: 1;
          overflow-y: auto;
        }
        .message-bubble {
          max-width: 80%;
          word-wrap: break-word;
        }
      `}</style>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md h-96 flex flex-col">
        {/* 头部 */}
        <CardHeader className="flex flex-row items-center justify-between border-b p-4">
          <div className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg">招聘AI助手</CardTitle>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        {/* 消息区域 */}
        <CardContent className="flex-1 overflow-y-auto p-4 messages-container">
          <div className="space-y-4">
            {messages.map(message => <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${message.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'}`}>
                  <div className="flex items-start space-x-2">
                    {message.sender === 'bot' ? <Bot className="h-4 w-4 mt-0.5 flex-shrink-0" /> : <User className="h-4 w-4 mt-0.5 flex-shrink-0" />}
                    <div>
                      <p className="text-sm">{message.content}</p>
                      <p className="text-xs opacity-75 mt-1">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>)}
            {loading && <div className="flex justify-start">
                <div className="bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Bot className="h-4 w-4" />
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{
                    animationDelay: '0.1s'
                  }} />
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{
                    animationDelay: '0.2s'
                  }} />
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
            <Textarea value={inputMessage} onChange={e => setInputMessage(e.target.value)} placeholder="输入您的问题..." className="flex-1 resize-none" rows={2} onKeyPress={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }} />
            <Button onClick={handleSendMessage} disabled={loading || !inputMessage.trim()} className="self-end">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>;
}