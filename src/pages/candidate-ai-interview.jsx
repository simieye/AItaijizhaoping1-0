// @ts-ignore;
import React, { useState, useEffect, useCallback } from 'react';
// @ts-ignore;
import { Button, Card, CardContent, CardHeader, CardTitle, Progress, Badge, Alert, AlertDescription, AlertTitle, useToast } from '@/components/ui';
// @ts-ignore;
import { Play, Pause, Square, RotateCcw, MessageSquare, CheckCircle, AlertCircle, Clock, Eye, EyeOff } from 'lucide-react';

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
  const [interviewState, setInterviewState] = useState('setup'); // setup, in-progress, completed
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [interviewResults, setInterviewResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [candidateProfile, setCandidateProfile] = useState(null);
  const [resumeData, setResumeData] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [interviewConfig, setInterviewConfig] = useState({
    duration: 30,
    questionCount: 5,
    difficulty: 'medium',
    jobType: 'frontend',
    includeTechnical: true,
    includeBehavioral: true
  });
  const {
    toast
  } = useToast();
  const {
    $w
  } = props;

  // 获取候选人信息和简历数据
  useEffect(() => {
    const fetchCandidateData = async () => {
      try {
        const userId = props.$w.auth.currentUser?.userId;
        if (!userId) {
          $w.utils.navigateTo({
            pageId: 'candidate-login'
          });
          return;
        }

        // 获取候选人资料
        const profileResponse = await cachedCallDataSource($w, {
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
        if (profileResponse.records && profileResponse.records.length > 0) {
          setCandidateProfile(profileResponse.records[0]);
          setResumeData(profileResponse.records[0].resumeAnalysis || null);
        }

        // 从URL参数获取简历数据
        const urlParams = new URLSearchParams(window.location.search);
        const resumeDataParam = urlParams.get('resumeData');
        if (resumeDataParam) {
          try {
            setResumeData(JSON.parse(decodeURIComponent(resumeDataParam)));
          } catch (e) {
            console.error('解析简历数据失败:', e);
          }
        }
      } catch (error) {
        console.error('获取候选人数据失败:', error);
        toast({
          title: '获取数据失败',
          description: '无法加载候选人信息',
          variant: 'destructive'
        });
      }
    };
    fetchCandidateData();
  }, []);

  // 生成面试问题
  const generateQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const baseQuestions = {
        frontend: [{
          id: 1,
          type: 'technical',
          question: '请解释React中的虚拟DOM是如何工作的？',
          expectedAnswer: '虚拟DOM是React的核心概念，它是一个轻量级的JavaScript对象，是真实DOM的抽象表示...',
          timeLimit: 180
        }, {
          id: 2,
          type: 'technical',
          question: '如何处理React中的状态管理？请比较Redux和Context API的优缺点。',
          expectedAnswer: '状态管理可以通过多种方式实现：1) useState和useReducer用于组件级状态...',
          timeLimit: 240
        }, {
          id: 3,
          type: 'behavioral',
          question: '描述一次你解决复杂技术问题的经历。',
          expectedAnswer: '好的回答应该包括：问题背景、分析过程、解决方案、结果和学习...',
          timeLimit: 300
        }],
        backend: [{
          id: 1,
          type: 'technical',
          question: '解释RESTful API和GraphQL的区别。',
          expectedAnswer: 'RESTful API是基于资源的架构风格，使用HTTP方法进行操作...',
          timeLimit: 180
        }],
        fullstack: [{
          id: 1,
          type: 'technical',
          question: '如何设计一个高并发的Web应用架构？',
          expectedAnswer: '高并发架构设计需要考虑：负载均衡、缓存策略、数据库优化...',
          timeLimit: 300
        }]
      };

      // 根据配置生成问题
      const jobQuestions = baseQuestions[interviewConfig.jobType] || baseQuestions.frontend;
      const selectedQuestions = jobQuestions.slice(0, interviewConfig.questionCount);

      // 根据简历数据个性化问题
      if (resumeData && resumeData.skills) {
        const personalizedQuestions = selectedQuestions.map(q => {
          if (q.type === 'technical' && resumeData.skills.includes('React')) {
            return {
              ...q,
              question: q.question.includes('React') ? q.question : `${q.question} (基于您的React经验)`
            };
          }
          return q;
        });
        setQuestions(personalizedQuestions);
      } else {
        setQuestions(selectedQuestions);
      }
    } catch (error) {
      console.error('生成问题失败:', error);
      setError('无法生成面试问题，请重试');
    } finally {
      setLoading(false);
    }
  }, [interviewConfig, resumeData]);

  // 开始面试
  const startInterview = async () => {
    setLoading(true);
    try {
      await generateQuestions();
      setInterviewState('in-progress');
      setCurrentQuestion(0);
      setAnswers([]);
      setTimeLeft(questions[0]?.timeLimit || 180);

      // 记录面试开始
      await saveInterviewStart();
      toast({
        title: '面试开始',
        description: 'AI面试已启动，请准备好回答问题',
        variant: 'success'
      });
    } catch (error) {
      console.error('开始面试失败:', error);
      toast({
        title: '开始失败',
        description: '无法启动面试，请重试',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // 保存面试开始记录
  const saveInterviewStart = async () => {
    try {
      const userId = props.$w.auth.currentUser?.userId;
      if (!userId) return;
      await cachedCallDataSource($w, {
        dataSourceName: 'candidate_profile',
        methodName: 'wedaUpdateV2',
        params: {
          data: {
            lastInterviewDate: new Date().toISOString(),
            interviewConfig: interviewConfig
          },
          filter: {
            where: {
              userId: {
                $eq: userId
              }
            }
          }
        }
      });
    } catch (error) {
      console.error('保存面试记录失败:', error);
    }
  };

  // 处理答案
  const handleAnswer = async answer => {
    const newAnswers = [...answers, {
      questionId: questions[currentQuestion].id,
      question: questions[currentQuestion].question,
      answer,
      timestamp: new Date().toISOString()
    }];
    setAnswers(newAnswers);

    // 保存答案
    await saveAnswer(questions[currentQuestion].id, answer);

    // 分析答案
    await analyzeAnswer(answer, questions[currentQuestion]);
  };

  // 保存答案
  const saveAnswer = async (questionId, answer) => {
    try {
      const userId = props.$w.auth.currentUser?.userId;
      if (!userId) return;
      await cachedCallDataSource($w, {
        dataSourceName: 'candidate_profile',
        methodName: 'wedaUpdateV2',
        params: {
          data: {
            interviewAnswers: {
              questionId,
              answer,
              timestamp: new Date().toISOString()
            }
          },
          filter: {
            where: {
              userId: {
                $eq: userId
              }
            }
          }
        }
      });
    } catch (error) {
      console.error('保存答案失败:', error);
    }
  };

  // 分析答案
  const analyzeAnswer = async (answer, question) => {
    try {
      // 模拟AI分析
      const analysis = {
        score: Math.floor(Math.random() * 40) + 60,
        // 60-100分
        strengths: ['回答清晰', '技术理解深入', '举例恰当'],
        improvements: ['可以增加更多细节', '考虑实际应用场景'],
        keywords: ['React', '组件', '状态管理', '性能优化']
      };

      // 保存分析结果
      await saveAnalysis(question.id, analysis);
      return analysis;
    } catch (error) {
      console.error('分析答案失败:', error);
    }
  };

  // 保存分析结果
  const saveAnalysis = async (questionId, analysis) => {
    try {
      const userId = props.$w.auth.currentUser?.userId;
      if (!userId) return;
      await cachedCallDataSource($w, {
        dataSourceName: 'candidate_profile',
        methodName: 'wedaUpdateV2',
        params: {
          data: {
            interviewAnalysis: {
              questionId,
              ...analysis,
              timestamp: new Date().toISOString()
            }
          },
          filter: {
            where: {
              userId: {
                $eq: userId
              }
            }
          }
        }
      });
    } catch (error) {
      console.error('保存分析结果失败:', error);
    }
  };

  // 下一个问题
  const nextQuestion = async () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setTimeLeft(questions[currentQuestion + 1].timeLimit);
    } else {
      await completeInterview();
    }
  };

  // 完成面试
  const completeInterview = async () => {
    setLoading(true);
    try {
      // 生成面试结果
      const results = {
        totalScore: Math.floor(Math.random() * 20) + 80,
        // 80-100分
        overallFeedback: '表现优秀，技术基础扎实，沟通能力强',
        recommendations: ['加强算法练习', '关注系统设计', '准备更多项目案例'],
        strengths: ['React开发经验丰富', '问题解决能力强', '团队协作良好'],
        areasForImprovement: ['深入理解底层原理', '提升代码质量', '加强测试覆盖']
      };
      setInterviewResults(results);
      setInterviewState('completed');

      // 保存面试结果
      await saveInterviewResults(results);
      toast({
        title: '面试完成',
        description: '恭喜您完成AI面试！',
        variant: 'success'
      });
    } catch (error) {
      console.error('完成面试失败:', error);
      toast({
        title: '完成失败',
        description: '无法保存面试结果',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // 保存面试结果
  const saveInterviewResults = async results => {
    try {
      const userId = props.$w.auth.currentUser?.userId;
      if (!userId) return;
      await cachedCallDataSource($w, {
        dataSourceName: 'candidate_profile',
        methodName: 'wedaUpdateV2',
        params: {
          data: {
            interviewResults: results,
            interviewCompleted: true,
            interviewCompletionDate: new Date().toISOString()
          },
          filter: {
            where: {
              userId: {
                $eq: userId
              }
            }
          }
        }
      });
    } catch (error) {
      console.error('保存面试结果失败:', error);
    }
  };

  // 重新开始面试
  const restartInterview = () => {
    setInterviewState('setup');
    setCurrentQuestion(0);
    setAnswers([]);
    setInterviewResults(null);
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
      'help': '我可以帮您：1) 解释面试问题 2) 提供答题建议 3) 分析您的回答 4) 给出改进建议',
      'question': `当前问题是：${questions[currentQuestion]?.question || '暂无问题'}`,
      'tips': '回答技巧：1) 结构化回答 2) 提供具体例子 3) 展示思考过程 4) 保持简洁清晰',
      'feedback': '您的回答很有条理，建议可以增加更多实际项目经验'
    };
    return responses[message.toLowerCase()] || '我理解您的问题，让我为您提供一些建议...';
  };

  // 渲染面试设置
  const renderInterviewSetup = () => <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>AI面试设置</CardTitle>
      </CardHeader>
      <CardContent>
        <InterviewSetup config={interviewConfig} onConfigChange={setInterviewConfig} onStart={startInterview} loading={loading} resumeData={resumeData} />
      </CardContent>
    </Card>;

  // 渲染面试进行中
  const renderInterviewProgress = () => <div className="max-w-4xl mx-auto">
      <InterviewProgress currentQuestion={currentQuestion} totalQuestions={questions.length} question={questions[currentQuestion]} timeLeft={timeLeft} isRecording={isRecording} onAnswer={handleAnswer} onNext={nextQuestion} loading={loading} />
    </div>;

  // 渲染面试结果
  const renderInterviewResults = () => <div className="max-w-4xl mx-auto">
      <InterviewResults results={interviewResults} answers={answers} onRestart={restartInterview} onNavigate={() => $w.utils.navigateTo({
      pageId: 'candidate-dashboard'
    })} />
    </div>;
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
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            AI智能面试
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            通过AI技术进行专业面试评估
          </p>
        </div>

        {/* 主要内容 */}
        {interviewState === 'setup' && renderInterviewSetup()}
        {interviewState === 'in-progress' && renderInterviewProgress()}
        {interviewState === 'completed' && renderInterviewResults()}

        {/* AI聊天助手 */}
        <div className="fixed bottom-6 right-6">
          <Button className="rounded-full h-14 w-14 shadow-lg bg-blue-500 hover:bg-blue-600" onClick={() => setShowChat(!showChat)}>
            <MessageSquare className="h-6 w-6" />
          </Button>
        </div>

        {/* 聊天界面 */}
        {showChat && <div className="fixed bottom-20 right-6 w-80 h-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl border">
            <ChatInterface messages={chatMessages} onSendMessage={handleChatMessage} placeholder="询问面试相关问题..." title="AI面试助手" onClose={() => setShowChat(false)} />
          </div>}
      </div>
    </div>;
}