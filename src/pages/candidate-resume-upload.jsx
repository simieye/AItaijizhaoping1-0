// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Switch, Progress, Alert, AlertDescription, AlertTitle, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, useToast } from '@/components/ui';
// @ts-ignore;
import { Upload, Eye, EyeOff, Shield, AlertTriangle, CheckCircle, FileText, Video, Image, Download } from 'lucide-react';

// @ts-ignore;
import { FileUploadZone } from '@/components/FileUploadZone';
// @ts-ignore;
import { BlurPreview } from '@/components/BlurPreview';
// @ts-ignore;

export default function CandidateResumeUpload(props) {
  const [files, setFiles] = useState([]);
  const [blindMode, setBlindMode] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [showVideoConsent, setShowVideoConsent] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [consentLog, setConsentLog] = useState(null);
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

  // 记录同意日志
  const recordConsent = async (type, details) => {
    try {
      await $w.cloud.callDataSource({
        dataSourceName: 'consent_log',
        methodName: 'wedaCreateV2',
        params: {
          data: {
            consentType: type,
            userType: 'candidate',
            userId: $w.auth.currentUser?.userId || 'anonymous',
            regulation: getCurrentRegulation(),
            details: details,
            timestamp: new Date().toISOString(),
            ipAddress: 'auto-detected'
          }
        }
      });
    } catch (error) {
      console.error('记录同意日志失败:', error);
    }
  };

  // 处理文件上传
  const handleFileUpload = async uploadedFiles => {
    const newFiles = uploadedFiles.map(file => ({
      id: Date.now() + Math.random(),
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      preview: URL.createObjectURL(file),
      uploaded: false,
      progress: 0
    }));
    setFiles(prev => [...prev, ...newFiles]);

    // 如果是视频文件，显示AI情感识别确认
    const videoFiles = newFiles.filter(f => f.type.startsWith('video/'));
    if (videoFiles.length > 0) {
      setShowVideoConsent(true);
    }
  };

  // 开始上传
  const startUpload = async () => {
    if (files.length === 0) {
      toast({
        title: "请选择文件",
        description: "请先选择要上传的简历文件",
        variant: "destructive"
      });
      return;
    }
    setIsUploading(true);
    try {
      // 模拟上传进度
      for (let i = 0; i <= 100; i += 10) {
        setUploadProgress(i);
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      // 上传文件到云存储
      const uploadedFiles = [];
      for (const fileData of files) {
        const formData = new FormData();
        formData.append('file', fileData.file);
        formData.append('userId', $w.auth.currentUser?.userId || 'anonymous');
        formData.append('blindMode', blindMode);
        formData.append('regulation', getCurrentRegulation());

        // 这里应该调用云存储API
        const result = await uploadToCloudStorage(formData);
        uploadedFiles.push(result);
      }

      // 记录上传日志
      await recordConsent('resume_upload', {
        files: uploadedFiles.map(f => ({
          name: f.name,
          size: f.size,
          type: f.type,
          blindMode: blindMode
        })),
        regulation: getCurrentRegulation()
      });
      toast({
        title: "上传成功",
        description: `已成功上传${uploadedFiles.length}个文件`
      });

      // 跳转到AI面试页面
      setTimeout(() => {
        $w.utils.navigateTo({
          pageId: 'candidate-ai-interview',
          params: {
            regulation: getCurrentRegulation()
          }
        });
      }, 1500);
    } catch (error) {
      toast({
        title: "上传失败",
        description: error.message || "请稍后重试",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // 模拟云存储上传
  const uploadToCloudStorage = async formData => {
    // 这里应该调用真实的云存储API
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          name: formData.get('file').name,
          size: formData.get('file').size,
          type: formData.get('file').type,
          url: `https://storage.example.com/uploads/${Date.now()}_${formData.get('file').name}`
        });
      }, 1000);
    });
  };

  // 删除文件
  const removeFile = fileId => {
    setFiles(files.filter(f => f.id !== fileId));
  };

  // 获取文件图标
  const getFileIcon = type => {
    if (type.startsWith('image/')) return <Image className="w-5 h-5" />;
    if (type.startsWith('video/')) return <Video className="w-5 h-5" />;
    return <FileText className="w-5 h-5" />;
  };

  // 格式化文件大小
  const formatFileSize = bytes => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  return <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-50 p-4">
      <style jsx>{`
        body {
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
        }
      `}</style>
      
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl">上传简历</CardTitle>
            <CardDescription>支持PDF、Word、图片和视频格式</CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* 盲选模式开关 */}
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div>
                <h3 className="font-semibold flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-blue-600" />
                  盲选模式
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  隐藏个人信息，确保公平评估
                </p>
              </div>
              <Switch checked={blindMode} onCheckedChange={checked => {
              setBlindMode(checked);
              recordConsent('blind_mode', {
                enabled: checked
              });
            }} />
            </div>

            {/* 实时预览效果 */}
            {blindMode && <div className="p-4 bg-yellow-50 rounded-lg">
                <h4 className="font-semibold text-yellow-800 mb-2">盲选模式预览</h4>
                <div className="bg-white p-4 rounded border">
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-300 rounded w-2/3"></div>
                    <p className="text-sm text-gray-500 mt-2">个人信息已隐藏</p>
                  </div>
                </div>
              </div>}

            {/* 文件上传区域 */}
            <FileUploadZone onFilesSelected={handleFileUpload} />

            {/* 上传进度 */}
            {isUploading && <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>上传进度</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} />
              </div>}

            {/* 文件列表 */}
            {files.length > 0 && <div className="space-y-3">
                <h3 className="font-semibold">已选择文件</h3>
                {files.map(file => <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getFileIcon(file.type)}
                      <div>
                        <p className="font-medium text-sm">{file.name}</p>
                        <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => setShowPreview(true)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => removeFile(file.id)}>
                        删除
                      </Button>
                    </div>
                  </div>)}
              </div>}

            {/* 操作按钮 */}
            <div className="flex space-x-4">
              <Button onClick={startUpload} disabled={isUploading || files.length === 0} className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500">
                {isUploading ? '上传中...' : '开始上传'}
              </Button>
              <Button variant="outline" onClick={() => setPreviewMode(!previewMode)}>
                {previewMode ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                {previewMode ? '隐藏预览' : '预览效果'}
              </Button>
            </div>

            {/* 合规提示 */}
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertTitle>合规保障</AlertTitle>
              <AlertDescription>
                您的数据将根据{getCurrentRegulation()}法规进行处理，所有AI分析过程透明可追溯。
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* 视频上传确认弹窗 */}
        <Dialog open={showVideoConsent} onOpenChange={setShowVideoConsent}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>AI情感识别确认</DialogTitle>
              <DialogDescription>
                <div className="space-y-4">
                  <Alert className="bg-yellow-50">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>重要提醒</AlertTitle>
                    <AlertDescription>
                      您正在上传视频文件，AI情感识别功能已根据{getCurrentRegulation()}法规要求禁用。
                    </AlertDescription>
                  </Alert>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold">处理说明：</h4>
                    <ul className="text-sm space-y-1">
                      <li>• 不会进行面部识别或情感分析</li>
                      <li>• 仅提取语音转文字内容</li>
                      <li> • 所有处理过程符合隐私保护要求</li>
                    </ul>
                  </div>
                </div>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowVideoConsent(false)}>
                取消上传
              </Button>
              <Button onClick={() => setShowVideoConsent(false)}>
                <CheckCircle className="w-4 h-4 mr-2" />
                确认上传
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 预览弹窗 */}
        <Dialog open={showPreview} onOpenChange={setShowPreview}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>简历预览</DialogTitle>
              <DialogDescription>
                {blindMode ? '盲选模式下的简历预览' : '原始简历预览'}
              </DialogDescription>
            </DialogHeader>
            <div className="max-h-96 overflow-y-auto">
              {files.map(file => <div key={file.id} className="mb-4">
                  <h4 className="font-semibold mb-2">{file.name}</h4>
                  {file.type.startsWith('image/') ? <img src={file.preview} alt={file.name} className="max-w-full h-auto rounded" /> : <div className="bg-gray-100 p-4 rounded">
                      <p className="text-sm text-gray-600">文件预览不可用</p>
                      <Button variant="outline" size="sm" className="mt-2">
                        <Download className="w-4 h-4 mr-2" />
                        下载查看
                      </Button>
                    </div>}
                </div>)}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>;
}