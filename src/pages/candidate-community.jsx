// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { useToast } from '@/components/ui';

import { CommunityHeader } from '@/components/CommunityHeader';
import { TopicFilter } from '@/components/TopicFilter';
import { PostCard } from '@/components/PostCard';
import { FloatingActionButton } from '@/components/FloatingActionButton';
import { BottomNav } from '@/components/BottomNav';
// 模拟数据
const mockPosts = [{
  id: 1,
  user: {
    name: '张小明',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    title: '前端工程师'
  },
  content: '刚收到字节跳动的offer！分享一下我的面试经验：1. 算法题一定要刷 2. 项目经验要准备好 3. 保持自信！祝大家都能拿到心仪的offer！',
  images: ['https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=300&fit=crop', 'https://images.unsplash.com/photo-1559028006-448665bd7c7b?w=400&h=300&fit=crop'],
  topic: 'offer分享',
  likes: 128,
  comments: 45,
  time: '2小时前'
}, {
  id: 2,
  user: {
    name: '李小红',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
    title: '产品经理'
  },
  content: '整理了一份产品经理面试高频问题汇总，包含用户调研、需求分析、产品设计等各个方面。需要的同学可以留言，我发给大家！',
  images: [],
  topic: '求职技巧',
  likes: 89,
  comments: 67,
  time: '5小时前'
}, {
  id: 3,
  user: {
    name: '王大牛',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    title: '后端工程师'
  },
  content: '推荐几个学习系统设计的好资源：1. 《Designing Data-Intensive Applications》 2. High Scalability博客 3. LeetCode系统设计题。坚持学习，一定会有收获！',
  images: ['https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400&h=300&fit=crop'],
  topic: '学习资源',
  likes: 256,
  comments: 34,
  time: '1天前'
}, {
  id: 4,
  user: {
    name: '赵小雪',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
    title: '数据分析师'
  },
  content: '有没有同学了解字节跳动数据分析师的面试流程？想请教一下都会问哪些技术问题，特别是SQL和Python相关的。',
  images: [],
  topic: '技术问答',
  likes: 45,
  comments: 23,
  time: '3天前'
}];
export default function CandidateCommunity(props) {
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [activeTab, setActiveTab] = useState('home');
  const {
    toast
  } = useToast();
  const filteredPosts = selectedTopic === 'all' ? mockPosts : mockPosts.filter(post => post.topic === topics.find(t => t.id === selectedTopic)?.name);
  const handleTopicChange = topicId => {
    setSelectedTopic(topicId);
  };
  const handleTabChange = tabId => {
    setActiveTab(tabId);
    if (tabId !== 'home') {
      toast({
        title: "功能开发中",
        description: `${navItems.find(item => item.id === tabId)?.label}功能正在开发中，敬请期待！`
      });
    }
  };
  const handlePublish = () => {
    toast({
      title: "发布动态",
      description: "发布动态功能正在开发中，敬请期待！"
    });
  };
  const handleLike = postId => {
    console.log('Like post:', postId);
  };
  const handleComment = postId => {
    toast({
      title: "评论功能",
      description: "评论功能正在开发中，敬请期待！"
    });
  };
  const handleShare = postId => {
    toast({
      title: "分享功能",
      description: "分享功能正在开发中，敬请期待！"
    });
  };
  const topics = [{
    id: 'all',
    name: '全部'
  }, {
    id: 'experience',
    name: '面试经验'
  }, {
    id: 'tips',
    name: '求职技巧'
  }, {
    id: 'resources',
    name: '学习资源'
  }, {
    id: 'questions',
    name: '技术问答'
  }, {
    id: 'offers',
    name: 'offer分享'
  }, {
    id: 'networking',
    name: '内推信息'
  }];
  const navItems = [{
    id: 'home',
    label: '社区'
  }, {
    id: 'candidates',
    label: '候选人'
  }, {
    id: 'messages',
    label: '消息'
  }, {
    id: 'profile',
    label: '我的'
  }];
  return <div className="min-h-screen bg-gray-50 pb-20">
      <CommunityHeader />
      <TopicFilter selectedTopic={selectedTopic} onTopicChange={handleTopicChange} />
      
      <div className="px-4 py-4">
        {filteredPosts.map(post => <PostCard key={post.id} post={post} onLike={handleLike} onComment={handleComment} onShare={handleShare} />)}
      </div>

      <FloatingActionButton onClick={handlePublish} />
      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
    </div>;
}