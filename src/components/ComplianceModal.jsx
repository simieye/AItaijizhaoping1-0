// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, Button, Checkbox } from '@/components/ui';
// @ts-ignore;
import { Shield, AlertTriangle, CheckCircle } from 'lucide-react';

export function ComplianceModal({
  isOpen,
  onClose,
  onAccept,
  type = 'ai_usage'
}) {
  const [gdprConsent, setGdprConsent] = React.useState(false);
  const [chinaConsent, setChinaConsent] = React.useState(false);
  const renderContent = () => {
    switch (type) {
      case 'ai_usage':
        return <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Shield className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <h4 className="font-medium">AI系统使用告知 (EU AI Act Article 13)</h4>
                <p className="text-sm text-gray-600 mt-1">
                  本系统使用AI算法进行简历筛选、面试评估和匹配度计算。所有AI决策均可要求人工复核。
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
              <div>
                <h4 className="font-medium">数据使用授权</h4>
                <p className="text-sm text-gray-600 mt-1">
                  您的数据将用于AI模型训练，但不会用于识别个人身份。可随时撤回授权。
                </p>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <Checkbox checked={gdprConsent} onCheckedChange={setGdprConsent} />
                <span className="text-sm">我同意GDPR数据处理条款</span>
              </label>
              <label className="flex items-center space-x-2">
                <Checkbox checked={chinaConsent} onCheckedChange={setChinaConsent} />
                <span className="text-sm">我同意中国个人信息保护法条款</span>
              </label>
            </div>
          </div>;
      case 'bias_detection':
        return <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <h4 className="font-medium">偏见检测提示</h4>
                <p className="text-sm text-gray-600 mt-1">
                  系统检测到当前内容可能存在偏见风险，建议人工复核。
                </p>
              </div>
            </div>
          </div>;
      default:
        return null;
    }
  };
  return <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>合规提示</DialogTitle>
          <DialogDescription>
            {type === 'ai_usage' ? '请仔细阅读并同意以下条款' : '系统检测到潜在风险'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          {renderContent()}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            取消
          </Button>
          <Button onClick={() => {
          if (type === 'ai_usage' && (!gdprConsent || !chinaConsent)) {
            return;
          }
          onAccept();
        }} disabled={type === 'ai_usage' && (!gdprConsent || !chinaConsent)}>
            确认并继续
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>;
}