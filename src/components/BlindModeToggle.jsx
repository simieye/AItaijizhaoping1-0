// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Switch, Label, useToast } from '@/components/ui';
// @ts-ignore;
import { Eye, EyeOff, Loader2 } from 'lucide-react';

export function BlindModeToggle({
  enabled = false,
  onChange,
  className = '',
  showLabel = true,
  disabled = false,
  size = 'default',
  showIcon = true
}) {
  const [isEnabled, setIsEnabled] = useState(enabled);
  const [loading, setLoading] = useState(false);
  const {
    toast
  } = useToast();

  // 同步外部props变化
  useEffect(() => {
    setIsEnabled(enabled);
  }, [enabled]);
  const handleToggle = async checked => {
    if (loading || disabled) return;
    setLoading(true);
    try {
      setIsEnabled(checked);

      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 300));

      // 调用外部回调
      onChange?.(checked);

      // 显示成功提示
      toast({
        title: checked ? "盲选模式已开启" : "盲选模式已关闭",
        description: checked ? "候选人个人信息已隐藏，确保公平评估" : "已恢复显示候选人完整信息",
        duration: 2000
      });
    } catch (error) {
      // 恢复原始状态
      setIsEnabled(!checked);
      toast({
        title: "操作失败",
        description: "无法切换盲选模式，请稍后重试",
        variant: "destructive",
        duration: 3000
      });
    } finally {
      setLoading(false);
    }
  };
  const getIcon = () => {
    if (loading) {
      return <Loader2 className="h-4 w-4 animate-spin" />;
    }
    return isEnabled ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />;
  };
  const getLabelText = () => {
    return isEnabled ? "盲选模式已开启" : "盲选模式已关闭";
  };
  const getDescription = () => {
    return isEnabled ? "隐藏候选人个人信息，确保公平评估" : "显示候选人完整信息";
  };
  return <div className={`flex items-center space-x-3 ${className}`}>
      {showIcon && <div className="text-gray-500">
          {getIcon()}
        </div>}
      
      <Switch checked={isEnabled} onCheckedChange={handleToggle} disabled={loading || disabled} aria-label="盲选模式切换" className={size === 'sm' ? 'scale-90' : ''} />
      
      {showLabel && <div className="flex flex-col">
          <Label htmlFor="blind-mode-toggle" className="text-sm font-medium cursor-pointer">
            {getLabelText()}
          </Label>
          <span className="text-xs text-gray-500">
            {getDescription()}
          </span>
        </div>}
    </div>;
}

// 简化版盲选模式指示器
export function BlindModeIndicator({
  enabled,
  className = ''
}) {
  return <div className={`flex items-center space-x-2 ${className}`}>
      {enabled ? <>
          <EyeOff className="h-4 w-4 text-green-500" />
          <span className="text-sm text-green-600 font-medium">盲选模式已开启</span>
        </> : <>
          <Eye className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-600">盲选模式已关闭</span>
        </>}
    </div>;
}

// 盲选模式配置面板
export function BlindModeConfig({
  settings = {},
  onSettingsChange,
  className = ''
}) {
  const [localSettings, setLocalSettings] = useState({
    hideName: true,
    hidePhoto: true,
    hideAge: true,
    hideGender: true,
    hideLocation: true,
    hideEducation: true,
    ...settings
  });
  const handleSettingChange = (key, value) => {
    const newSettings = {
      ...localSettings,
      [key]: value
    };
    setLocalSettings(newSettings);
    onSettingsChange?.(newSettings);
  };
  return <div className={`space-y-4 ${className}`}>
      <h4 className="font-medium text-sm">盲选模式配置</h4>
      
      <div className="grid grid-cols-2 gap-3">
        {Object.entries(localSettings).map(([key, value]) => <div key={key} className="flex items-center space-x-2">
            <Switch checked={value} onCheckedChange={checked => handleSettingChange(key, checked)} size="sm" />
            <Label className="text-sm">
              {key.replace('hide', '隐藏').replace(/([A-Z])/g, ' $1').trim()}
            </Label>
          </div>)}
      </div>
    </div>;
}