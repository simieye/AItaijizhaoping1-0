// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { ScrollArea, ScrollBar, Badge } from '@/components/ui';

const topics = [{
  id: 'all',
  name: '全部',
  icon: ''
}, {
  id: 'experience',
  name: '面试经验',
  icon: ''
}, {
  id: 'tips',
  name: '求职技巧',
  icon: '💡'
}, {
  id: 'resources',
  name: '学习资源',
  icon: ''
}, {
  id: 'questions',
  name: '技术问答',
  icon: ''
}, {
  id: 'offers',
  name: 'offer分享',
  icon: ''
}, {
  id: 'networking',
  name: '内推信息',
  icon: ''
}];
export function TopicFilter({
  selectedTopic,
  onTopicChange
}) {
  return <div className="bg-white border-b">
      <ScrollArea className="w-full">
        <div className="flex space-x-2 p-4">
          {topics.map(topic => <Badge key={topic.id} variant={selectedTopic === topic.id ? "default" : "outline"} className={`cursor-pointer px-4 py-2 text-sm ${selectedTopic === topic.id ? 'bg-blue-500 hover:bg-blue-600' : 'hover:bg-gray-100'}`} onClick={() => onTopicChange(topic.id)}>
              <span className="mr-1">{topic.icon}</span>
              {topic.name}
            </Badge>)}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>;
}