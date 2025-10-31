// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Input, Textarea, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Badge, Slider, Switch, useToast } from '@/components/ui';
// @ts-ignore;
import { Briefcase, DollarSign, MapPin, Clock, Users, TrendingUp, Shield, Eye, EyeOff, RefreshCw } from 'lucide-react';

// @ts-ignore;
import { BiasDetectionBar } from '@/components/BiasDetectionBar';
// @ts-ignore;
import { ComplianceModal } from '@/components/ComplianceModal';
export default function RecruiterJobPost(props) {
  const [jobData, setJobData] = useState({
    title: '',
    description: '',
    requirements: '',
    salaryRange: '',
    location: '',
    jobType: 'full-time',
    experienceLevel: 'mid',
    skills: [],
    diversityScore: 85,
    biasScore: 2,
    blindMode: false,
    algorithmVersion: 'v2.3.1',
    regulationVersion: 'EU_AI_Act_2025_v3'
  });
  const [modelConfidence, setModelConfidence] = useState(95);
  const [biasAlerts, setBiasAlerts] = useState([]);
  const [showComplianceModal, setShowComplianceModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [regulationVersion, setRegulationVersion] = useState('EU_AI_Act_2025_v3');
  const [algorithmVersion, setAlgorithmVersion] = useState('v2.3.1');
  const {
    toast
  } = useToast();
  const {
    $w
  } = props;

  // 获取当前法规
  const getCurrentRegulation = () => {
    const region = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (region.includes('Europe')) return 'EU_AI_Act';
    if (region.includes('America')) return 'US_State_Bias_Audit';
    if (region.includes('Asia/Shanghai')) return 'China_Content_Review';
    return 'EU_AI_Act';
  };

  // 实时AI生成置信度
  const updateModelConfidence = async () => {
    try {
      const explanation = await $w.cloud.callDataSource({
        dataSourceName: 'ai_explanation_2025',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              entityType: {
                $eq: 'job_post'
              },
              entityId: {
                $eq: 'new-job-post'
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
        setModelConfidence(explanation.records[0].modelConfidence || 95);
      }
    } catch (error) {
      console.error('获取AI置信度失败:', error);
    }
  };

  // 实时偏见检测
  const detectBias = async text => {
    try {
      const audit = await $w.cloud.callDataSource({
        dataSourceName: 'compliance_audit_2025',
        methodName: 'wedaCreateV2',
        params: {
          data: {
            entityType: 'job_post',
            entityId: 'new-job-post',
            auditType: 'bias_detection',
            content: text,
            regulation: getCurrentRegulation(),
            algorithmVersion: algorithmVersion,
            createdAt: new Date().toISOString()
          }
        }
      });
      if (audit) {
        setJobData(prev => ({
          ...prev,
          biasScore: audit.score || 2
        }));
        setBiasAlerts(audit.alerts || []);
      }
    } catch (error) {
      console.error('偏见检测失败:', error);
    }
  };

  // 生成职位描述
  const generateJobDescription = async () => {
    setIsGenerating(true);
    try {
      // 模拟AI生成
      const generatedDescription = `我们正在寻找一位${jobData.title}，负责以下工作：
- 参与产品需求分析和系统设计
- 编写高质量、可维护的代码
- 与团队成员协作，推动项目进展
- 持续优化系统性能和用户体验

要求：
- ${jobData.experienceLevel}级经验
- 熟练掌握相关技术栈
- 具备良好的沟通能力和团队协作精神
- 有持续学习的意愿和能力

我们提供：
- 具有竞争力的薪酬待遇
- 完善的培训和发展机会
- 开放包容的工作环境
- 灵活的工作时间安排`;
      setJobData(prev => ({
        ...prev,
        description: generatedDescription
      }));
      setModelConfidence(98);
      toast({
        title: "生成成功",
        description: "AI已为您生成职位描述，置信度98%"
      });
    } catch (error) {
      toast({
        title: "生成失败",
        description: "请稍后重试",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // 发布职位
  const publishJob = async () => {
    if (!jobData.title || !jobData.description) {
      toast({
        title: "请填写完整信息",
        description: "职位标题和描述不能为空",
        variant: "destructive"
      });
      return;
    }
    try {
      const job = await $w.cloud.callDataSource({
        dataSourceName: 'job_post',
        methodName: 'wedaCreateV2',
        params: {
          data: {
            title: jobData.title,
            description: jobData.description,
            requirements: jobData.requirements,
            salaryRange: jobData.salaryRange,
            location: jobData.location,
            jobType: jobData.jobType,
            experienceLevel: jobData.experienceLevel,
            skills: jobData.skills,
            diversityScore: jobData.diversityScore,
            biasScore: jobData.biasScore,
            blindMode: jobData.blindMode,
            recruiterId: $w.auth.currentUser?.userId || 'mock-recruiter-id',
            algorithmVersion: algorithmVersion,
            regulationVersion: regulationVersion,
            regulation: getCurrentRegulation(),
            createdAt: new Date().toISOString(),
            status: 'active'
          }
        }
      });
      toast({
        title: "发布成功",
        description: `职位"${jobData.title}"已成功发布，AI置信度${modelConfidence}%`
      });
      // 重置表单
      setJobData({
        title: '',
        description: '',
        requirements: '',
        salaryRange: '',
        location: '',
        jobType: 'full-time',
        experienceLevel: 'mid',
        skills: [],
        diversityScore: 85,
        biasScore: 2,
        blindMode: false,
        algorithmVersion: algorithmVersion,
        regulationVersion: regulationVersion
      });
    } catch (error) {
      toast({
        title: "发布失败",
        description: error.message || "请稍后重试",
        variant: "destructive"
      });
    }
  };

  // 添加技能标签
  const addSkill = skill => {
    if (skill && !jobData.skills.includes(skill)) {
      setJobData(prev => ({
        ...prev,
        skills: [...prev.skills, skill]
      }));
    }
  };

  // 移除技能标签
  const removeSkill = skill => {
    setJobData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };
  useEffect(() => {
    setRegulationVersion(getCurrentRegulation() + '_2025_v3');
    updateModelConfidence();
  }, []);
  useEffect(() => {
    if (jobData.description) {
      detectBias(jobData.description);
    }
  }, [jobData.description]);
  const experienceLevels = [{
    value: 'entry',
    label: '初级 (0-2年)'
  }, {
    value: 'mid',
    label: '中级 (3-5年)'
  }, {
    value: 'senior',
    label: '高级 (5-8年)'
  }, {
    value: 'expert',
    label: '专家 (8年以上)'
  }];
  const jobTypes = [{
    value: 'full-time',
    label: '全职'
  }, {
    value: 'part-time',
    label: '兼职'
  }, {
    value: 'contract',
    label: '合同'
  }, {
    value: 'internship',
    label: '实习'
  }];
  const commonSkills = ['JavaScript', 'Python', 'React', 'Node.js', 'SQL', 'AWS', 'Docker', 'Kubernetes', 'Machine Learning', 'Data Analysis'];
  return <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-50 p-4">
      <style jsx>{`
        body {
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
        }
      `}</style>
      
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl">发布新职位</CardTitle>
            <CardDescription>基于{getCurrentRegulation()}的合规职位发布</CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* 合规信息展示 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-600">
                  <TrendingUp className="inline h-4 w-4 mr-1" />
                  AI生成置信度: {modelConfidence}%
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-green-600">
                  <Shield className="inline h-4 w-4 mr-1" />
                  算法版本: {algorithmVersion}
                </p>
              </div>
            </div>

            {/* 盲选模式 */}
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div>
                <h3 className="font-semibold flex items-center">
                  <Eye className="w-5 h-5 mr-2 text-blue-600" />
                  盲选模式
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  隐藏候选人个人信息，确保公平评估
                </p>
              </div>
              <Switch checked={jobData.blindMode} onCheckedChange={checked => {
              setJobData(prev => ({
                ...prev,
                blindMode: checked
              }));
            }} />
            </div>

            {/* 偏见检测 */}
            <BiasDetectionBar biasScore={jobData.biasScore} alerts={biasAlerts} />

            {/* 职位基本信息 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">职位标题</label>
                <Input placeholder="例如：高级前端工程师" value={jobData.title} onChange={e => {
                setJobData(prev => ({
                  ...prev,
                  title: e.target.value
                }));
                detectBias(e.target.value);
              }} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">工作地点</label>
                <Input placeholder="例如：北京/上海/远程" value={jobData.location} onChange={e => setJobData(prev => ({
                ...prev,
                location: e.target.value
              }))} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">工作类型</label>
                <Select value={jobData.jobType} onValueChange={value => setJobData(prev => ({
                ...prev,
                jobType: value
              }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {jobTypes.map(type => <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">经验要求</label>
                <Select value={jobData.experienceLevel} onValueChange={value => setJobData(prev => ({
                ...prev,
                experienceLevel: value
              }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {experienceLevels.map(level => <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">薪资范围</label>
              <Input placeholder="例如：15k-25k" value={jobData.salaryRange} onChange={e => setJobData(prev => ({
              ...prev,
              salaryRange: e.target.value
            }))} />
            </div>

            {/* 技能标签 */}
            <div>
              <label className="block text-sm font-medium mb-2">技能要求</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {jobData.skills.map(skill => <Badge key={skill} variant="secondary" className="cursor-pointer" onClick={() => removeSkill(skill)}>
                    {skill} ×
                  </Badge>)}
              </div>
              <div className="flex flex-wrap gap-2">
                {commonSkills.filter(skill => !jobData.skills.includes(skill)).map(skill => <Badge key={skill} variant="outline" className="cursor-pointer hover:bg-gray-100" onClick={() => addSkill(skill)}>
                    + {skill}
                  </Badge>)}
              </div>
            </div>

            {/* 职位描述 */}
            <div>
              <label className="block text-sm font-medium mb-2">职位描述</label>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">AI生成置信度: {modelConfidence}%</span>
                <Button variant="outline" size="sm" onClick={generateJobDescription} disabled={isGenerating}>
                  {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'AI生成描述'}
                </Button>
              </div>
              <Textarea placeholder="详细描述职位职责和要求..." value={jobData.description} onChange={e => {
              setJobData(prev => ({
                ...prev,
                description: e.target.value
              }));
              detectBias(e.target.value);
            }} rows={6} />
            </div>

            {/* 职位要求 */}
            <div>
              <label className="block text-sm font-medium mb-2">职位要求</label>
              <Textarea placeholder="列出具体的技能和经验要求..." value={jobData.requirements} onChange={e => {
              setJobData(prev => ({
                ...prev,
                requirements: e.target.value
              }));
              detectBias(e.target.value);
            }} rows={4} />
            </div>

            {/* 多样性评分 */}
            <div>
              <label className="block text-sm font-medium mb-2">多样性评分</label>
              <div className="flex items-center space-x-4">
                <Slider value={[jobData.diversityScore]} onValueChange={value => setJobData(prev => ({
                ...prev,
                diversityScore: value[0]
              }))} max={100} min={0} step={1} className="flex-1" />
                <span className="text-sm font-medium">{jobData.diversityScore}/100</span>
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex space-x-4">
              <Button onClick={publishJob} className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500">
                发布职位
              </Button>
              <Button variant="outline" onClick={() => setShowComplianceModal(true)}>
                合规检查
              </Button>
              <Button variant="outline" onClick={() => setPreviewMode(!previewMode)}>
                {previewMode ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                {previewMode ? '隐藏预览' : '预览效果'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <ComplianceModal open={showComplianceModal} onOpenChange={setShowComplianceModal} jobData={jobData} regulation={getCurrentRegulation()} />
      </div>
    </div>;
}