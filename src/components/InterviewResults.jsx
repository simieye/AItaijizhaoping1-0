// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Tabs, TabsContent, TabsList, TabsTrigger, Alert, AlertTitle, AlertDescription } from '@/components/ui';
// @ts-ignore;
import { Download, CheckCircle, AlertTriangle, BarChart3, FileText } from 'lucide-react';

// @ts-ignore;
import { BiasDetectionBar } from '@/components/BiasDetectionBar';
export function InterviewResults({
  interviewData,
  biasScore,
  aiExplanation,
  regulation,
  onDownloadPDF
}) {
  const [selectedLanguage, setSelectedLanguage] = useState('zh');
  const translations = {
    zh: {
      title: '面试结果',
      factors: '决策因素',
      bias: '偏见分析',
      download: '下载报告',
      technicalSkills: '技术技能',
      problemSolving: '问题解决',
      communication: '沟通表达',
      learning: '学习能力'
    },
    en: {
      title: 'Interview Results',
      factors: 'Decision Factors',
      bias: 'Bias Analysis',
      download: 'Download Report',
      technicalSkills: 'Technical Skills',
      problemSolving: 'Problem Solving',
      communication: 'Communication',
      learning: 'Learning Ability'
    }
  };
  const t = translations[selectedLanguage] || translations.zh;
  return <Card className="shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl">{t.title}</CardTitle>
        <div className="flex justify-between items-center mt-2">
          <span className="text-sm text-gray-600">基于{regulation}评估</span>
          <Badge variant="outline">人类复核权重: 70%</Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-3">{t.technicalSkills}</h3>
            {interviewData && Object.entries(interviewData.technicalSkills).map(([skill, score]) => <div key={skill} className="flex justify-between items-center mb-2">
                <span className="capitalize">{skill}</span>
                <Badge variant={score >= 85 ? "default" : score >= 70 ? "secondary" : "outline"}>
                  {score}%
                </Badge>
              </div>)}
          </div>
          
          <div>
            <h3 className="font-semibold mb-3">{t.bias}</h3>
            <BiasDetectionBar score={biasScore} />
          </div>
        </div>
        
        <Tabs defaultValue="factors" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="factors">{t.factors}</TabsTrigger>
            <TabsTrigger value="bias">{t.bias}</TabsTrigger>
            <TabsTrigger value="download">{t.download}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="factors" className="space-y-4">
            {aiExplanation?.factors.map((factor, index) => <div key={index} className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">{factor.name}</span>
                  <Badge>{factor.score}/100</Badge>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full" style={{
                width: `${factor.score}%`
              }}></div>
                </div>
                <p className="text-sm text-gray-600">{factor.explanation}</p>
              </div>)}
          </TabsContent>
          
          <TabsContent value="bias">
            <div className="space-y-4">
              <Alert className={aiExplanation?.bias_analysis?.detected ? "bg-red-50" : "bg-green-50"}>
                {aiExplanation?.bias_analysis?.detected ? <AlertTriangle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                <AlertTitle>
                  {aiExplanation?.bias_analysis?.detected ? '检测到偏见' : '未检测到偏见'}
                </AlertTitle>
                <AlertDescription>
                  {aiExplanation?.bias_analysis?.details || '评估过程公平透明'}
                </AlertDescription>
              </Alert>
            </div>
          </TabsContent>
          
          <TabsContent value="download" className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-4">
                下载AI决策解释的详细报告
              </p>
              <div className="flex justify-center space-x-4">
                <Button onClick={() => onDownloadPDF('zh')}>
                  <Download className="w-4 h-4 mr-2" />
                  中文报告
                </Button>
                <Button onClick={() => onDownloadPDF('en')}>
                  <Download className="w-4 h-4 mr-2" />
                  English Report
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>;
}