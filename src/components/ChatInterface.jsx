// @ts-ignore;
import React, { useState, useEffect, useRef } from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, Button, Input, ScrollArea, Avatar, AvatarFallback, AvatarImage, Badge, useToast } from '@/components/ui';
// @ts-ignore;
import { Send, Bot, User, Loader2 } from 'lucide-react';

export function ChatInterface({
  userId = 'anonymous',
  chatId = 'default',
  className = '',
  onMessageSent,
  onError
}) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const [error, setError] = useState(null);
  const {
    toast
  } = useToast();
  const messagesEndRef = useRef(null);

  // 模拟初始消息
  useEffect(() => {
    const initMessages = [{
      id: '1',
      content: '您好！我是AI招聘助手，很高兴为您服务。请问有什么可以帮助您的？',
      sender: 'bot',
      timestamp: new Date().toISOString(),
      type: 'text'
    }];
    setMessages(initMessages);
    setIsConnecting(false);
  }, []);
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
    const newMessage = {
      id: Date.now().toString(),
      content: inputMessage.trim(),
      sender: 'user',
      timestamp: new Date().toISOString(),
      type: 'text'
    };
    setMessages(prev => [...prev, newMessage]);
    setInputMessage('');
    setIsLoading(true);
    setError(null);
    try {
      // 模拟AI响应
      setTimeout(() => {
        const botResponse = {
          id: (Date.now() + 1).toString(),
          content: generateBotResponse(inputMessage),
          sender: 'bot',
          timestamp: new Date().toISOString(),
          type: 'text'
        };
        setMessages(prev => [...prev, botResponse]);
        onMessageSent?.(newMessage, botResponse);
      }, 1000);
    } catch (err) {
      const errorMessage = {
        id: (Date.now() + 2).toString(),
        content: '抱歉，我遇到了一些问题。请稍后再试。',
        sender: 'bot',
        timestamp: new Date().toISOString(),
        type: 'error'
      };
      setMessages(prev => [...prev, errorMessage]);
      setError(err.message);
      onError?.(err);
      toast({
        title: "发送失败",
        description: "消息发送失败，请检查网络连接",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  const generateBotResponse = message => {
    const responses = ["我理解您的问题。关于这个职位，我可以为您提供更多详细信息。", "让我帮您分析一下这个候选人的匹配度。", "这是一个很好的问题。根据我们的AI分析，这个候选人...", "我可以帮您查看这个职位的偏见检测结果。", "让我为您生成一份详细的候选人报告。"];
    return responses[Math.floor(Math.random() * responses.length)];
  };
  const formatTime = timestamp => {
    return new Date(timestamp).toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  if (isConnecting) {
    return <Card className={`${className} w-full max-w-2xl mx-auto`}>
        <CardHeader>
          <CardTitle className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            正在连接...
          </CardTitle>
        </CardHeader>
      </Card>;
  }
  return <Card className={`${className} w-full max-w-2xl mx-auto`}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Bot className="h-5 w-5 mr-2" />
          AI招聘助手
          <Badge variant="secondary" className="ml-2">在线</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {messages.map(message => <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex items-end space-x-2 max-w-[80%]`}>
                  {message.sender === 'bot' && <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>}
                  <div className={`rounded-lg px-4 py-2 ${message.sender === 'user' ? 'bg-blue-500 text-white' : message.type === 'error' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                    <p className="text-sm">{message.content}</p>
                    <p className="text-xs opacity-70 mt-1">{formatTime(message.timestamp)}</p>
                  </div>
                  {message.sender === 'user' && <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>}
                </div>
              </div>)}
            {isLoading && <div className="flex justify-start">
                <div className="flex items-end space-x-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-gray-100 rounded-lg px-4 py-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                </div>
              </div>}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
        
        <div className="mt-4 flex space-x-2">
          <Input value={inputMessage} onChange={e => setInputMessage(e.target.value)} onKeyPress={e => e.key === 'Enter' && !isLoading && sendMessage()} placeholder="输入您的问题..." disabled={isLoading} className="flex-1" />
          <Button onClick={sendMessage} disabled={isLoading || !inputMessage.trim()} size="icon">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </CardContent>
    </Card>;
}