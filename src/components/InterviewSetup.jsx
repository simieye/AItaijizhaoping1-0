// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button } from '@/components/ui';
// @ts-ignore;
import { CheckCircle, Shield, Eye, BarChart3 } from 'lucide-react';

export function InterviewSetup({
  onStart,
  regulation
}) {
  return <Card className="shadow-xl">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">AI智能面试</CardTitle>
        <CardDescription>基于{regulation}的公平评估</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-3">面试流程</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                4道技术问题
              </li>
              <li className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                实时偏见检测
              </li>
              <li className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                AI决策透明化
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-3">合规保障</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center">
                <Shield className="w-4 h-4 mr-2 text-blue-500" />
                符合{regulation}
              </li>
              <li className="flex items-center">
                <Eye className="w-4 h-4 mr-2 text-blue-500" />
                决策过程透明
              </li>
              <li className="flex items-center">
                <BarChart3 className="w-4 h-4 mr-2 text-blue-500" />
                偏见实时监控
              </li>
            </ul>
          </div>
        </div>
        
        <div className="text-center">
          <Button onClick={onStart} className="bg-gradient-to-r from-cyan-500 to-blue-500">
            开始面试
          </Button>
        </div>
      </CardContent>
    </Card>;
}