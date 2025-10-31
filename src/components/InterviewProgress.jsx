// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, Progress, Badge, Button } from '@/components/ui';
// @ts-ignore;
import { Clock, Mic, MicOff, Video, VideoOff } from 'lucide-react';

// @ts-ignore;
import { BiasDetectionBar } from '@/components/BiasDetectionBar';
export function InterviewProgress({
  currentQuestion,
  totalQuestions,
  timeLeft,
  question,
  biasScore,
  isRecording,
  cameraEnabled,
  micEnabled,
  onToggleRecording,
  onToggleCamera,
  onToggleMic,
  onAnswer
}) {
  const formatTime = seconds => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  return <Card className="shadow-xl">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>问题 {currentQuestion + 1} / {totalQuestions}</CardTitle>
          <div className="flex items-center space-x-4">
            <Badge variant="outline">剩余时间: {formatTime(timeLeft)}</Badge>
            <BiasDetectionBar score={biasScore} />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-4">{question.question}</h3>
          <p className="text-sm text-gray-600">{question.category}</p>
        </div>
        
        <div className="flex justify-center space-x-4">
          <button onClick={onToggleRecording} className={`p-3 rounded-full ${isRecording ? 'bg-red-500 text-white' : 'bg-gray-200'}`}>
            {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
          
          <button onClick={onToggleCamera} className={`p-3 rounded-full ${cameraEnabled ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
            {cameraEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </button>
          
          <button onClick={onToggleMic} className={`p-3 rounded-full ${micEnabled ? 'bg-green-500 text-white' : 'bg-gray-200'}`}>
            {micEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </button>
        </div>
        
        <Progress value={timeLeft / question.timeLimit * 100} className="w-full" />
        
        <div className="flex justify-between">
          <Button variant="outline" onClick={() => onAnswer('skip')}>
            跳过此题
          </Button>
          <Button onClick={() => onAnswer('complete')} className="bg-gradient-to-r from-cyan-500 to-blue-500">
            回答完成
          </Button>
        </div>
      </CardContent>
    </Card>;
}