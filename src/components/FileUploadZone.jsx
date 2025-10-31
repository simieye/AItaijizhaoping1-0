// @ts-ignore;
import React, { useCallback, useState } from 'react';
// @ts-ignore;
import { Upload, File, X } from 'lucide-react';
// @ts-ignore;
import { Card, Progress, Button } from '@/components/ui';

export function FileUploadZone({
  onFileUpload,
  uploadedFiles = [],
  onRemoveFile
}) {
  const [isDragActive, setIsDragActive] = useState(false);
  const handleDragOver = useCallback(event => {
    event.preventDefault();
    setIsDragActive(true);
  }, []);
  const handleDragLeave = useCallback(event => {
    event.preventDefault();
    setIsDragActive(false);
  }, []);
  const handleDrop = useCallback(event => {
    event.preventDefault();
    setIsDragActive(false);
    const files = Array.from(event.dataTransfer.files);
    onFileUpload(files);
  }, [onFileUpload]);
  const handleFileInputChange = useCallback(event => {
    const files = Array.from(event.target.files);
    onFileUpload(files);
  }, [onFileUpload]);
  return <div className="space-y-4">
      <Card onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${isDragActive ? 'border-cyan-500 bg-cyan-50' : 'border-gray-300 hover:border-gray-400'}`}>
        <input type="file" multiple accept=".pdf,.png,.jpg,.jpeg,.gif,.mp4,.avi,.mov" onChange={handleFileInputChange} className="hidden" id="file-upload-input" />
        <label htmlFor="file-upload-input" className="cursor-pointer">
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-lg font-medium">
            {isDragActive ? '释放文件以上传' : '拖拽文件到此处，或点击选择文件'}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            支持 PDF、图片、视频格式，最大 50MB
          </p>
        </label>
      </Card>

      {uploadedFiles.length > 0 && <div className="space-y-2">
          <h3 className="font-medium">已上传文件</h3>
          {uploadedFiles.map((file, index) => <Card key={index} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <File className="h-8 w-8 text-cyan-500" />
                  <div>
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {file.progress !== undefined && <Progress value={file.progress} className="w-24" />}
                  <Button variant="ghost" size="icon" onClick={() => onRemoveFile(index)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>)}
        </div>}
    </div>;
}