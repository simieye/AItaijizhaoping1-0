// @ts-ignore;
import React, { useState, useEffect, useCallback } from 'react';
// @ts-ignore;
import { Button, Card, CardContent, CardHeader, CardTitle, Progress, Alert, AlertDescription, AlertTitle, useToast } from '@/components/ui';
// @ts-ignore;
import { Upload, FileText, CheckCircle, AlertCircle, X, Eye, Download, Badge } from 'lucide-react';

// @ts-ignore;
import { FileUploadZone } from '@/components/FileUploadZone';
// @ts-ignore;
import { cachedCallDataSource } from '@/lib/cache';
export default function CandidateResumeUpload(props) {
  const [files, setFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [uploadStatus, setUploadStatus] = useState('idle'); // idle, uploading, success, error
  const [resumeData, setResumeData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [candidateProfile, setCandidateProfile] = useState(null);
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
      // 使用云开发上传文件
      const tcb = await $w.cloud.getCloudInstance();

      // 生成唯一文件名
      const fileName = `resumes/${Date.now()}_${file.name}`;

      // 上传文件到云存储
      const uploadResult = await tcb.uploadFile({
        cloudPath: fileName,
        filePath: file
      });
      if (uploadResult.fileID) {
        // 获取临时访问URL
        const fileUrl = await tcb.getTempFileURL({
          fileList: [uploadResult.fileID]
        });

        // 保存简历信息到数据库
        await saveResumeInfo({
          fileName: file.name,
          fileUrl: fileUrl.fileList[0].tempFileURL,
          fileId: uploadResult.fileID,
          fileSize: file.size,
          fileType: file.type,
          uploadDate: new Date().toISOString()
        });

        // 模拟AI解析简历
        await processResumeWithAI(fileUrl.fileList[0].tempFileURL);
        setUploadStatus('success');
        setSuccessMessage('简历上传成功！AI正在分析您的简历...');
        toast({
          title: '上传成功',
          description: '简历已上传并正在处理',
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
  const processResumeWithAI = async fileUrl => {
    try {
      // 模拟AI处理
      setTimeout(async () => {
        const mockResumeData = {
          name: candidateProfile?.name || '候选人',
          email: candidateProfile?.email || '',
          phone: candidateProfile?.phone || '',
          skills: ['JavaScript', 'React', 'Node.js', 'Python'],
          experience: [{
            title: '前端开发工程师',
            company: '示例公司',
            duration: '2022-2024',
            description: '负责前端开发和维护'
          }],
          education: [{
            degree: '计算机科学学士',
            school: '示例大学',
            year: '2022'
          }],
          summary: '具有3年前端开发经验的工程师',
          keywords: ['前端', 'React', 'JavaScript', '团队协作']
        };
        setResumeData(mockResumeData);

        // 保存AI分析结果
        await saveAIAnalysis(mockResumeData);
      }, 2000);
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

  // 渲染文件列表
  const renderFileList = () => {
    return files.map(file => <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg">
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
          <button onClick={() => handleDeleteFile(file.id)} className="text-red-600 hover:text-red-800">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>);
  };

  // 渲染简历预览
  const renderResumePreview = () => {
    if (!resumeData) return null;
    return <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>简历分析结果</span>
            <Button variant="outline" size="sm" onClick={() => setShowPreview(!showPreview)}>
              <Eye className="h-4 w-4 mr-2" />
              {showPreview ? '隐藏' : '显示'}预览
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {showPreview && <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">基本信息</h4>
                <p><strong>姓名:</strong> {resumeData.name}</p>
                <p><strong>邮箱:</strong> {resumeData.email}</p>
                <p><strong>电话:</strong> {resumeData.phone}</p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">技能标签</h4>
                <div className="flex flex-wrap gap-2">
                  {resumeData.skills.map((skill, index) => <Badge key={index} variant="secondary">
                      {skill}
                    </Badge>)}
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">工作经验</h4>
                {resumeData.experience.map((exp, index) => <div key={index} className="mb-2">
                    <p><strong>{exp.title}</strong> at {exp.company}</p>
                    <p className="text-sm text-gray-600">{exp.duration}</p>
                    <p className="text-sm">{exp.description}</p>
                  </div>)}
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">教育背景</h4>
                {resumeData.education.map((edu, index) => <div key={index} className="mb-2">
                    <p><strong>{edu.degree}</strong> - {edu.school}</p>
                    <p className="text-sm text-gray-600">{edu.year}</p>
                  </div>)}
              </div>
            </div>}
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
      
      <div className="max-w-4xl mx-auto p-6">
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
                
                {/* 文件上传区域 */}
                <FileUploadZone onFilesSelected={handleFileUpload} accept=".pdf,.doc,.docx,.txt" maxSize={5 * 1024 * 1024} disabled={isProcessing} />
                
                {/* 文件列表 */}
                {files.length > 0 && <div className="mt-4 space-y-2">
                    {renderFileList()}
                  </div>}
                
                {/* 上传进度 */}
                {uploadStatus === 'uploading' && <div className="mt-4">
                    <Progress value={50} className="w-full" />
                    <p className="text-sm text-gray-600 mt-2">正在上传和处理简历...</p>
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

          {/* 右侧：帮助信息 */}
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
                      <li>• 技能提取</li>
                      <li>• 经验分析</li>
                      <li>• 职位匹配</li>
                      <li>• 优化建议</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 简历预览 */}
            {renderResumePreview()}
          </div>
        </div>
      </div>
    </div>;
}