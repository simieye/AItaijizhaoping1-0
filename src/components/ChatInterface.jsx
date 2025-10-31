// @ts-ignore;
import React, { useState, useRef, useEffect } from 'react';
// @ts-ignore;
import { Send, Mic, Video, MessageSquare, Smile } from 'lucide-react';
// @ts-ignore;
import { Button, Input, Card, Badge } from '@/components/ui';

export function ChatInterface({
  messages = [],
  onSendMessage,
  mode = 'text',
  onModeChange
}) {
  const [inputValue, setInputValue] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  const handleSend = () => {
    if (inputValue.trim()) {
      onSendMessage(inputValue);
      setInputValue('');
    }
  };
  const handleKeyPress = e => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };
  return <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-2">
          <Button variant={mode === 'text' ? 'default' : 'ghost'} size="sm" onClick={() => onModeChange('text')}>
            <MessageSquare className="h-4 w-4" />
          </Button>
          <Button variant={mode === 'voice' ? 'default' : 'ghost'} size="sm" onClick={() => onModeChange('voice')}>
            <Mic className="h-4 w-4" />
          </Button>
          <Button variant={mode === 'video' ? 'default' : 'ghost'} size="sm" onClick={() => onModeChange('video')}>
            <Video className="h-4 w-4" />
          </Button>
        </div>
        <Badge variant="secondary">AI面试官</Badge>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => <div key={index} className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
            <Card className={`max-w-xs lg:max-w-md p-3 ${message.isUser ? 'bg-cyan-500 text-white' : 'bg-gray-100 dark:bg-gray-800'}`}>
              <p className="text-sm">{message.content}</p>
              {message.emotion && <div className="flex items-center mt-2">
                  <Smile className="h-4 w-4 mr-1" />
                  <span className="text-xs">{message.emotion}</span>
                </div>}
              {message.timestamp && <p className="text-xs opacity-70 mt-1">
                  {message.timestamp}
                </p>}
            </Card>
          </div>)}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t">
        <div className="flex items-center space-x-2">
          <Input value={inputValue} onChange={e => setInputValue(e.target.value)} onKeyPress={handleKeyPress} placeholder={mode === 'text' ? '输入消息...' : mode === 'voice' ? '点击麦克风开始录音...' : '视频通话中...'} className="flex-1" />
          {mode === 'text' && <Button onClick={handleSend} size="icon">
              <Send className="h-4 w-4" />
            </Button>}
          {mode === 'voice' && <Button onClick={() => setIsRecording(!isRecording)} size="icon" variant={isRecording ? 'destructive' : 'default'}>
              <Mic className="h-4 w-4" />
            </Button>}
        </div>
      </div>
    </div>;
}