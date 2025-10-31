// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Input } from '@/components/ui';
// @ts-ignore;
import { Users, TrendingUp, Shield, Calendar, Search } from 'lucide-react';

export function CandidateFilters({
  selectedFilter,
  onFilterChange,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange
}) {
  const filters = [{
    value: 'all',
    label: '全部候选人',
    icon: Users
  }, {
    value: 'high-match',
    label: '高匹配度',
    icon: TrendingUp
  }, {
    value: 'low-bias',
    label: '低偏见风险',
    icon: Shield
  }, {
    value: 'recent',
    label: '最近活跃',
    icon: Calendar
  }];
  const sortOptions = [{
    value: 'matchScore',
    label: '匹配度'
  }, {
    value: 'experience',
    label: '经验'
  }, {
    value: 'biasScore',
    label: '偏见风险'
  }, {
    value: 'diversityScore',
    label: '多样性'
  }, {
    value: 'lastActive',
    label: '最近活跃'
  }];
  return <div className="flex flex-col md:flex-row gap-4 mb-6">
      <div className="flex-1">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input placeholder="搜索候选人..." value={searchQuery} onChange={e => onSearchChange(e.target.value)} className="pl-10" />
        </div>
      </div>
      <Select value={selectedFilter} onValueChange={onFilterChange}>
        <SelectTrigger className="w-[150px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {filters.map(filter => <SelectItem key={filter.value} value={filter.value}>
              <div className="flex items-center">
                <filter.icon className="w-4 h-4 mr-2" />
                {filter.label}
              </div>
            </SelectItem>)}
        </SelectContent>
      </Select>
      <Select value={sortBy} onValueChange={onSortChange}>
        <SelectTrigger className="w-[150px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {sortOptions.map(option => <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>)}
        </SelectContent>
      </Select>
    </div>;
}