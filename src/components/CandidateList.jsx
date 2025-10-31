// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Card, CardContent, Avatar, AvatarFallback, AvatarImage, Badge, Button, useToast } from '@/components/ui';
// @ts-ignore;
import { Eye, EyeOff, Download, Calendar, MapPin, Briefcase, Star } from 'lucide-react';

export function CandidateList({
  candidates = [],
  onCandidateSelect,
  onExport,
  showBlindMode = false,
  className = '',
  compact = false
}) {
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const {
    toast
  } = useToast();
  useEffect(() => {
    // 模拟数据加载
    setTimeout(() => {
      setFilteredCandidates(candidates.length > 0 ? candidates : getMockCandidates());
      setLoading(false);
    }, 500);
  }, [candidates]);
  const getMockCandidates = () => [{
    id: '1',
    name: '张小明',
    avatar: '/avatar1.jpg',
    position: '前端工程师',
    experience: 5,
    location: '北京',
    matchScore: 92,
    status: 'active',
    appliedDate: '2024-01-15',
    skills: ['React', 'TypeScript', 'Node.js']
  }, {
    id: '2',
    name: '李小红',
    avatar: '/avatar2.jpg',
    position: '产品经理',
    experience: 7,
    location: '上海',
    matchScore: 89,
    status: 'screening',
    appliedDate: '2024-01-14',
    skills: ['产品设计', '用户研究', '数据分析']
  }, {
    id: '3',
    name: '王小强',
    avatar: '/avatar3.jpg',
    position: '后端工程师',
    experience: 6,
    location: '深圳',
    matchScore: 87,
    status: 'interview',
    appliedDate: '2024-01-13',
    skills: ['Python', 'Django', 'PostgreSQL']
  }];
  const handleCandidateSelect = candidate => {
    setSelectedCandidate(candidate.id);
    onCandidateSelect?.(candidate);
  };
  const handleExport = (candidate, e) => {
    e.stopPropagation();

    // 模拟导出
    const exportData = {
      candidateId: candidate.id,
      name: candidate.name,
      position: candidate.position,
      matchScore: candidate.matchScore,
      exportDate: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `candidate_${candidate.name}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({
      title: "导出成功",
      description: `候选人 ${candidate.name} 的信息已导出`
    });
  };
  const getStatusBadge = status => {
    const statusMap = {
      active: {
        label: '活跃',
        color: 'bg-green-100 text-green-800'
      },
      screening: {
        label: '筛选中',
        color: 'bg-blue-100 text-blue-800'
      },
      interview: {
        label: '面试中',
        color: 'bg-purple-100 text-purple-800'
      },
      rejected: {
        label: '已拒绝',
        color: 'bg-red-100 text-red-800'
      },
      hired: {
        label: '已录用',
        color: 'bg-green-100 text-green-800'
      }
    };
    return statusMap[status] || statusMap.active;
  };
  const formatDate = dateString => {
    return new Date(dateString).toLocaleDateString('zh-CN');
  };
  const getInitials = name => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };
  if (loading) {
    return <Card className={className}>
        <CardContent className="p-6">
          <div className="space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="flex items-center space-x-4 animate-pulse">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>)}
          </div>
        </CardContent>
      </Card>;
  }
  if (filteredCandidates.length === 0) {
    return <Card className={className}>
        <CardContent className="p-12 text-center">
          <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">暂无候选人</p>
        </CardContent>
      </Card>;
  }
  return <div className={className}>
      {filteredCandidates.map(candidate => <Card key={candidate.id} className={`mb-4 cursor-pointer transition-all hover:shadow-md ${selectedCandidate === candidate.id ? 'ring-2 ring-blue-500' : ''}`} onClick={() => handleCandidateSelect(candidate)}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <Avatar>
                  <AvatarImage src={showBlindMode ? undefined : candidate.avatar} alt={candidate.name} />
                  <AvatarFallback>
                    {showBlindMode ? '?' : getInitials(candidate.name)}
                  </AvatarFallback>
                </Avatar>
                
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="font-semibold">
                      {showBlindMode ? '候选人' : candidate.name}
                    </h4>
                    <Badge className={getStatusBadge(candidate.status).color}>
                      {getStatusBadge(candidate.status).label}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-gray-600">
                    {candidate.position} • {candidate.experience}年经验
                  </p>
                  
                  <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                    <span className="flex items-center">
                      <MapPin className="h-3 w-3 mr-1" />
                      {showBlindMode ? '***' : candidate.location}
                    </span>
                    <span className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {formatDate(candidate.appliedDate)}
                    </span>
                  </div>
                  
                  {!compact && <div className="flex items-center space-x-2 mt-2">
                      <span className="text-xs">匹配度:</span>
                      <div className="flex items-center">
                        <Star className="h-3 w-3 text-yellow-500 mr-1" />
                        <span className="text-xs font-medium">{candidate.matchScore}%</span>
                      </div>
                    </div>}
                </div>
              </div>
              
              <div className="flex flex-col items-end space-y-2">
                <div className="flex items-center space-x-1">
                  {candidate.skills.slice(0, 2).map(skill => <Badge key={skill} variant="outline" className="text-xs">
                      {skill}
                    </Badge>)}
                  {candidate.skills.length > 2 && <Badge variant="outline" className="text-xs">
                      +{candidate.skills.length - 2}
                    </Badge>}
                </div>
                
                <Button size="sm" variant="ghost" onClick={e => handleExport(candidate, e)} className="h-7 px-2">
                  <Download className="h-3 w-3 mr-1" />
                  导出
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>)}
    </div>;
}