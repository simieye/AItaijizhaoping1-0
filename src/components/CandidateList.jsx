// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Progress } from '@/components/ui';
// @ts-ignore;
import { Eye, Download, Filter, AlertTriangle, CheckCircle } from 'lucide-react';

export function CandidateList({
  candidates,
  onViewDetails,
  onExportReport,
  algorithmVersions
}) {
  const [selectedVersion, setSelectedVersion] = useState('all');
  const [sortBy, setSortBy] = useState('score');
  const filteredCandidates = candidates.filter(candidate => selectedVersion === 'all' || candidate.algorithmVersion === selectedVersion);
  const getBiasColor = score => {
    if (score <= 3) return 'text-green-500';
    if (score <= 6) return 'text-yellow-500';
    return 'text-red-500';
  };
  const getBiasBadge = score => {
    if (score <= 3) return 'success';
    if (score <= 6) return 'warning';
    return 'destructive';
  };
  return <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>候选人列表</CardTitle>
          <div className="flex space-x-2">
            <Select value={selectedVersion} onValueChange={setSelectedVersion}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="算法版本" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部版本</SelectItem>
                {algorithmVersions.map(version => <SelectItem key={version} value={version}>
                    {version}
                  </SelectItem>)}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              筛选
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredCandidates.map(candidate => <div key={candidate.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold">{candidate.name}</h3>
                  <p className="text-sm text-gray-600">{candidate.position}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={getBiasBadge(candidate.biasScore)} className={getBiasColor(candidate.biasScore)}>
                    {candidate.biasScore <= 3 ? <CheckCircle className="h-3 w-3 mr-1" /> : <AlertTriangle className="h-3 w-3 mr-1" />}
                    偏见风险: {candidate.biasScore}%
                  </Badge>
                  <Badge variant="outline">{candidate.algorithmVersion}</Badge>
                </div>
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>匹配度: {candidate.matchScore}%</span>
                <span>经验: {candidate.experience}年</span>
                <span>算法版本: {candidate.algorithmVersion}</span>
              </div>
              <div className="mt-3 flex space-x-2">
                <Button size="sm" variant="outline" onClick={() => onViewDetails(candidate)}>
                  <Eye className="h-4 w-4 mr-2" />
                  查看详情
                </Button>
                <Button size="sm" variant="outline" onClick={() => onExportReport(candidate)}>
                  <Download className="h-4 w-4 mr-2" />
                  导出报告
                </Button>
              </div>
            </div>)}
        </div>
      </CardContent>
    </Card>;
}