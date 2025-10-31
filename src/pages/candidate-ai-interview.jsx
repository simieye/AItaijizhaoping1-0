// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Button, Card, CardContent, CardHeader, CardTitle, Badge, Progress, useToast, CardDescription } from '@/components/ui';
// @ts-ignore;
import { Play, Pause, Square, MessageSquare, Clock, CheckCircle, AlertCircle, Mic, MicOff } from 'lucide-react';

// @ts-ignore;
import { CandidateAIChat } from '@/components/CandidateAIChat';
export default function CandidateAIInterview(props) {
  const [currentStage, setCurrentStage] = useState('setup'); // setup, interview, results
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120);
  const [aiChatOpen, setAiChatOpen] = useState(false);
  const [interviewData, setInterviewData] = useState(null);
  const [recordingPermission, setRecordingPermission] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const questions = [{
    id: 1,
    question: '请介绍一下您在上一个项目中的主要职责和成就。',
    category: '项目经验',
    timeLimit: 120,
    keywords: ['项目', '职责', '成就', '结果']
  }, {
    id: 2,
    question: '描述一次您解决技术难题的经历，以及您是如何找到解决方案的。',
    category: '问题解决',
    timeLimit: 120,
    keywords: ['技术难题', '解决方案', '思考过程', '结果']
  }, {
    id: 3,
    question: '您如何保持对新技术的学习和跟进？请举例说明。',
    category: '学习能力',
    timeLimit: 120,
    keywords: ['学习', '新技术', '跟进', '实践']
  }, {
    id: 4,
    question: '在团队合作中，您通常扮演什么角色？请分享一个具体的例子。',
    category: '团队协作',
    timeLimit: 120,
    keywords: ['团队合作', '角色', '协作', '贡献']
  }, {
    id: 5,
    question: '您对我们公司的这个职位有什么了解？为什么认为自己适合这个职位？',
    category: '职位匹配',
    timeLimit: 120,
    keywords: ['公司了解', '职位匹配', '适合原因', '期望']
  }];
  const {
    toast
  } = useToast();
  const {
    $w
  } = props;

  // 初始化面试
  const startInterview = async (jobId, candidateId) => {
    try {
      // 检查麦克风权限
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true
        });
        stream.getTracks().forEach(track => track.stop());
        setRecordingPermission(true);
      }
      setInterviewData({
        jobId,
        candidateId,
        startTime: new Date().toISOString(),
        questions: questions
      });
      setCurrentStage('interview');
      setTimeLeft(questions[0].timeLimit);
      toast({
        title: '面试开始',
        description: '请放松，按顺序回答问题。每个问题限时2分钟。'
      });
    } catch (error) {
      toast({
        title: '权限错误',
        description: '需要麦克风权限才能进行录音面试',
        variant: 'destructive'
      });
    }
  };

  // 录音控制
  const toggleRecording = () => {
    if (!recordingPermission) {
      toast({
        title: '权限错误',
        description: '请先允许麦克风访问',
        variant: 'destructive'
      });
      return;
    }
    setIsRecording(!isRecording);
    if (!isRecording) {
      // 模拟开始录音
      toast({
        title: '开始录音',
        description: '正在录音中...请清晰回答问题'
      });
    } else {
      // 模拟停止录音
      toast({
        title: '录音暂停',
        description: '已暂停录音'
      });
    }
  };

  // 保存回答
  const saveAnswer = async (questionId, answerText, duration) => {
    const newAnswer = {
      questionId,
      answerText,
      duration,
      timestamp: new Date().toISOString(),
      keywords: extractKeywords(answerText),
      sentiment: analyzeSentiment(answerText),
      confidence: calculateConfidence(answerText)
    };
    setAnswers(prev => [...prev, newAnswer]);

    // 保存到数据库
    try {
      await $w.cloud.callDataSource({
        dataSourceName: 'application',
        methodName: 'wedaCreateV2',
        params: {
          data: {
            candidateId: interviewData?.candidateId || 'candidate_demo',
            jobId: interviewData?.jobId || 'job_demo',
            questionId,
            answer: newAnswer,
            status: 'interview_in_progress',
            createdAt: new Date().toISOString()
          }
        }
      });
    } catch (error) {
      console.error('保存回答失败:', error);
    }
  };

  // 文本分析函数
  const extractKeywords = text => {
    const keywords = [];
    questions[currentQuestion]?.keywords?.forEach(keyword => {
      if (text.toLowerCase().includes(keyword.toLowerCase())) {
        keywords.push(keyword);
      }
    });
    return keywords;
  };
  const analyzeSentiment = text => {
    // 简单的情感分析
    const positiveWords = ['优秀', '成功', '满意', '喜欢', '擅长', '经验'];
    const negativeWords = ['困难', '问题', '挑战', '失败', '不足'];
    let score = 0;
    positiveWords.forEach(word => {
      if (text.includes(word)) score += 1;
    });
    negativeWords.forEach(word => {
      if (text.includes(word)) score -= 1;
    });
    if (score > 0) return 'positive';
    if (score < 0) return 'negative';
    return 'neutral';
  };
  const calculateConfidence = text => {
    const wordCount = text.split(' ').length;
    const minWords = 20;
    const maxWords = 100;
    if (wordCount < minWords) return Math.round(wordCount / minWords * 50);
    if (wordCount > maxWords) return 100;
    return Math.round(50 + (wordCount - minWords) / (maxWords - minWords) * 50);
  };

  // 下一个问题
  const nextQuestion = async () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setTimeLeft(questions[currentQuestion + 1].timeLimit);
      setTranscript('');

      // 模拟保存当前回答
      const mockAnswer = `这是第${currentQuestion + 1}个问题的回答示例，包含了相关的关键词和经验分享。`;
      await saveAnswer(questions[currentQuestion].id, mockAnswer, 120 - timeLeft);
    } else {
      await completeInterview();
    }
  };

  // 完成面试
  const completeInterview = async () => {
    const finalAnswer = `这是最后一个问题的回答示例，展示了对公司和职位的深入了解。`;
    await saveAnswer(questions[currentQuestion].id, finalAnswer, 120 - timeLeft);

    // 计算总分
    const totalScore = Math.round(answers.reduce((sum, answer) => sum + answer.confidence, 0) / questions.length);

    // 保存完整面试结果
    try {
      await $w.cloud.callDataSource({
        dataSourceName: 'application',
        methodName: 'wedaCreateV2',
        params: {
          data: {
            candidateId: interviewData?.candidateId || 'candidate_demo',
            jobId: interviewData?.jobId || 'job_demo',
            interviewAnswers: [...answers, {
              questionId: questions[currentQuestion].id,
              answerText: finalAnswer,
              duration: 120 - timeLeft,
              timestamp: new Date().toISOString()
            }],
            totalScore,
            status: 'interview_completed',
            completedAt: new Date().toISOString(),
            createdAt: new Date().toISOString()
          }
        }
      });
    } catch (error) {
      console.error('保存面试结果失败:', error);
    }
    setInterviewData(prev => ({
      ...prev,
      totalScore,
      completedAt: new Date().toISOString()
    }));
    setCurrentStage('results');
  };

  // 格式化时间
  const formatTime = seconds => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // 获取进度颜色
  const getProgressColor = () => {
    const percentage = (currentQuestion + 1) / questions.length * 100;
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 50) return 'bg-blue-500';
    return 'bg-yellow-500';
  };

  // 倒计时
  useEffect(() => {
    let timer;
    if (currentStage === 'interview' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && currentStage === 'interview') {
      nextQuestion();
    }
    return () => clearInterval(timer);
  }, [currentStage, timeLeft]);

  // 渲染不同阶段
  if (currentStage === 'setup') {
    return <div className="min-h-screen bg-gray-50 py-8">
        <style jsx>{`
          body {
            background: #f9fafb;
          }
        `}</style>
        
        <div className="max-w-4xl mx-auto px-4">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>AI面试准备</CardTitle>
              <CardDescription>
                准备好开始您的AI面试之旅
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="font-semibold mb-2">面试流程</h3>
                <ul className="space-y-2 text-sm">
                  <li>• 5个结构化问题，每个限时2分钟</li>
                  <li>• 支持语音录音和文字输入</li>
                  <li>• 实时AI分析和反馈</li>
                  <li>• 面试结果自动保存</li>
                </ul>
              </div>
              
              <div className="bg-yellow-50 p-6 rounded-lg">
                <h3 className="font-semibold mb-2">注意事项</h3>
                <ul className="space-y-2 text-sm">
                  <li>• 请确保网络连接稳定</li>
                  <li>• 使用耳机可获得更好的录音效果</li>
                  <li>• 每个问题有2分钟回答时间</li>
                  <li>• 面试过程中可随时暂停</li>
                </ul>
              </div>
              
              <Button onClick={() => startInterview('job_demo', 'candidate_demo')} className="w-full">
                <Play className="h-4 w-4 mr-2" />
                开始面试
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>;
  }
  if (currentStage === 'results') {
    return <div className="min-h-screen bg-gray-50 py-8">
        <style jsx>{`
          body {
            background: #f9fafb;
          }
        `}</style>
        
        <div className="max-w-4xl mx-auto px-4">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle className="h-6 w-6 text-green-500 mr-2" />
                面试完成！
              </CardTitle>
              <CardDescription>
                您的AI面试已顺利完成，以下是详细分析
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {Math.round(answers.reduce((sum, answer) => sum + answer.confidence, 0) / questions.length) || 85}%
                </div>
                <p className="text-gray-600">综合评分</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{answers.length}</div>
                  <p className="text-sm text-gray-600">已回答问题</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {Math.round(answers.reduce((sum, answer) => sum + answer.keywords.length, 0) / answers.length) || 3}
                  </div>
                  <p className="text-sm text-gray-600">平均关键词</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {Math.round(answers.reduce((sum, answer) => sum + answer.duration, 0) / answers.length) || 90}s
                  </div>
                  <p className="text-sm text-gray-600">平均回答时长</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-semibold">详细分析</h3>
                {answers.map((answer, index) => <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">问题 {index + 1}</span>
                      <Badge variant={answer.sentiment === 'positive' ? 'default' : answer.sentiment === 'negative' ? 'destructive' : 'secondary'}>
                        {answer.sentiment}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      关键词匹配：{answer.keywords.join(', ') || '无'}
                    </p>
                    <p className="text-sm text-gray-600">
                      回答时长：{answer.duration}秒 | 置信度：{answer.confidence}%
                    </p>
                  </div>)}
              </div>
              
              <div className="flex space-x-4">
                <Button onClick={() => $w.utils.navigateTo({
                pageId: 'candidate-dashboard'
              })} className="flex-1">
                  返回仪表板
                </Button>
                <Button variant="outline" onClick={() => setCurrentStage('setup')} className="flex-1">
                  重新面试
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>;
  }

  // 面试进行中界面
  return <div className="min-h-screen bg-gray-50 py-8">
      <style jsx>{`
        body {
          background: #f9fafb;
        }
      `}</style>
      
      <div className="max-w-4xl mx-auto px-4">
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>AI面试进行中</CardTitle>
                <CardDescription>
                  问题 {currentQuestion + 1} / {questions.length}
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-lg">
                <Clock className="h-4 w-4 mr-1" />
                {formatTime(timeLeft)}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* 进度条 */}
            <div className="space-y-2">
              <Progress value={(currentQuestion + 1) / questions.length * 100} className={`h-3 ${getProgressColor()}`} />
              <div className="flex justify-between text-sm text-gray-600">
                <span>进度: {currentQuestion + 1}/{questions.length}</span>
                <span>{Math.round((currentQuestion + 1) / questions.length * 100)}%</span>
              </div>
            </div>

            {/* 问题卡片 */}
            <div className="bg-blue-50 p-6 rounded-lg">
              <div className="flex items-center space-x-2 mb-3">
                <Badge variant="secondary">{questions[currentQuestion].category}</Badge>
                <span className="text-sm text-gray-600">限时2分钟</span>
              </div>
              <h3 className="text-lg font-medium leading-relaxed">
                {questions[currentQuestion].question}
              </h3>
            </div>

            {/* 关键词提示 */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">回答建议包含：</p>
              <div className="flex flex-wrap gap-1">
                {questions[currentQuestion].keywords.map(keyword => <Badge key={keyword} variant="outline" className="text-xs">
                    {keyword}
                  </Badge>)}
              </div>
            </div>

            {/* 录音控制 */}
            <div className="flex justify-center space-x-4">
              <Button variant="outline" size="lg" onClick={toggleRecording} className={`${isRecording ? 'bg-red-500 text-white hover:bg-red-600' : ''}`}>
                {isRecording ? <MicOff className="h-5 w-5 mr-2" /> : <Mic className="h-5 w-5 mr-2" />}
                {isRecording ? '暂停录音' : '开始录音'}
              </Button>
              
              <Button size="lg" onClick={nextQuestion} disabled={isRecording}>
                {currentQuestion < questions.length - 1 ? '下一题' : '完成面试'}
              </Button>
            </div>

            {/* 录音状态 */}
            {isRecording && <div className="text-center">
                <div className="inline-flex items-center space-x-2 text-red-500">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <span>正在录音...</span>
                </div>
              </div>}

            {/* 当前回答预览 */}
            {transcript && <div className="border-t pt-4">
                <h4 className="font-medium mb-2">当前回答：</h4>
                <p className="text-sm text-gray-600">{transcript}</p>
              </div>}

            {/* 已回答问题 */}
            {answers.length > 0 && <div className="border-t pt-4">
                <h4 className="font-medium mb-2">已回答的问题：</h4>
                <div className="space-y-2">
                  {answers.map((answer, index) => <div key={index} className="text-sm text-gray-600">
                      <span className="font-medium">问题{index + 1}：</span> 
                      {answer.answerText.substring(0, 50)}...
                    </div>)}
                </div>
              </div>}
          </CardContent>
        </Card>
      </div>

      {/* AI客服按钮 */}
      <Button className="fixed bottom-6 right-6 rounded-full h-14 w-14 shadow-lg bg-blue-500 hover:bg-blue-600" onClick={() => setAiChatOpen(true)}>
        <MessageSquare className="h-6 w-6" />
      </Button>

      {/* AI客服抽屉 */}
      <CandidateAIChat isOpen={aiChatOpen} onClose={() => setAiChatOpen(false)} userId="candidate_interview_user" userName="面试候选人" onMessageSent={async (userMsg, botMsg) => {
      console.log('面试页面AI对话:', {
        user: userMsg,
        bot: botMsg
      });

      // 保存面试相关的AI对话
      try {
        await $w.cloud.callDataSource({
          dataSourceName: 'chat_message',
          methodName: 'wedaCreateV2',
          params: {
            data: {
              messageId: userMsg.id,
              senderId: 'candidate_interview_user',
              senderName: '面试候选人',
              receiverId: 'ai_assistant',
              receiverName: 'AI面试助手',
              content: userMsg.content,
              messageType: 'interview_support',
              timestamp: userMsg.timestamp,
              conversationId: 'interview_support',
              platform: 'candidate_interview',
              metadata: {
                currentQuestion: currentQuestion + 1,
                totalQuestions: questions.length,
                stage: 'interview'
              }
            }
          }
        });
      } catch (error) {
        console.error('保存面试对话失败:', error);
      }
    }} />
    </div>;
}