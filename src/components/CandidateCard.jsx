// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, Avatar, AvatarFallback, AvatarImage } from '@/components/ui';
// @ts-ignore;
import { Eye, Download, MapPin, DollarSign, Calendar, TrendingUp, Shield, Star } from 'lucide-react';

export function CandidateCard({
  candidate,
  onViewDetails,
  onExportReport
}) {
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
  const getInitials = name => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };
  return <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarImage src={candidate.avatar} alt={candidate.name} />
              <AvatarFallback>{getInitials(candidate.name)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{candidate.name}</CardTitle>
              <p className="text-sm text-gray-600">{candidate.position}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant={getBiasBadge(candidate.biasScore)} className={getBiasColor(candidate.biasScore)}>
              偏见风险: {candidate.biasScore}%
            </Badge>
            <Badge variant="outline">{candidate.algorithmVersion}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span className="flex items-center">
              <MapPin className="h-4 w-4 mr-1" />
              {candidate.location}
            </span>
            <span className="flex items-center">
              <DollarSign className="h-4 w-4 mr-1" />
              {candidate.salary}
            </span>
            <span className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              {candidate.experience}年经验
            </span>
          </div>
          
          <div className="flex items-center space-x-4 text-sm">
            <span className="flex items-center">
              <TrendingUp className="h-4 w-4 mr-1" />
              匹配度: {candidate.matchScore}%
            </span>
            <span className="flex items-center">
              <Star className="h-4 w-4 mr-1" />
              多样性: {candidate.diversityScore}/100
            </span>
            <span className="flex items-center">
              <Shield className="h-4 w-4 mr-1" />
              AI置信度: {candidate.modelConfidence}%
            </span>
          </div>

          <div className="flex flex-wrap gap-1">
            {candidate.skills.slice(0, 5).map(skill => <Badge key={skill} variant="secondary" className="text-xs">
                {skill}
              </Badge>)}
            {candidate.skills.length > 5 && <Badge variant="outline" className="text-xs">
                +{candidate.skills.length - 5}
              </Badge>}
          </div>

          <div className="flex justify-between items-center pt-3">
            <span className="text-xs text-gray-500">
              最近活跃: {new Date(candidate.lastActive).toLocaleDateString()}
            </span>
            <div className="flex space-x-2">
              <Button size="sm" variant="outline" onClick={() => onViewDetails(candidate)}>
                <Eye className="h-4 w-4 mr-1" />
                查看详情
              </Button>
              <Button size="sm" variant="outline" onClick={() => onExportReport(candidate)}>
                <Download className="h-4 w-4 mr-1" />
                导出报告
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>;
}