// @ts-ignore;
import React, { useState, useEffect, useCallback } from 'react';
// @ts-ignore;
import { Button, Card, CardContent, CardHeader, CardTitle, Progress, Badge, Alert, AlertDescription, AlertTitle, useToast, Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui';
// @ts-ignore;
import { Mic, MicOff, Video, VideoOff, MessageSquare, Clock, CheckCircle, AlertCircle, RefreshCw, Eye, EyeOff, Play, Pause, Square, Settings, Volume2, VolumeX } from 'lucide-react';

// @ts-ignore;
import { InterviewSetup } from '@/components/InterviewSetup';
// @ts-ignore;
import { InterviewProgress } from '@/components/InterviewProgress';
// @ts-ignore;
import { InterviewResults } from '@/components/InterviewResults';
// @ts-ignore;
import { ChatInterface } from '@/components/ChatInterface';
// @ts-ignore;
import { cachedCallDataSource } from '@/lib/cache';
export default function CandidateAIInterview(props) {
  const [interviewState, setInterviewState] = useState('setup'); // setup, preparing, active, paused, completed
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [responses, setResponses] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [microphoneEnabled, setMicrophoneEnabled] = useState(true);
  const [interviewConfig, setInterviewConfig] = useState({
    position: '',
    experience: '',
    difficulty: 'medium',
    duration: 30,
    questions: 5,
    includeTechnical: true,
    includeBehavioral: true
  });
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [candidateProfile, setCandidateProfile] = useState(null);
  const [interviewSession, setInterviewSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [videoStream, setVideoStream] = useState(null);
  const {
    toast
  } = useToast();
  const {
    $w
  } = props;

  // 获取候选人信息
  useEffect(() => {
    const fetchCandidateProfile = async () => {
      try {
        const userId = props.$w.auth.currentUser?.userId;
        if (!userId) {
          $w.utils.navigateTo({
            pageId: 'candidate-login'
          });
          return;
        }
        const response = await cachedCallDataSource($w, {
          dataSourceName: 'candidate_profile',
          methodName: 'wedaGetRecordsV2',
          params: {
            filter: {
              where: {
                userId: {
                  $eq: userId
                }
              }
            },
            select: {
              $master: true
            }
          }
        });
        if (response.records && response.records.length > 0) {
          setCandidateProfile(response.records[0]);
          // 初始化聊天消息
          setChatMessages([{
            id: 1,
            type: 'bot',
            content: `欢迎${response.records[0].name || ''}！我是您的AI面试助手。请设置面试参数，我将为您生成个性化的面试问题。`,
            timestamp: new Date().toISOString()
          }]);
        }
      } catch (error) {
        console.error('获取候选人信息失败:', error);
        toast({
          title: '获取信息失败',
          description: '无法加载候选人信息',
          variant: 'destructive'
        });
      }
    };
    fetchCandidateProfile();
  }, []);

  // 初始化面试会话
  const initializeInterview = async config => {
    try {
      setLoading(true);
      setError('');
      setInterviewConfig(config);

      // 创建面试会话
      const sessionResponse = await cachedCallDataSource($w, {
        dataSourceName: 'interview',
        methodName: 'wedaCreateV2',
        params: {
          data: {
            candidateId: props.$w.auth.currentUser?.userId,
            position: config.position,
            experience: config.experience,
            difficulty: config.difficulty,
            duration: config.duration,
            questions: config.questions,
            status: 'preparing',
            createdAt: new Date().toISOString(),
            config: JSON.stringify(config)
          }
        }
      });
      setInterviewSession(sessionResponse);
      setInterviewState('preparing');

      // 生成面试问题
      await generateQuestions(config);
      setInterviewState('active');
      setTimeLeft(config.duration * 60); // 转换为秒

      toast({
        title: '面试准备就绪',
        description: `AI面试已开始，共${config.questions}个问题`,
        variant: 'success'
      });
    } catch (error) {
      console.error('初始化面试失败:', error);
      setError('初始化面试失败，请重试');
      toast({
        title: '初始化失败',
        description: error.message || '无法开始面试',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // 生成面试问题
  const generateQuestions = async config => {
    try {
      // 模拟AI生成问题
      const questions = [];

      // 技术问题
      if (config.includeTechnical) {
        questions.push({
          id: 1,
          type: 'technical',
          question: `请解释${config.position}中常用的${config.difficulty === 'easy' ? '基础概念' : config.difficulty === 'medium' ? '设计模式' : '系统架构'}？`,
          timeLimit: 180,
          expectedAnswer: '详细的技术解释...'
        });
        questions.push({
          id: 2,
          type: 'technical',
          question: `描述一个您解决过的${config.position}相关的技术挑战？`,
          timeLimit: 240,
          expectedAnswer: '具体的项目案例...'
        });
      }

      // 行为问题
      if (config.includeBehavioral) {
        questions.push({
          id: 3,
          type: 'behavioral',
          question: '讲述一次您在团队中解决冲突的经历？',
          timeLimit: 180,
          expectedAnswer: 'STAR法则回答...'
        });
        questions.push({
          id: 4,
          type: 'behavioral',
          question: '您如何处理工作压力和紧迫的截止日期？',
          timeLimit: 120,
          expectedAnswer: '压力管理策略...'
        });
      }

      // 根据经验调整问题
      if (config.experience === 'senior') {
        questions.push({
          id: 5,
          type: 'leadership',
          question: '作为高级开发者，您如何指导初级团队成员？',
          timeLimit: 300,
          expectedAnswer: '团队管理和指导经验...'
        });
      } else {
        questions.push({
          id: 5,
          type: 'motivation',
          question: '为什么选择这个职位？您的职业规划是什么？',
          timeLimit: 120,
          expectedAnswer: '职业目标和动机...'
        });
      }
      setCurrentQuestion(questions[0]);
      setResponses([]);
    } catch (error) {
      console.error('生成问题失败:', error);
      throw error;
    }
  };

  // 开始录音
  const startRecording = async () => {
    try {
      // 模拟录音开始
      setIsRecording(true);

      // 模拟音频级别
      const audioInterval = setInterval(() => {
        setAudioLevel(Math.random() * 100);
      }, 100);

      // 停止录音时清除
      setTimeout(() => {
        clearInterval(audioInterval);
      }, 5000);
      toast({
        title: '录音开始',
        description: '请开始回答',
        variant: 'success'
      });
    } catch (error) {
      console.error('录音失败:', error);
      toast({
        title: '录音失败',
        description: '无法访问麦克风',
        variant: 'destructive'
      });
    }
  };

  // 停止录音
  const stopRecording = () => {
    setIsRecording(false);
    setAudioLevel(0);

    // 模拟保存回答
    const response = {
      questionId: currentQuestion.id,
      question: currentQuestion.question,
      answer: '模拟回答内容...',
      duration: 120,
      timestamp: new Date().toISOString()
    };
    setResponses(prev => [...prev, response]);

    // 保存到数据库
    saveResponse(response);
    toast({
      title: '回答已记录',
      description: '回答已保存',
      variant: 'success'
    });
  };

  // 保存回答
  const saveResponse = async response => {
    try {
      await cachedCallDataSource($w, {
        dataSourceName: 'interview_response',
        methodName: 'wedaCreateV2',
        params: {
          data: {
            interviewId: interviewSession?.id,
            questionId: response.questionId,
            question: response.question,
            answer: response.answer,
            duration: response.duration,
            timestamp: response.timestamp
          }
        }
      });
    } catch (error) {
      console.error('保存回答失败:', error);
    }
  };

  // 下一个问题
  const nextQuestion = () => {
    if (responses.length >= interviewConfig.questions) {
      completeInterview();
      return;
    }

    // 模拟下一个问题
    const nextQuestionIndex = responses.length;
    const questions = [{
      id: nextQuestionIndex + 1,
      type: 'technical',
      question: `请描述${interviewConfig.position}中的性能优化策略？`,
      timeLimit: 180,
      expectedAnswer: '性能优化方法...'
    }, {
      id: nextQuestionIndex + 1,
      type: 'behavioral',
      question: '您如何处理代码审查中的反馈？',
      timeLimit: 120,
      expectedAnswer: '代码审查经验...'
    }];
    setCurrentQuestion(questions[0]);
  };

  // 完成面试
  const completeInterview = async () => {
    try {
      setLoading(true);
      setInterviewState('completed');

      // AI分析回答
      const analysis = await analyzeResponses();
      setAiAnalysis(analysis);

      // 更新面试状态
      await cachedCallDataSource($w, {
        dataSourceName: 'interview',
        methodName: 'wedaUpdateV2',
        params: {
          data: {
            status: 'completed',
            completedAt: new Date().toISOString(),
            responses: JSON.stringify(responses),
            analysis: JSON.stringify(analysis)
          },
          filter: {
            where: {
              _id: {
                $eq: interviewSession?.id
              }
            }
          }
        }
      });
      toast({
        title: '面试完成',
        description: 'AI分析已完成，请查看结果',
        variant: 'success'
      });
    } catch (error) {
      console.error('完成面试失败:', error);
      toast({
        title: '完成失败',
        description: '无法完成面试',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // AI分析回答
  const analyzeResponses = async () => {
    try {
      // 模拟AI分析
      return {
        overallScore: 85,
        technicalScore: 88,
        behavioralScore: 82,
        communicationScore: 90,
        strengths: ['技术深度', '项目经验', '沟通能力', '团队协作'],
        improvements: ['可以增加更多细节', '建议提供更多具体案例', '考虑展示更多领导经验'],
        recommendations: ['适合高级开发职位', '建议关注技术深度', '可以考虑技术管理方向'],
        detailedFeedback: {
          technical: '技术回答准确，展示了良好的问题解决能力',
          behavioral: '行为问题回答得体，体现了良好的团队协作精神',
          communication: '表达清晰，逻辑性强'
        }
      };
    } catch (error) {
      console.error('AI分析失败:', error);
      throw error;
    }
  };

  // 暂停/继续面试
  const togglePause = () => {
    if (interviewState === 'active') {
      setInterviewState('paused');
    } else if (interviewState === 'paused') {
      setInterviewState('active');
    }
  };

  // 重新开始面试
  const restartInterview = () => {
    setInterviewState('setup');
    setCurrentQuestion(null);
    setResponses([]);
    setAiAnalysis(null);
    setInterviewSession(null);
  };

  // 处理AI聊天
  const handleChatMessage = async message => {
    const newMessage = {
      id: Date.now(),
      type: 'user',
      content: message,
      timestamp: new Date().toISOString()
    };
    setChatMessages(prev => [...prev, newMessage]);

    // AI回复
    setTimeout(() => {
      const aiResponse = {
        id: Date.now() + 1,
        type: 'bot',
        content: getAIResponse(message),
        timestamp: new Date().toISOString()
      };
      setChatMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  // 获取AI回复
  const getAIResponse = message => {
    const responses = {
      'help': '我可以帮您：1) 面试技巧指导 2) 问题回答建议 3) 时间管理提醒 4) 技术问题解答',
      'tips': '面试技巧：保持眼神交流，回答问题时使用STAR法则，展示具体项目经验',
      'time': `剩余时间：${Math.floor(timeLeft / 60)}分${timeLeft % 60}秒`,
      'question': `当前问题：${currentQuestion?.question || '暂无问题'}`,
      'score': `当前回答质量评分：${Math.floor(Math.random() * 20) + 80}分`
    };
    return responses[message.toLowerCase()] || '我理解您的问题，让我为您提供一些建议...';
  };

  // 倒计时
  useEffect(() => {
    let interval;
    if (interviewState === 'active' && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            completeInterview();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [interviewState, timeLeft]);

  // 渲染面试设置
  const renderSetup = () => <Card>
      <CardHeader>
        <CardTitle>AI面试设置</CardTitle>
      </CardHeader>
      <CardContent>
        <InterviewSetup config={interviewConfig} onConfigChange={setInterviewConfig} onStart={initializeInterview} loading={loading} />
      </CardContent>
    </Card>;

  // 渲染面试进行中
  const renderActiveInterview = () => <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>AI面试进行中</span>
            <div className="flex items-center space-x-2">
              <Badge variant="outline">
                <Clock className="h-4 w-4 mr-1" />
                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
              </Badge>
              <Badge variant="outline">
                {responses.length}/{interviewConfig.questions}
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <InterviewProgress currentQuestion={currentQuestion} responses={responses} isRecording={isRecording} audioLevel={audioLevel} cameraEnabled={cameraEnabled} microphoneEnabled={microphoneEnabled} onStartRecording={startRecording} onStopRecording={stopRecording} onNextQuestion={nextQuestion} onToggleCamera={() => setCameraEnabled(!cameraEnabled)} onToggleMicrophone={() => setMicrophoneEnabled(!microphoneEnabled)} onTogglePause={togglePause} interviewState={interviewState} />
        </CardContent>
      </Card>

      {/* 控制面板 */}
      <Card>
        <CardHeader>
          <CardTitle>面试控制</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center space-x-4">
            <Button variant={isRecording ? "destructive" : "default"} onClick={isRecording ? stopRecording : startRecording} className="flex items-center space-x-2">
              {isRecording ? <Square className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              <span>{isRecording ? '停止录音' : '开始录音'}</span>
            </Button>
            
            <Button variant="outline" onClick={togglePause} className="flex items-center space-x-2">
              {interviewState === 'paused' ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
              <span>{interviewState === 'paused' ? '继续' : '暂停'}</span>
            </Button>
            
            <Button variant="outline" onClick={restartInterview} className="flex items-center space-x-2">
              <RefreshCw className="h-4 w-4" />
              <span>重新开始</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>;

  // 渲染面试结果
  const renderResults = () => <Card>
      <CardHeader>
        <CardTitle>面试结果</CardTitle>
      </CardHeader>
      <CardContent>
        <InterviewResults analysis={aiAnalysis} responses={responses} onRestart={restartInterview} onNextStep={() => $w.utils.navigateTo({
        pageId: 'candidate-dashboard'
      })} />
      </CardContent>
    </Card>;
  if (loading) {
    return <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <style jsx>{`
          body {
            background: linear-gradient(135deg, #eff6ff 0%, #ffffff 50%, #faf5ff 100%);
          }
          .dark body {
            background: linear-gradient(135deg, #111827 0%, #1f2937 50%, #374151 100%);
          }
        `}</style>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-32 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-64"></div>
          </div>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <style jsx>{`
        body {
          background: linear-gradient(135deg, #eff6ff 0%, #ffffff 50%, #faf5ff 100%);
        }
        .dark body {
          background: linear-gradient(135deg, #111827 0%, #1f2937 50%, #374151 100%);
        }
      `}</style>

      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            AI智能面试
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            体验个性化的AI面试，获得专业反馈
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 主内容区域 */}
          <div className="lg:col-span-2">
            {interviewState === 'setup' && renderSetup()}
            {interviewState === 'active' && renderActiveInterview()}
            {interviewState === 'paused' && renderActiveInterview()}
            {interviewState === 'completed' && renderResults()}
          </div>

          {/* 侧边栏 */}
          <div>
            {/* 面试统计 */}
            <Card>
              <CardHeader>
                <CardTitle>面试统计</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">已回答问题</span>
                    <Badge>{responses.length}/{interviewConfig.questions}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">剩余时间</span>
                    <Badge variant="outline">
                      {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                    </Badge>
                  </div>
                  {aiAnalysis && <div className="flex justify-between">
                      <span className="text-sm text-gray-600">综合评分</span>
                      <Badge variant="outline" className="bg-green-100 text-green-800">
                        {aiAnalysis.overallScore}/100
                      </Badge>
                    </div>}
                </div>
              </CardContent>
            </Card>

            {/* AI助手 */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>AI助手</span>
                  <Button variant="ghost" size="sm" onClick={() => setShowChat(!showChat)}>
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {showChat && <ChatInterface messages={chatMessages} onSendMessage={handleChatMessage} placeholder="询问面试相关问题..." title="AI面试助手" />}
              </CardContent>
            </Card>

            {/* 快速操作 */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>快速操作</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start" onClick={() => $w.utils.navigateTo({
                  pageId: 'candidate-dashboard'
                })}>
                    返回仪表板
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => $w.utils.navigateTo({
                  pageId: 'candidate-resume-upload'
                })}>
                    上传简历
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* AI助手按钮 */}
      <Button className="fixed bottom-6 right-6 rounded-full h-14 w-14 shadow-lg bg-blue-500 hover:bg-blue-600" onClick={() => setShowChat(!showChat)}>
        <MessageSquare className="h-6 w-6" />
      </Button>

      {/* AI聊天界面 */}
      {showChat && <div className="fixed bottom-20 right-6 w-80 h-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl border">
          <ChatInterface messages={chatMessages} onSendMessage={handleChatMessage} placeholder="询问面试相关问题..." title="AI面试助手" onClose={() => setShowChat(false)} />
        </div>}
    </div>;
}