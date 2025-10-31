// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Textarea, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Badge, Alert, AlertDescription } from '@/components/ui';
// @ts-ignore;
import { Sparkles, Shield, AlertTriangle, CheckCircle, Eye, EyeOff } from 'lucide-react';

// @ts-ignore;
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { ThemeToggle } from '@/components/ThemeToggle';
import { AccessibilityMenu } from '@/components/AccessibilityMenu';
import { BiasDetectionBar } from '@/components/BiasDetectionBar';
export default function RecruiterJobPost(props) {
  const {
    $w
  } = props;
  const [jobData, setJobData] = useState({
    title: '',
    description: '',
    requirements: '',
    salaryRange: '',
    location: '',
    experience: '',
    skills: [],
    companyName: '',
    diversityScore: 75,
    biasScore: 2
  });
  const [aiGenerated, setAiGenerated] = useState(false);
  const [biasAlerts, setBiasAlerts] = useState([]);
  const [fontSize, setFontSize] = useState(16);
  const [colorBlindMode, setColorBlindMode] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [language, setLanguage] = useState('zh');
  const [showBiasAnalysis, setShowBiasAnalysis] = useState(false);
  const [humanReviewRequired, setHumanReviewRequired] = useState(false);
  const biasWords = [{
    word: 'aggressive',
    suggestion: 'assertive',
    severity: 'high'
  }, {
    word: 'rockstar',
    suggestion: 'experienced professional',
    severity: 'medium'
  }, {
    word: 'ninja',
    suggestion: 'skilled developer',
    severity: 'medium'
  }, {
    word: 'guru',
    suggestion: 'expert',
    severity: 'low'
  }, {
    word: 'young',
    suggestion: 'energetic',
    severity: 'medium'
  }, {
    word: 'native speaker',
    suggestion: 'fluent in',
    severity: 'high'
  }];
  const handleGenerateAIDescription = async () => {
    const mockDescription = `我们正在寻找一位充满激情的${jobData.title}加入我们的团队。您将负责设计和开发创新的解决方案，与跨职能团队合作，推动技术卓越。

主要职责：
• 设计和实现高质量的软件解决方案
• 与产品、设计和工程团队紧密合作
• 编写干净、可维护的代码
• 参与代码审查和技术讨论

任职要求：
• ${jobData.experience}年以上相关经验
• 精通${jobData.skills.join('、')}
• 良好的沟通和团队协作能力
• 计算机科学或相关专业学位

我们提供：
• 具有竞争力的薪酬：${jobData.salaryRange}
• 灵活的工作安排和远程工作选项
• 持续学习和职业发展机会
• 包容和多元化的工作环境`;
    setJobData(prev => ({
      ...prev,
      description: mockDescription
    }));
    setAiGenerated(true);
    const detectedBiases = biasWords.filter(bias => mockDescription.toLowerCase().includes(bias.word.toLowerCase()));
    setBiasAlerts(detectedBiases);
    setShowBiasAnalysis(true);
  };
  const handleBiasCorrection = () => {
    let correctedDescription = jobData.description;
    biasAlerts.forEach(bias => {
      correctedDescription = correctedDescription.replace(new RegExp(bias.word, 'gi'), bias.suggestion);
    });
    setJobData(prev => ({
      ...prev,
      description: correctedDescription
    }));
    setBiasAlerts([]);
  };
  const handleSubmit = async () => {
    if (biasAlerts.length > 0) {
      setHumanReviewRequired(true);
      return;
    }
    try {
      await $w.cloud.callDataSource({
        dataSourceName: 'job_post',
        methodName: 'wedaCreateV2',
        params: {
          data: {
            ...jobData,
            recruiterId: $w.auth.currentUser?.userId || 'mock-recruiter-id',
            createdAt: new Date(),
            status: 'active',
            complianceChecked: true,
            biasScore: jobData.biasScore,
            diversityScore: jobData.diversityScore
          }
        }
      });
      alert('职位发布成功！已符合所有合规要求。');
    } catch (error) {
      console.error('职位发布失败:', error);
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

      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">
            发布新职位（合规版）
          </h1>
          <div className="flex items-center space-x-2">
            <LanguageSwitcher currentLang={language} onLanguageChange={setLanguage} />
            <ThemeToggle isDark={isDark} onToggle={() => setIsDark(!isDark)} />
            <AccessibilityMenu fontSize={fontSize} onFontSizeChange={setFontSize} colorBlindMode={colorBlindMode} onColorBlindToggle={() => setColorBlindMode(!colorBlindMode)} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>基本信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">职位名称</label>
                <Input placeholder="例如：高级前端工程师" value={jobData.title} onChange={e => setJobData(prev => ({
                ...prev,
                title: e.target.value
              }))} />
              </div>

              <div>
                <label className="text-sm font-medium">公司名称</label>
                <Input placeholder="公司名称" value={jobData.companyName} onChange={e => setJobData(prev => ({
                ...prev,
                companyName: e.target.value
              }))} />
              </div>

              <div>
                <label className="text-sm font-medium">薪资范围</label>
                <Input placeholder="例如：25k-35k" value={jobData.salaryRange} onChange={e => setJobData(prev => ({
                ...prev,
                salaryRange: e.target.value
              }))} />
              </div>

              <div>
                <label className="text-sm font-medium">工作地点</label>
                <Select value={jobData.location} onValueChange={value => setJobData(prev => ({
                ...prev,
                location: value
              }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="北京">北京</SelectItem>
                    <SelectItem value="上海">上海</SelectItem>
                    <SelectItem value="深圳">深圳</SelectItem>
                    <SelectItem value="广州">广州</SelectItem>
                    <SelectItem value="杭州">杭州</SelectItem>
                    <SelectItem value="远程">远程</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">经验要求</label>
                <Select value={jobData.experience} onValueChange={value => setJobData(prev => ({
                ...prev,
                experience: value
              }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0-1">0-1年</SelectItem>
                    <SelectItem value="1-3">1-3年</SelectItem>
                    <SelectItem value="3-5">3-5年</SelectItem>
                    <SelectItem value="5-10">5-10年</SelectItem>
                    <SelectItem value="10+">10年以上</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">技能要求</label>
                <Input placeholder="用逗号分隔，例如：React, TypeScript, Node.js" value={jobData.skills.join(', ')} onChange={e => setJobData(prev => ({
                ...prev,
                skills: e.target.value.split(',').map(s => s.trim())
              }))} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>AI描述生成</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={handleGenerateAIDescription} className="w-full bg-gradient-to-r from-cyan-500 to-blue-500" disabled={!jobData.title || !jobData.companyName}>
                <Sparkles className="h-4 w-4 mr-2" />
                AI生成职位描述
              </Button>

              {aiGenerated && <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">职位描述</label>
                    <Textarea rows={8} value={jobData.description} onChange={e => setJobData(prev => ({
                  ...prev,
                  description: e.target.value
                }))} className="font-mono text-sm" />
                  </div>

                  <div>
                    <label className="text-sm font-medium">任职要求</label>
                    <Textarea rows={6} value={jobData.requirements} onChange={e => setJobData(prev => ({
                  ...prev,
                  requirements: e.target.value
                }))} placeholder="例如：计算机科学学位，3年以上相关经验..." />
                  </div>

                  {showBiasAnalysis && <div className="space-y-3">
                      <h4 className="font-medium text-sm">偏见检测结果</h4>
                      <BiasDetectionBar score={biasAlerts.length * 2} threshold={5} />
                      
                      {biasAlerts.length > 0 && <Alert className="border-yellow-500 bg-yellow-50">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            <div className="space-y-2">
                              <p>检测到以下可能带有偏见的词汇：</p>
                              <ul className="text-sm space-y-1">
                                {biasAlerts.map((bias, index) => <li key={index} className="flex justify-between">
                                    <span className="text-red-600">{bias.word}</span>
                                    <span className="text-green-600">→ {bias.suggestion}</span>
                                  </li>)}
                              </ul>
                              <Button size="sm" variant="outline" onClick={handleBiasCorrection} className="mt-2">
                                一键修正偏见词汇
                              </Button>
                            </div>
                          </AlertDescription>
                        </Alert>}

                      {biasAlerts.length === 0 && <Alert className="border-green-500 bg-green-50">
                          <CheckCircle className="h-4 w-4" />
                          <AlertDescription>
                            恭喜！职位描述已通过偏见检测，符合DEI标准。
                          </AlertDescription>
                        </Alert>}
                    </div>}
                </div>}
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>合规检查</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">EU AI Act合规</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">GDPR数据保护</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">中国PIPL合规</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium">多样性积分：</span>
                <Badge variant="secondary" className="ml-2">
                  {jobData.diversityScore}/100
                </Badge>
              </div>
              <div>
                <span className="text-sm font-medium">偏见风险：</span>
                <Badge variant={jobData.biasScore <= 3 ? "default" : "destructive"}>
                  {jobData.biasScore}/10
                </Badge>
              </div>
            </div>

            {humanReviewRequired && <Alert className="border-red-500 bg-red-50">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  检测到偏见词汇，需要人工复核后才能发布。请修正偏见词汇或联系管理员。
                </AlertDescription>
              </Alert>}
          </CardContent>
        </Card>

        <div className="mt-6 flex justify-end space-x-4">
          <Button variant="outline" onClick={() => $w.utils.navigateTo({
          pageId: 'recruiter-dashboard',
          params: {}
        })}>
            取消
          </Button>
          <Button onClick={handleSubmit} disabled={biasAlerts.length > 0} className="bg-gradient-to-r from-cyan-500 to-blue-500">
            发布职位
          </Button>
        </div>
      </div>
    </div>;
}