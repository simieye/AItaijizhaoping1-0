// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Label, Textarea, Progress, useToast } from '@/components/ui';
// @ts-ignore;
import { Upload, FileText, Briefcase, User, MessageSquare } from 'lucide-react';

// @ts-ignore;
import { CandidateAIChat } from '@/components/CandidateAIChat';
export default function CandidateResumeUpload(props) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    targetPosition: '',
    experience: '',
    skills: '',
    location: '',
    expectedSalary: ''
  });
  const [aiChatOpen, setAiChatOpen] = useState(false);
  const {
    toast
  } = useToast();
  const {
    $w
  } = props;
  const handleFileChange = e => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast({
          title: '文件过大',
          description: '请选择小于5MB的文件',
          variant: 'destructive'
        });
        return;
      }
      setFile(selectedFile);
    }
  };
  const handleSubmit = async e => {
    e.preventDefault();
    setUploading(true);
    try {
      // 模拟上传进度
      for (let i = 0; i <= 100; i += 10) {
        setProgress(i);
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      // 保存候选人档案
      const candidateData = await $w.cloud.callDataSource({
        dataSourceName: 'candidate_profile',
        methodName: 'wedaCreateV2',
        params: {
          data: {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            targetPosition: formData.targetPosition,
            experience: parseInt(formData.experience) || 0,
            skills: formData.skills.split(',').map(s => s.trim()),
            location: formData.location,
            expectedSalary: formData.expectedSalary,
            matchScore: Math.floor(Math.random() * 30) + 70,
            diversityScore: Math.floor(Math.random() * 20) + 80,
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        }
      });

      // 同时创建用户记录
      await $w.cloud.callDataSource({
        dataSourceName: 'user',
        methodName: 'wedaCreateV2',
        params: {
          data: {
            name: formData.name,
            email: formData.email,
            role: 'candidate',
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        }
      });
      toast({
        title: '上传成功',
        description: '您的简历已成功上传，AI正在分析...'
      });
      $w.utils.navigateTo({
        pageId: 'candidate-dashboard'
      });
    } catch (error) {
      console.error('上传失败:', error);
      toast({
        title: '上传失败',
        description: error.message || '上传过程中出现错误',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };
  const handleInputChange = e => {
    const {
      name,
      value
    } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  return <div className="min-h-screen bg-gray-50 py-8">
      <style jsx>{`
        body {
          background: #f9fafb;
        }
      `}</style>
      
      <div className="max-w-4xl mx-auto px-4">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>上传候选人档案</CardTitle>
            <CardDescription>
              完善您的个人信息，让AI为您匹配最适合的职位
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 基本信息 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">姓名</Label>
                  <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">邮箱</Label>
                  <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">电话</Label>
                  <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleInputChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="targetPosition">目标职位</Label>
                  <Input id="targetPosition" name="targetPosition" value={formData.targetPosition} onChange={handleInputChange} required />
                </div>
              </div>

              {/* 详细信息 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="experience">工作经验（年）</Label>
                  <Input id="experience" name="experience" type="number" value={formData.experience} onChange={handleInputChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">工作地点</Label>
                  <Input id="location" name="location" value={formData.location} onChange={handleInputChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expectedSalary">期望薪资</Label>
                  <Input id="expectedSalary" name="expectedSalary" value={formData.expectedSalary} onChange={handleInputChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="skills">技能标签（用逗号分隔）</Label>
                  <Input id="skills" name="skills" value={formData.skills} onChange={handleInputChange} placeholder="React, Node.js, Python" required />
                </div>
              </div>

              {/* 简历上传 */}
              <div className="space-y-2">
                <Label htmlFor="resume">上传简历</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input id="resume" type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} className="hidden" />
                  <label htmlFor="resume" className="cursor-pointer">
                    <Upload className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">
                      {file ? file.name : '点击上传简历（PDF、Word格式，最大5MB）'}
                    </p>
                  </label>
                </div>
              </div>

              {uploading && <div className="space-y-2">
                  <Label>上传进度</Label>
                  <Progress value={progress} className="w-full" />
                  <p className="text-sm text-gray-600">{progress}%</p>
                </div>}

              <Button type="submit" className="w-full" disabled={uploading}>
                {uploading ? '上传中...' : '提交档案'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* AI客服按钮 */}
      <Button className="fixed bottom-6 right-6 rounded-full h-14 w-14 shadow-lg bg-blue-500 hover:bg-blue-600" onClick={() => setAiChatOpen(true)}>
        <MessageSquare className="h-6 w-6" />
      </Button>

      {/* AI客服抽屉 */}
      <CandidateAIChat isOpen={aiChatOpen} onClose={() => setAiChatOpen(false)} userId="candidate_upload" userName="候选人" onMessageSent={(userMsg, botMsg) => {
      console.log('简历上传页面AI对话:', {
        user: userMsg,
        bot: botMsg
      });
    }} />
    </div>;
}