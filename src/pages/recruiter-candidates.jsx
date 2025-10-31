// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Checkbox, Alert, AlertDescription } from '@/components/ui';
// @ts-ignore;
import { Users, Shield, AlertTriangle, CheckCircle, Eye, EyeOff, Download } from 'lucide-react';

// @ts-ignore;
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { ThemeToggle } from '@/components/ThemeToggle';
import { AccessibilityMenu } from '@/components/AccessibilityMenu';
import { BiasDetectionBar } from '@/components/BiasDetectionBar';
export default function RecruiterCandidates(props) {
  const {
    $w
  } = props;
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [humanReviewConfirmed, setHumanReviewConfirmed] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const [colorBlindMode, setColorBlindMode] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [language, setLanguage] = useState('zh');
  const [showBiasWarning, setShowBiasWarning] = useState(false);

  // 模拟候选人数据
  const mockCandidates = [{
    id: '1',
    name: '张三',
    position: '高级前端工程师',
    matchScore: 92,
    biasRisk: 3,
    diversityScore: 85,
    experience: '5年',
    skills: ['React', 'TypeScript', 'Node.js'],
    education: '硕士',
    location: '北京',
    status: '面试中',
    humanReviewWeight: 70
  }, {
    id: '2',
    name: '李四',
    position: '全栈开发工程师',
    matchScore: 88,
    biasRisk: 7,
    diversityScore: 75,
    experience: '4年',
    skills: ['Python', 'Django', 'React'],
    education: '本科',
    location: '上海',
    status: '待筛选',
    humanReviewWeight: 70
  }, {
    id: '3',
    name: '王五',
    position: '后端架构师',
    matchScore: 95,
    biasRisk: 2,
    diversityScore: 90,
    experience: '8年',
    skills: ['Java', 'Spring', 'Microservices'],
    education: '硕士',
    location: '深圳',
    status: '已通过',
    humanReviewWeight: 70
  }, {
    id: '4',
    name: '赵六',
    position: '数据科学家',
    matchScore: 85,
    biasRisk: 8,
    diversityScore: 70,
    experience: '3年',
    skills: ['Python', 'Machine Learning', 'TensorFlow'],
    education: '博士',
    location: '杭州',
    status: '待面试',
    humanReviewWeight: 70
  }];
  useEffect(() => {
    setCandidates(mockCandidates);
  }, []);
  const handleSelectCandidate = candidateId => {
    setSelectedCandidates(prev => prev.includes(candidateId) ? prev.filter(id => id !== candidateId) : [...prev, candidateId]);
  };
  const handleBatchAction = async action => {
    if (!humanReviewConfirmed && selectedCandidates.length > 0) {
      setShowBiasWarning(true);
      return;
    }
    try {
      // 模拟批量操作
      console.log(`执行批量操作: ${action}`, selectedCandidates);

      // 更新候选人状态
      const updatedCandidates = candidates.map(candidate => selectedCandidates.includes(candidate.id) ? {
        ...candidate,
        status: action === 'interview' ? '面试中' : action === 'reject' ? '已拒绝' : candidate.status
      } : candidate);
      setCandidates(updatedCandidates);
      setSelectedCandidates([]);
      setHumanReviewConfirmed(false);
    } catch (error) {
      console.error('批量操作失败:', error);
    }
  };
  const handleExportReport = () => {
    const report = {
      exportDate: new Date(),
      totalCandidates: candidates.length,
      averageMatchScore: candidates.reduce((sum, c) => sum + c.matchScore, 0) / candidates.length,
      averageBiasRisk: candidates.reduce((sum, c) => sum + c.biasRisk, 0) / candidates.length,
      diversityMetrics: {
        highDiversity: candidates.filter(c => c.diversityScore >= 80).length,
        mediumDiversity: candidates.filter(c => c.diversityScore >= 60 && c.diversityScore < 80).length,
        lowDiversity: candidates.filter(c => c.diversityScore < 60).length
      },
      candidates: candidates.map(c => ({
        id: c.id,
        name: c.name,
        position: c.position,
        matchScore: c.matchScore,
        biasRisk: c.biasRisk,
        diversityScore: c.diversityScore,
        status: c.status
      }))
    };
    console.log('导出候选人报告:', report);
    alert('候选人报告已导出！');
  };
  return <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 p-4`}>
      <style jsx>{`
        body {
          font-size: ${fontSize}px;
        }
        ${colorBlindMode ? `
          * {
            filter: hue-rotate(15deg) saturate(0.8);
          }
        ` : ''}
      `}</style>

      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">
            候选人管理（合规版）
          </h1>
          <div className="flex items-center space-x-2">
            <LanguageSwitcher currentLang={language} onLanguageChange={setLanguage} />
            <ThemeToggle isDark={isDark} onToggle={() => setIsDark(!isDark)} />
            <AccessibilityMenu fontSize={fontSize} onFontSizeChange={setFontSize} colorBlindMode={colorBlindMode} onColorBlindToggle={() => setColorBlindMode(!colorBlindMode)} />
          </div>
        </div>

        {showBiasWarning && <Alert className="mb-4 border-red-500 bg-red-50">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              检测到高风险候选人，需要人工复核确认。请勾选"人类最终决策"确认框后再执行操作。
            </AlertDescription>
          </Alert>}

        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>候选人列表</CardTitle>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={handleExportReport}>
                  <Download className="h-4 w-4 mr-1" />
                  导出报告
                </Button>
                <label className="flex items-center space-x-2">
                  <Checkbox checked={humanReviewConfirmed} onCheckedChange={setHumanReviewConfirmed} />
                  <span className="text-sm">人类最终决策确认</span>
                </label>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">
                      <Checkbox checked={selectedCandidates.length === candidates.length} onCheckedChange={checked => {
                      if (checked) {
                        setSelectedCandidates(candidates.map(c => c.id));
                      } else {
                        setSelectedCandidates([]);
                      }
                    }} />
                    </th>
                    <th className="text-left p-2">候选人</th>
                    <th className="text-left p-2">匹配度</th>
                    <th className="text-left p-2">偏见风险</th>
                    <th className="text-left p-2">多样性积分</th>
                    <th className="text-left p-2">状态</th>
                    <th className="text-left p-2">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {candidates.map(candidate => <tr key={candidate.id} className="border-b hover:bg-gray-50">
                      <td className="p-2">
                        <Checkbox checked={selectedCandidates.includes(candidate.id)} onCheckedChange={() => handleSelectCandidate(candidate.id)} />
                      </td>
                      <td className="p-2">
                        <div>
                          <div className="font-medium">{candidate.name}</div>
                          <div className="text-sm text-gray-600">{candidate.position}</div>
                          <div className="text-xs text-gray-500">{candidate.experience} | {candidate.education} | {candidate.location}</div>
                        </div>
                      </td>
                      <td className="p-2">
                        <Badge variant="default">{candidate.matchScore}%</Badge>
                      </td>
                      <td className="p-2">
                        <BiasDetectionBar score={candidate.biasRisk} threshold={5} />
                      </td>
                      <td className="p-2">
                        <Badge variant="secondary" className="bg-green-100">
                          {candidate.diversityScore}
                        </Badge>
                      </td>
                      <td className="p-2">
                        <Badge variant={candidate.status === '已通过' ? 'default' : candidate.status === '面试中' ? 'secondary' : candidate.status === '待面试' ? 'outline' : 'destructive'}>
                          {candidate.status}
                        </Badge>
                      </td>
                      <td className="p-2">
                        <Button size="sm" variant="outline">查看详情</Button>
                      </td>
                    </tr>)}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            已选择 {selectedCandidates.length} 位候选人
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => handleBatchAction('screening')} disabled={selectedCandidates.length === 0}>
              批量初筛
            </Button>
            <Button variant="secondary" onClick={() => handleBatchAction('interview')} disabled={selectedCandidates.length === 0}>
              批量面试
            </Button>
            <Button variant="destructive" onClick={() => handleBatchAction('reject')} disabled={selectedCandidates.length === 0}>
              批量拒绝
            </Button>
          </div>
        </div>
      </div>
    </div>;
}