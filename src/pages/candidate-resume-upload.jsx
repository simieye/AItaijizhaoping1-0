// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Button, Card, CardContent, CardHeader, CardTitle, Progress, Badge, Alert, AlertDescription } from '@/components/ui';
// @ts-ignore;
import { CheckCircle, AlertCircle, Eye, Shield, EyeOff } from 'lucide-react';

// @ts-ignore;
import { FileUploadZone } from '@/components/FileUploadZone';
import { BlindModeToggle } from '@/components/BlindModeToggle';
import { BiasDetectionBar } from '@/components/BiasDetectionBar';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { ThemeToggle } from '@/components/ThemeToggle';
import { AccessibilityMenu } from '@/components/AccessibilityMenu';
export default function CandidateResumeUpload(props) {
  const {
    $w
  } = props;
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [blindMode, setBlindMode] = useState(false);
  const [biasScore, setBiasScore] = useState(2);
  const [showEmotionWarning, setShowEmotionWarning] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const [colorBlindMode, setColorBlindMode] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [language, setLanguage] = useState('zh');
  const [complianceChecks, setComplianceChecks] = useState({
    euAct: false,
    gdpr: false,
    chinaPIPL: false
  });
  const mockFiles = [{
    name: '张三_前端开发_简历.pdf',
    size: 1024 * 1024 * 2.5,
    type: 'application/pdf',
    progress: 100,
    status: 'completed',
    preview: 'PDF预览图'
  }, {
    name: '项目展示视频.mp4',
    size: 1024 * 1024 * 15.8,
    type: 'video/mp4',
    progress: 75,
    status: 'processing',
    preview: '视频缩略图'
  }];
  useEffect(() => {
    // 模拟偏见检测
    const timer = setInterval(() => {
      setBiasScore(Math.floor(Math.random() * 10) + 1);
    }, 3000);
    return () => clearInterval(timer);
  }, []);
  const handleFileUpload = files => {
    const newFiles = files.map(file => ({
      ...file,
      progress: 0,
      status: 'uploading'
    }));
    setUploadedFiles([...uploadedFiles, ...newFiles]);

    // 检查视频文件
    const videoFiles = files.filter(file => file.type.startsWith('video/'));
    if (videoFiles.length > 0) {
      setShowEmotionWarning(true);
    }

    // 模拟上传进度
    newFiles.forEach((file, index) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 20;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          setUploadedFiles(prev => prev.map((f, i) => i === uploadedFiles.length + index ? {
            ...f,
            progress: 100,
            status: 'completed'
          } : f));
        } else {
          setUploadedFiles(prev => prev.map((f, i) => i === uploadedFiles.length + index ? {
            ...f,
            progress
          } : f));
        }
      }, 200);
    });
  };
  const handleRemoveFile = index => {
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
  };
  const handleAIAnalysis = async () => {
    setProcessing(true);
    try {
      // 创建简历记录
      await $w.cloud.callDataSource({
        dataSourceName: 'candidate_profile',
        methodName: 'wedaUpdateV2',
        params: {
          data: {
            resumeUploaded: true,
            blindModeEnabled: blindMode,
            biasScore,
            complianceChecks,
            uploadedAt: new Date()
          },
          filter: {
            where: {
              userId: {
                $eq: $w.auth.currentUser?.userId || 'mock-user-id'
              }
            }
          }
        }
      });
      setTimeout(() => {
        setProcessing(false);
        $w.utils.navigateTo({
          pageId: 'candidate-dashboard',
          params: {}
        });
      }, 3000);
    } catch (error) {
      console.error('简历上传失败:', error);
      setProcessing(false);
    }
  };
  return <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 p-4`}>
      <style jsx>{`
        body {
          font-size: ${fontSize}px;
        }
        ${colorBlindMode ? `
          * {
            filter: hue-rotate(15deg) saturate(0.8);
          }
        ` : ''}
      `}</style>

      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">
            多模态简历上传
          </h1>
          <div className="flex items-center space-x-2">
            <LanguageSwitcher currentLang={language} onLanguageChange={setLanguage} />
            <ThemeToggle isDark={isDark} onToggle={() => setIsDark(!isDark)} />
            <AccessibilityMenu fontSize={fontSize} onFontSizeChange={setFontSize} colorBlindMode={colorBlindMode} onColorBlindToggle={() => setColorBlindMode(!colorBlindMode)} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>上传简历文件</CardTitle>
                  <BlindModeToggle enabled={blindMode} onToggle={setBlindMode} />
                </div>
                {blindMode && <Alert className="mt-2">
                    <Shield className="h-4 w-4" />
                    <AlertDescription>
                      盲选模式已启用：姓名、性别、头像等敏感信息将被隐藏
                    </AlertDescription>
                  </Alert>}
              </CardHeader>
              <CardContent>
                <FileUploadZone onFileUpload={handleFileUpload} uploadedFiles={[...uploadedFiles, ...mockFiles]} onRemoveFile={handleRemoveFile} />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>合规检测</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <BiasDetectionBar score={biasScore} threshold={5} />
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">EU AI Act合规</span>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">GDPR数据保护</span>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">中国PIPL合规</span>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>AI分析进度</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>简历解析</span>
                    <span>85%</span>
                  </div>
                  <Progress value={85} />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>技能匹配</span>
                    <span>92%</span>
                  </div>
                  <Progress value={92} />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>偏见检测</span>
                  </div>
                  <BiasDetectionBar score={biasScore} threshold={5} />
                </div>
              </CardContent>
            </Card>

            {showEmotionWarning && <Alert className="border-yellow-500 bg-yellow-50">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>AI情感识别已禁用</strong>
                  <br />
                  根据EU AI Act Article 5，视频面试中的情感识别功能已被禁用
                </AlertDescription>
              </Alert>}

            <Card>
              <CardHeader>
                <CardTitle>预览区域</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border rounded-lg p-4 text-center">
                    <Eye className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">简历预览</p>
                  </div>
                  
                  <Button onClick={handleAIAnalysis} disabled={processing} className="w-full bg-gradient-to-r from-cyan-500 to-blue-500">
                    {processing ? 'AI分析中...' : '开始AI分析'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>;
}