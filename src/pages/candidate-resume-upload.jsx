// @ts-ignore;
import React, { useState, useEffect, useCallback } from 'react';
// @ts-ignore;
import { Button, Card, CardContent, CardHeader, CardTitle, Progress, Badge, Alert, AlertDescription, AlertTitle, useToast } from '@/components/ui';
// @ts-ignore;
import { Upload, FileText, CheckCircle, AlertCircle, X, Eye, EyeOff, MessageSquare, RefreshCw, Clock, Star } from 'lucide-react';

// @ts-ignore;
import { FileUploadZone } from '@/components/FileUploadZone';
// @ts-ignore;
import { ChatInterface } from '@/components/ChatInterface';
// @ts-ignore;
import { cachedCallDataSource } from '@/lib/cache';
export default function CandidateResumeUpload(props) {
  const [files, setFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [uploadStatus, setUploadStatus] = useState('idle'); // idle, uploading, processing, success, error
  const [resumeData, setResumeData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [candidateProfile, setCandidateProfile] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [processingStep, setProcessingStep] = useState('');
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

  // 处理文件上传
  const handleFileUpload = async uploadedFiles => {
    setFiles(uploadedFiles);
    setError('');
    setSuccessMessage('');

    // 验证文件
    const validFiles = uploadedFiles.filter(file => {
      const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!validTypes.includes(file.type)) {
        setError('请上传PDF、Word或文本格式的文件');
        return false;
      }
      if (file.size > maxSize) {
        setError('文件大小不能超过5MB');
        return false;
      }
      return true;
    });
    if (validFiles.length === 0) return;
    setUploadStatus('uploading');
    setIsProcessing(true);
    setProcessingStep('正在上传文件...');
    try {
      for (const file of validFiles) {
        await uploadFile(file);
      }
    } catch (error) {
      console.error('上传失败:', error);
      setError('文件上传失败，请重试');
      setUploadStatus('error');
    } finally {
      setIsProcessing(false);
    }
  };

  // 上传单个文件
  const uploadFile = async file => {
    try {
      const tcb = await $w.cloud.getCloudInstance();
      const fileName = `resumes/${Date.now()}_${file.name}`;

      // 上传文件到云存储
      setProcessingStep('正在上传到云存储...');
      const uploadResult = await tcb.uploadFile({
        cloudPath: fileName,
        filePath: file
      });
      if (uploadResult.fileID) {
        // 获取临时访问URL
        setProcessingStep('正在获取文件链接...');
        const fileUrl = await tcb.getTempFileURL({
          fileList: [uploadResult.fileID]
        });

        // 保存简历信息到数据库
        setProcessingStep('正在保存简历信息...');
        await saveResumeInfo({
          fileName: file.name,
          fileUrl: fileUrl.fileList[0].tempFileURL,
          fileId: uploadResult.fileID,
          fileSize: file.size,
          fileType: file.type,
          uploadDate: new Date().toISOString()
        });

        // AI分析简历
        setProcessingStep('AI正在分析您的简历...');
        await processResumeWithAI(fileUrl.fileList[0].tempFileURL, file);
        setUploadStatus('success');
        setSuccessMessage('简历上传成功！AI分析已完成');
        toast({
          title: '上传成功',
          description: '简历已上传并分析完成',
          variant: 'success'
        });
      }
    } catch (error) {
      console.error('文件上传失败:', error);
      throw error;
    }
  };

  // 保存简历信息到数据库
  const saveResumeInfo = async resumeInfo => {
    try {
      const userId = props.$w.auth.currentUser?.userId;
      if (!userId) return;
      await cachedCallDataSource($w, {
        dataSourceName: 'candidate_profile',
        methodName: 'wedaUpdateV2',
        params: {
          data: {
            resumeFile: resumeInfo,
            resumeUploaded: true,
            resumeUploadDate: new Date().toISOString()
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
      console.error('保存简历信息失败:', error);
      throw error;
    }
  };

  // AI处理简历
  const processResumeWithAI = async (fileUrl, file) => {
    try {
      setProcessingStep('正在提取简历信息...');

      // 模拟AI处理过程
      await new Promise(resolve => setTimeout(resolve, 2000));

      // 模拟简历数据提取
      const mockResumeData = {
        name: candidateProfile?.name || '候选人',
        email: candidateProfile?.email || '',
        phone: candidateProfile?.phone || '',
        skills: ['JavaScript', 'React', 'Node.js', 'Python', 'SQL', 'Docker', 'AWS', 'TypeScript'],
        experience: [{
          title: '高级前端开发工程师',
          company: '科技公司',
          duration: '2021-2024',
          description: '负责大型React应用开发，团队管理，性能优化'
        }, {
          title: '前端开发工程师',
          company: '互联网公司',
          duration: '2019-2021',
          description: '负责Web应用开发，UI组件设计，API集成'
        }],
        education: [{
          degree: '计算机科学学士',
          school: '知名大学',
          year: '2019'
        }],
        summary: '具有5年前端开发经验的资深工程师，专注于React生态系统和现代Web技术',
        keywords: ['前端开发', 'React', 'JavaScript', '团队协作', '敏捷开发', '性能优化', '用户体验'],
        strengths: ['技术深度', '项目经验', '团队协作', '学习能力'],
        improvements: ['可以增加更多项目细节', '建议添加GitHub链接', '考虑添加技术博客']
      };
      setResumeData(mockResumeData);
      setAiAnalysis({
        overallScore: 85,
        skillsMatch: 90,
        experienceRelevance: 80,
        educationAlignment: 85,
        recommendations: ['您的技能与市场需求高度匹配', '建议突出React和Node.js经验', '考虑添加更多项目案例', '建议完善个人项目展示']
      });

      // 保存AI分析结果
      await saveAIAnalysis(mockResumeData);

      // 添加AI聊天消息
      setChatMessages([{
        id: 1,
        type: 'bot',
        content: `您好！我已经分析了您的简历。您的技能与${mockResumeData.skills.length}个技术领域匹配，整体评分${mockResumeData.experience.length * 20}分。我可以帮您优化简历或推荐合适的职位。`,
        timestamp: new Date().toISOString()
      }]);
    } catch (error) {
      console.error('AI处理失败:', error);
    }
  };

  // 保存AI分析结果
  const saveAIAnalysis = async analysis => {
    try {
      const userId = props.$w.auth.currentUser?.userId;
      if (!userId) return;
      await cachedCallDataSource($w, {
        dataSourceName: 'candidate_profile',
        methodName: 'wedaUpdateV2',
        params: {
          data: {
            resumeAnalysis: analysis,
            aiProcessed: true,
            aiProcessDate: new Date().toISOString()
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
      console.error('保存AI分析失败:', error);
    }
  };

  // 处理删除文件
  const handleDeleteFile = fileId => {
    setFiles(files.filter(file => file.id !== fileId));
    setUploadStatus('idle');
    setResumeData(null);
    setAiAnalysis(null);
  };

  // 处理下一步
  const handleNextStep = () => {
    if (resumeData) {
      $w.utils.navigateTo({
        pageId: 'candidate-ai-interview',
        params: {
          resumeData: JSON.stringify(resumeData)
        }
      });
    } else {
      toast({
        title: '请先上传简历',
        description: '需要上传简历才能进行AI面试',
        variant: 'destructive'
      });
    }
  };

  // 处理跳过
  const handleSkip = () => {
    $w.utils.navigateTo({
      pageId: 'candidate-dashboard'
    });
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
      'help': '我可以帮您：1) 优化简历内容 2) 推荐合适职位 3) 分析技能匹配度 4) 提供面试建议',
      'skills': `您的技能包括：${resumeData?.skills?.join(', ')}，与市场需求匹配度${aiAnalysis?.skillsMatch || 0}%`,
      'jobs': `基于您的经验，推荐${resumeData?.experience?.length || 0}年经验的前端/全栈开发职位`,
      'interview': '面试建议：准备项目案例，突出技术深度，展示团队协作经验',
      'improve': `简历改进建议：${aiAnalysis?.recommendations?.join('；') || '完善项目细节，添加量化成果'}`
    };
    return responses[message.toLowerCase()] || '我理解您的问题，让我为您提供专业的求职建议...';
  };

  // 渲染文件列表
  const renderFileList = () => {
    return files.map(file => <div key={file.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
        <div className="flex items-center space-x-3">
          <FileText className="h-5 w-5 text-blue-600" />
          <div>
            <p className="font-medium text-sm">{file.name}</p>
            <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {uploadStatus === 'uploading' && <Progress value={uploadProgress[file.id] || 0} className="w-20" />}
          {uploadStatus === 'success' && <CheckCircle className="h-5 w-5 text-green-600" />}
          <button onClick={() => handleDeleteFile(file.id)} className="text-red-600 hover:text-red-800 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>);
  };

  // 渲染简历预览
  const renderResumePreview = () => {
    if (!resumeData) return null;
    return <Card className="mt-6 border-2">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>AI分析结果</span>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="bg-green-100 text-green-800">
                评分: {aiAnalysis?.overallScore || 0}/100
              </Badge>
              <Button variant="ghost" size="sm" onClick={() => setShowPreview(!showPreview)}>
                {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {showPreview && <div className="space-y-6">
              {/* AI评分 */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{aiAnalysis?.skillsMatch || 0}%</div>
                  <div className="text-sm text-gray-600">技能匹配</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{aiAnalysis?.experienceRelevance || 0}%</div>
                  <div className="text-sm text-gray-600">经验相关</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{aiAnalysis?.educationAlignment || 0}%</div>
                  <div className="text-sm text-gray-600">教育匹配</div>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">{aiAnalysis?.overallScore || 0}%</div>
                  <div className="text-sm text-gray-600">综合评分</div>
                </div>
              </div>

              {/* 基本信息 */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center">
                  <Star className="h-4 w-4 mr-2 text-yellow-500" />
                  基本信息
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p><strong>姓名:</strong> {resumeData.name}</p>
                    <p><strong>邮箱:</strong> {resumeData.email}</p>
                    <p><strong>电话:</strong> {resumeData.phone}</p>
                  </div>
                  <div>
                    <p><strong>工作经验:</strong> {resumeData.experience?.length || 0}年</p>
                    <p><strong>技能数量:</strong> {resumeData.skills?.length || 0}项</p>
                    <p><strong>教育背景:</strong> {resumeData.education?.[0]?.degree || '未填写'}</p>
                  </div>
                </div>
              </div>
              
              {/* 技能标签 */}
              <div>
                <h4 className="font-semibold mb-3">技能标签</h4>
                <div className="flex flex-wrap gap-2">
                  {resumeData.skills.map((skill, index) => <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800">
                      {skill}
                    </Badge>)}
                </div>
              </div>
              
              {/* 工作经验 */}
              <div>
                <h4 className="font-semibold mb-3">工作经验</h4>
                {resumeData.experience.map((exp, index) => <div key={index} className="mb-4 p-3 border rounded-lg">
                    <p className="font-medium">{exp.title}</p>
                    <p className="text-sm text-gray-600">{exp.company} • {exp.duration}</p>
                    <p className="text-sm mt-1">{exp.description}</p>
                  </div>)}
              </div>
              
              {/* AI建议 */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-blue-500" />
                  AI改进建议
                </h4>
                <ul className="space-y-2">
                  {aiAnalysis?.recommendations?.map((rec, index) => <li key={index} className="flex items-start">
                      <CheckCircle className="h-4 w-4 mr-2 text-green-500 mt-0.5" />
                      <span className="text-sm">{rec}</span>
                    </li>)}
                </ul>
              </div>
            </div>}
        </CardContent>
      </Card>;
  };

  // 渲染处理步骤
  const renderProcessingSteps = () => {
    if (uploadStatus !== 'uploading' && uploadStatus !== 'processing') return null;
    return <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-sm">处理进度</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center">
              <div className={`w-2 h-2 rounded-full mr-2 ${processingStep.includes('上传') ? 'bg-blue-500' : 'bg-gray-300'}`} />
              <span className={`text-sm ${processingStep.includes('上传') ? 'text-blue-600' : 'text-gray-500'}`}>上传文件</span>
            </div>
            <div className="flex items-center">
              <div className={`w-2 h-2 rounded-full mr-2 ${processingStep.includes('提取') ? 'bg-blue-500' : 'bg-gray-300'}`} />
              <span className={`text-sm ${processingStep.includes('提取') ? 'text-blue-600' : 'text-gray-500'}`}>提取信息</span>
            </div>
            <div className="flex items-center">
              <div className={`w-2 h-2 rounded-full mr-2 ${processingStep.includes('分析') ? 'bg-blue-500' : 'bg-gray-300'}`} />
              <span className={`text-sm ${processingStep.includes('分析') ? 'text-blue-600' : 'text-gray-500'}`}>AI分析</span>
            </div>
          </div>
          <Progress value={processingStep ? 75 : 25} className="w-full mt-3" />
          <p className="text-sm text-gray-600 mt-2">{processingStep}</p>
        </CardContent>
      </Card>;
  };
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
            上传简历
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            上传您的简历，让AI为您分析并推荐合适的职位
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧：上传区域 */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>上传简历文件</CardTitle>
              </CardHeader>
              <CardContent>
                {/* 错误提示 */}
                {error && <Alert variant="destructive" className="mb-4">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>}
                
                {/* 成功提示 */}
                {successMessage && <Alert className="mb-4 bg-green-50 border-green-200">
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>{successMessage}</AlertDescription>
                  </Alert>}
                
                {/* 处理步骤 */}
                {renderProcessingSteps()}
                
                {/* 文件上传区域 */}
                <FileUploadZone onFilesSelected={handleFileUpload} accept=".pdf,.doc,.docx,.txt" maxSize={5 * 1024 * 1024} disabled={isProcessing} />
                
                {/* 文件列表 */}
                {files.length > 0 && <div className="mt-4 space-y-2">
                    {renderFileList()}
                  </div>}
              </CardContent>
            </Card>

            {/* 操作按钮 */}
            <div className="mt-6 flex justify-between">
              <Button variant="outline" onClick={handleSkip}>
                跳过此步骤
              </Button>
              <Button onClick={handleNextStep} disabled={!resumeData || isProcessing}>
                {isProcessing ? '处理中...' : '下一步'}
              </Button>
            </div>
          </div>

          {/* 右侧：帮助信息和AI聊天 */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>上传指南</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-sm">
                  <div>
                    <h4 className="font-semibold mb-2">支持的格式</h4>
                    <ul className="space-y-1 text-gray-600">
                      <li>• PDF (.pdf)</li>
                      <li>• Word (.doc, .docx)</li>
                      <li>• 文本文件 (.txt)</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">文件大小</h4>
                    <p className="text-gray-600">最大支持5MB</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">AI分析内容</h4>
                    <ul className="space-y-1 text-gray-600">
                      <li>• 技能提取与匹配</li>
                      <li>• 经验分析评估</li>
                      <li>• 职位智能推荐</li>
                      <li>• 简历优化建议</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI聊天助手 */}
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
                {showChat && <ChatInterface messages={chatMessages} onSendMessage={handleChatMessage} placeholder="询问关于简历的问题..." title="AI简历助手" />}
              </CardContent>
            </Card>

            {/* 简历预览 */}
            {renderResumePreview()}
          </div>
        </div>
      </div>

      {/* AI助手按钮 */}
      <Button className="fixed bottom-6 right-6 rounded-full h-14 w-14 shadow-lg bg-blue-500 hover:bg-blue-600" onClick={() => setShowChat(!showChat)}>
        <MessageSquare className="h-6 w-6" />
      </Button>

      {/* AI聊天界面 */}
      {showChat && <div className="fixed bottom-20 right-6 w-80 h-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl border">
          <ChatInterface messages={chatMessages} onSendMessage={handleChatMessage} placeholder="询问简历相关问题..." title="AI简历助手" onClose={() => setShowChat(false)} />
        </div>}
    </div>;
}