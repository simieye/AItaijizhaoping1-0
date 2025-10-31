// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { useToast } from '@/components/ui';
// @ts-ignore;
import { Info } from 'lucide-react';

// @ts-ignore;
import { InterviewSetup } from '@/components/InterviewSetup';
// @ts-ignore;
import { InterviewProgress } from '@/components/InterviewProgress';
// @ts-ignore;
import { InterviewResults } from '@/components/InterviewResults';
export default function CandidateAIInterview(props) {
  const [isInterviewing, setIsInterviewing] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(300);
  const [biasScore, setBiasScore] = useState(2);
  const [showResults, setShowResults] = useState(false);
  const [aiExplanation, setAiExplanation] = useState(null);
  const [interviewData, setInterviewData] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [micEnabled, setMicEnabled] = useState(true);
  const [algorithmVersion, setAlgorithmVersion] = useState('v2.3.1');
  const [regulationVersion, setRegulationVersion] = useState('EU_AI_Act_2025_v3');
  const [consentLog, setConsentLog] = useState(null);
  const [showVersionAlert, setShowVersionAlert] = useState(false);
  const [expectedVersion, setExpectedVersion] = useState('v2.3.1');
  const {
    toast
  } = useToast();
  const {
    $w
  } = props;
  const questions = [{
    id: 1,
    question: "请介绍一下您在Python开发方面的经验，包括使用过的框架和项目。",
    category: "技术能力",
    timeLimit: 120
  }, {
    id: 2,
    question: "描述一次您解决复杂技术问题的经历，包括问题分析、解决方案和结果。",
    category: "问题解决",
    timeLimit: 120
  }, {
    id: 3,
    question: "如何与团队成员有效沟通技术方案？请举例说明。",
    category: "沟通能力",
    timeLimit: 90
  }, {
    id: 4,
    question: "您如何看待持续学习在职业发展中的重要性？",
    category: "学习能力",
    timeLimit: 90
  }];

  // 获取当前法规
  const getCurrentRegulation = () => {
    const region = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (region.includes('Europe')) return 'EU_AI_Act';
    if (region.includes('America')) return 'US_State_Bias_Audit';
    if (region.includes('Asia/Shanghai')) return 'China_Content_Review';
    return 'EU_AI_Act';
  };

  // 检查算法版本
  const checkAlgorithmVersion = async () => {
    try {
      const latestAudit = await $w.cloud.callDataSource({
        dataSourceName: 'compliance_audit',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              entityType: {
                $eq: 'system'
              },
              auditType: {
                $eq: 'algorithm_version'
              }
            }
          },
          select: {
            $master: true
          },
          orderBy: [{
            createdAt: 'desc'
          }],
          pageSize: 1
        }
      });
      if (latestAudit.records && latestAudit.records.length > 0) {
        const latestVersion = latestAudit.records[0].algorithmVersion;
        if (latestVersion !== expectedVersion) {
          setShowVersionAlert(true);
          setAlgorithmVersion(latestVersion);
          toast({
            title: "算法已更新",
            description: `检测到新版本 ${latestVersion}，建议刷新页面获取最新功能`,
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      console.error('检查算法版本失败:', error);
    }
  };

  // 获取授权版本
  const fetchConsentVersion = async () => {
    try {
      const consent = await $w.cloud.callDataSource({
        dataSourceName: 'consent_log',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              userId: {
                $eq: $w.auth.currentUser?.userId || 'mock-user-id'
              },
              consentType: {
                $eq: 'interview_consent'
              }
            }
          },
          select: {
            $master: true
          },
          orderBy: [{
            createdAt: 'desc'
          }],
          pageSize: 1
        }
      });
      if (consent.records && consent.records.length > 0) {
        setRegulationVersion(consent.records[0].regulationVersion || 'EU_AI_Act_2025_v3');
      }
    } catch (error) {
      console.error('获取授权版本失败:', error);
    }
  };

  // 开始面试
  const startInterview = async () => {
    setIsInterviewing(true);
    setTimeLeft(questions[0].timeLimit);
    try {
      // 记录面试开始
      await $w.cloud.callDataSource({
        dataSourceName: 'interview_session',
        methodName: 'wedaCreateV2',
        params: {
          data: {
            candidateId: $w.auth.currentUser?.userId || 'anonymous',
            regulation: getCurrentRegulation(),
            regulationVersion: regulationVersion,
            algorithmVersion: algorithmVersion,
            startTime: new Date().toISOString(),
            questions: questions.length,
            status: 'in_progress'
          }
        }
      });

      // 记录授权
      await $w.cloud.callDataSource({
        dataSourceName: 'consent_log',
        methodName: 'wedaCreateV2',
        params: {
          data: {
            userId: $w.auth.currentUser?.userId || 'anonymous',
            consentType: 'interview_consent',
            regulation: getCurrentRegulation(),
            regulationVersion: regulationVersion,
            consentMethod: 'explicit',
            consentText: `同意基于${regulationVersion}进行AI面试评估`,
            timestamp: new Date().toISOString()
          }
        }
      });
    } catch (error) {
      console.error('记录面试开始失败:', error);
    }
  };

  // 结束面试
  const endInterview = async () => {
    setIsInterviewing(false);
    setShowResults(true);
    try {
      // 获取真实的AI解释
      const explanation = await $w.cloud.callDataSource({
        dataSourceName: 'ai_explanation',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              entityType: {
                $eq: 'interview'
              },
              entityId: {
                $eq: $w.auth.currentUser?.userId || 'anonymous'
              }
            }
          },
          select: {
            $master: true
          },
          orderBy: [{
            createdAt: 'desc'
          }],
          pageSize: 1
        }
      });
      let realExplanation = null;
      if (explanation.records && explanation.records.length > 0) {
        realExplanation = explanation.records[0];
        setModelConfidence(realExplanation.modelConfidence || 92);
      } else {
        // 如果没有真实数据，使用模拟数据
        realExplanation = {
          factors: [{
            name: '技术技能匹配',
            weight: 35,
            score: 90,
            explanation: 'Python技能与职位要求高度匹配'
          }, {
            name: '问题解决能力',
            weight: 25,
            score: 85,
            explanation: '展现了优秀的问题分析能力'
          }, {
            name: '沟通表达能力',
            weight: 20,
            score: 88,
            explanation: '回答清晰，逻辑性强'
          }, {
            name: '学习适应能力',
            weight: 20,
            score: 92,
            explanation: '展现了持续学习的意愿'
          }],
          bias_analysis: {
            detected: false,
            details: '未发现明显偏见指标'
          },
          transparency_score: 95,
          regulation_compliance: getCurrentRegulation(),
          modelConfidence: 92,
          algorithmVersion: algorithmVersion
        };
      }
      setAiExplanation(realExplanation);

      // 记录合规审计
      await $w.cloud.callDataSource({
        dataSourceName: 'compliance_audit',
        methodName: 'wedaCreateV2',
        params: {
          data: {
            entityType: 'interview',
            entityId: $w.auth.currentUser?.userId || 'anonymous',
            auditType: 'bias_detection',
            score: calculateBiasScore({
              gender: 1,
              age: 0,
              ethnicity: 1,
              education: 2
            }),
            details: {
              technicalSkills: {
                python: 90,
                problemSolving: 85,
                communication: 88,
                learning: 92
              },
              algorithmVersion: algorithmVersion,
              regulationVersion: regulationVersion
            },
            regulation: getCurrentRegulation(),
            algorithmVersion: algorithmVersion,
            createdAt: new Date().toISOString()
          }
        }
      });
    } catch (error) {
      console.error('记录合规审计失败:', error);
    }
  };

  // 获取AI解释
  const fetchAIExplanation = async () => {
    try {
      const explanation = await $w.cloud.callDataSource({
        dataSourceName: 'ai_explanation',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              entityType: {
                $eq: 'interview'
              },
              entityId: {
                $eq: $w.auth.currentUser?.userId || 'anonymous'
              },
              regulation: {
                $eq: getCurrentRegulation()
              }
            }
          },
          select: {
            $master: true
          },
          orderBy: [{
            createdAt: 'desc'
          }],
          pageSize: 1
        }
      });
      if (explanation.records && explanation.records.length > 0) {
        setAiExplanation(explanation.records[0]);
        setModelConfidence(explanation.records[0].modelConfidence || 92);
      }
    } catch (error) {
      console.error('获取AI解释失败:', error);
    }
  };

  // 计算偏见分数
  const calculateBiasScore = indicators => {
    const total = Object.values(indicators).reduce((sum, val) => sum + val, 0);
    return Math.min(total * 2, 10);
  };

  // 下载PDF报告
  const downloadExplanationPDF = async language => {
    try {
      const content = generatePDFContent(aiExplanation, language);
      const blob = new Blob([content], {
        type: 'application/pdf'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `AI_Interview_Explanation_${language}_${Date.now()}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast({
        title: "下载成功",
        description: `AI决策解释PDF已下载（${language}版本） - 基于${regulationVersion}`
      });
    } catch (error) {
      toast({
        title: "下载失败",
        description: "请稍后重试",
        variant: "destructive"
      });
    }
  };

  // 生成PDF内容
  const generatePDFContent = (explanation, language) => {
    const translations = {
      zh: {
        title: 'AI面试决策解释报告',
        factors: '评估因素',
        bias: '偏见检测',
        compliance: '合规性',
        algorithm: '算法版本',
        regulation: '法规版本'
      },
      en: {
        title: 'AI Interview Decision Explanation Report',
        factors: 'Evaluation Factors',
        bias: 'Bias Detection',
        compliance: 'Compliance',
        algorithm: 'Algorithm Version',
        regulation: 'Regulation Version'
      }
    };
    const t = translations[language] || translations.zh;
    return `${t.title}\n\n${t.algorithm}: ${algorithmVersion}\n${t.regulation}: ${regulationVersion}\n\n${t.factors}:\n${explanation?.factors?.map(f => `${f.name}: ${f.score}/100 (${f.weight}%)`).join('\n') || 'N/A'}\n\n${t.bias}: ${explanation?.bias_analysis?.detected ? '检测到' : '未检测到'}\n\n${t.compliance}: ${getCurrentRegulation()}\n\n生成时间: ${new Date().toLocaleString()}`;
  };

  // 计时器
  useEffect(() => {
    let timer;
    if (isInterviewing && timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (timeLeft === 0 && isInterviewing) {
      nextQuestion();
    }
    return () => clearTimeout(timer);
  }, [timeLeft, isInterviewing]);

  // 模拟偏见分数变化
  useEffect(() => {
    if (isInterviewing) {
      const interval = setInterval(() => {
        setBiasScore(prev => {
          const change = Math.random() * 2 - 1;
          return Math.max(0, Math.min(10, prev + change));
        });
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [isInterviewing]);
  useEffect(() => {
    fetchConsentVersion();
    checkAlgorithmVersion();
  }, []);

  // 下一题
  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setTimeLeft(questions[currentQuestion + 1].timeLimit);
    } else {
      endInterview();
    }
  };

  // 回答问题
  const answerQuestion = answer => {
    setAnswers([...answers, answer]);
    nextQuestion();
  };
  return <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-50 p-4">
    <style jsx>{`
      body {
        background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
      }
    `}</style>
    
    <div className="max-w-4xl mx-auto">
      <div className="mb-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-600">
          <Info className="inline h-4 w-4 mr-1" />
          当前偏见检测算法版本: {algorithmVersion} | 授权基于: {regulationVersion}
        </p>
      </div>
      
      {!isInterviewing && !showResults && <InterviewSetup onStart={startInterview} regulation={getCurrentRegulation()} />}
      
      {isInterviewing && !showResults && <InterviewProgress currentQuestion={currentQuestion} totalQuestions={questions.length} timeLeft={timeLeft} question={questions[currentQuestion]} biasScore={biasScore} isRecording={isRecording} cameraEnabled={cameraEnabled} micEnabled={micEnabled} onToggleRecording={() => setIsRecording(!isRecording)} onToggleCamera={() => setCameraEnabled(!cameraEnabled)} onToggleMic={() => setMicEnabled(!micEnabled)} onAnswer={answerQuestion} />}
      
      {showResults && <InterviewResults interviewData={interviewData} biasScore={biasScore} aiExplanation={aiExplanation} regulation={getCurrentRegulation()} onDownloadPDF={downloadExplanationPDF} />}
    </div>
  </div>;
}