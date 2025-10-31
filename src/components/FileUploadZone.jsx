// @ts-ignore;
import React, { useState, useCallback } from 'react';
// @ts-ignore;
import { Card, CardContent, Button, Progress, useToast } from '@/components/ui';
// @ts-ignore;
import { Upload, File, X, AlertCircle } from 'lucide-react';

export function FileUploadZone({
  onFilesSelected,
  maxFiles = 5,
  maxSize = 10 * 1024 * 1024,
  // 10MB
  acceptedTypes = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png', '.mp4'],
  className = ''
}) {
  const [files, setFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [errors, setErrors] = useState([]);
  const [isDragActive, setIsDragActive] = useState(false);
  const {
    toast
  } = useToast();
  const handleDragOver = useCallback(e => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  }, []);
  const handleDragLeave = useCallback(e => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  }, []);
  const handleDrop = useCallback(e => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    const newErrors = [];
    const acceptedFiles = [];
    if (droppedFiles.length + files.length > maxFiles) {
      newErrors.push(`最多只能上传 ${maxFiles} 个文件`);
    }
    droppedFiles.forEach(file => {
      if (file.size > maxSize) {
        newErrors.push(`${file.name} 文件过大，最大支持 ${maxSize / 1024 / 1024}MB`);
      } else {
        const ext = '.' + file.name.split('.').pop().toLowerCase();
        if (!acceptedTypes.includes(ext)) {
          newErrors.push(`${file.name} 文件类型不支持，支持的格式：${acceptedTypes.join(', ')}`);
        } else {
          acceptedFiles.push(file);
        }
      }
    });
    if (newErrors.length > 0) {
      setErrors(newErrors);
      newErrors.forEach(error => {
        toast({
          title: "上传错误",
          description: error,
          variant: "destructive"
        });
      });
    }
    if (acceptedFiles.length > 0) {
      const newFiles = acceptedFiles.map(file => ({
        file,
        id: Math.random().toString(36).substring(2),
        name: file.name,
        size: file.size,
        type: file.type,
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
        status: 'pending'
      }));
      setFiles(prev => [...prev, ...newFiles]);
      onFilesSelected?.(acceptedFiles);
      newFiles.forEach(file => {
        simulateUpload(file.id);
      });
    }
  }, [maxSize, acceptedTypes, maxFiles, files, onFilesSelected, toast]);
  const handleFileInputChange = useCallback(e => {
    const selectedFiles = Array.from(e.target.files);
    const newErrors = [];
    const acceptedFiles = [];
    if (selectedFiles.length + files.length > maxFiles) {
      newErrors.push(`最多只能上传 ${maxFiles} 个文件`);
    }
    selectedFiles.forEach(file => {
      if (file.size > maxSize) {
        newErrors.push(`${file.name} 文件过大，最大支持 ${maxSize / 1024 / 1024}MB`);
      } else {
        const ext = '.' + file.name.split('.').pop().toLowerCase();
        if (!acceptedTypes.includes(ext)) {
          newErrors.push(`${file.name} 文件类型不支持，支持的格式：${acceptedTypes.join(', ')}`);
        } else {
          acceptedFiles.push(file);
        }
      }
    });
    if (newErrors.length > 0) {
      setErrors(newErrors);
      newErrors.forEach(error => {
        toast({
          title: "上传错误",
          description: error,
          variant: "destructive"
        });
      });
    }
    if (acceptedFiles.length > 0) {
      const newFiles = acceptedFiles.map(file => ({
        file,
        id: Math.random().toString(36).substring(2),
        name: file.name,
        size: file.size,
        type: file.type,
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
        status: 'pending'
      }));
      setFiles(prev => [...prev, ...newFiles]);
      onFilesSelected?.(acceptedFiles);
      newFiles.forEach(file => {
        simulateUpload(file.id);
      });
    }
  }, [maxSize, acceptedTypes, maxFiles, files, onFilesSelected, toast]);
  const simulateUpload = fileId => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 20;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setFiles(prev => prev.map(f => f.id === fileId ? {
          ...f,
          status: 'completed'
        } : f));
      }
      setUploadProgress(prev => ({
        ...prev,
        [fileId]: progress
      }));
    }, 200);
  };
  const removeFile = fileId => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
    setUploadProgress(prev => {
      const newProgress = {
        ...prev
      };
      delete newProgress[fileId];
      return newProgress;
    });
  };
  const formatFileSize = bytes => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  return <div className={className}>
      <div onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}>
        <input type="file" multiple onChange={handleFileInputChange} className="hidden" id="file-upload" />
        <label htmlFor="file-upload" className="cursor-pointer">
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-sm text-gray-600">
            {isDragActive ? '释放文件以上传' : '拖拽文件到此处，或点击选择文件'}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            支持 {acceptedTypes.join(', ')}，最大 {maxFiles} 个文件，每个文件不超过 {maxSize / 1024 / 1024}MB
          </p>
        </label>
      </div>

      {errors.length > 0 && <div className="mt-4 space-y-2">
          {errors.map((error, index) => <div key={index} className="flex items-center text-sm text-red-600">
              <AlertCircle className="h-4 w-4 mr-2" />
              {error}
            </div>)}
        </div>}

      {files.length > 0 && <div className="mt-4 space-y-3">
          <h4 className="text-sm font-medium">已选择文件：</h4>
          {files.map(file => <Card key={file.id} className="p-3">
              <CardContent className="p-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {file.preview ? <img src={file.preview} alt={file.name} className="w-10 h-10 rounded object-cover" /> : <File className="h-10 w-10 text-gray-400" />}
                    <div>
                      <p className="text-sm font-medium">{file.name}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {file.status === 'pending' && <div className="w-20">
                        <Progress value={uploadProgress[file.id] || 0} className="h-2" />
                      </div>}
                    <Button variant="ghost" size="sm" onClick={() => removeFile(file.id)} aria-label="移除文件">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>)}
        </div>}
    </div>;
}