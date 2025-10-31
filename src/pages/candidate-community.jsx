// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Avatar, AvatarFallback, AvatarImage, Input, Textarea, useToast } from '@/components/ui';
// @ts-ignore;
import { Heart, MessageCircle, Share2, Bookmark, TrendingUp, Users, Calendar, Filter, Search, Plus } from 'lucide-react';

// @ts-ignore;
import { CommunityHeader } from '@/components/CommunityHeader';
// @ts-ignore;
import { TopicFilter } from '@/components/TopicFilter';
// @ts-ignore;
import { PostCard } from '@/components/PostCard';
// @ts-ignore;
import { FloatingActionButton } from '@/components/FloatingActionButton';
// @ts-ignore;
import { BottomNav } from '@/components/BottomNav';
export default function CandidateCommunity(props) {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [modelConfidence, setModelConfidence] = useState(92);
  const [algorithmVersion, setAlgorithmVersion] = useState('v2.3.1');
  const [regulationVersion, setRegulationVersion] = useState('EU_AI_Act_2025_v3');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    tags: []
  });
  const {
    toast
  } = useToast();
  const {
    $w
  } = props;

  // 获取当前法规
  const getCurrentRegulation = () => {
    const region = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (region.includes('Europe')) return 'EU_AI_Act';
    if (region.includes('America')) return 'US_State_Bias_Audit';
    if (region.includes('Asia/Shanghai')) return 'China_Content_Review';
    return 'EU_AI_Act';
  };

  // 获取社区帖子
  const fetchPosts = async () => {
    try {
      const posts = await $w.cloud.callDataSource({
        dataSourceName: 'community_post',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              status: {
                $eq: 'published'
              }
            }
          },
          select: {
            $master: true
          },
          orderBy: [{
            createdAt: 'desc'
          }],
          pageSize: 50
        }
      });

      // 获取AI解释数据
      const postIds = posts.records?.map(post => post.postId) || [];
      let enrichedPosts = [];
      if (postIds.length > 0) {
        const [aiExplanations, users] = await Promise.all([$w.cloud.callDataSource({
          dataSourceName: 'ai_explanation_2025',
          methodName: 'wedaGetRecordsV2',
          params: {
            filter: {
              where: {
                entityType: {
                  $eq: 'community_post'
                },
                entityId: {
                  $in: postIds
                }
              }
            },
            select: {
              $master: true
            },
            orderBy: [{
              createdAt: 'desc'
            }]
          }
        }), $w.cloud.callDataSource({
          dataSourceName: 'user',
          methodName: 'wedaGetRecordsV2',
          params: {
            filter: {
              where: {
                userId: {
                  $in: posts.records?.map(post => post.authorId) || []
                }
              }
            },
            select: {
              $master: true
            }
          }
        })]);
        enrichedPosts = posts.records?.map(post => {
          const explanation = aiExplanations.records?.find(e => e.entityId === post.postId);
          const author = users.records?.find(u => u.userId === post.authorId);
          return {
            ...post,
            author: {
              name: author?.name || '匿名用户',
              avatar: author?.avatarUrl || '/default-avatar.png',
              role: author?.role || '求职者'
            },
            modelConfidence: explanation?.modelConfidence || 92,
            algorithmVersion: explanation?.algorithmVersion || 'v2.3.1',
            tags: post.tags || [],
            likes: post.likes || 0,
            comments: post.comments || 0,
            shares: post.shares || 0,
            isLiked: post.likedBy?.includes($w.auth.currentUser?.userId) || false,
            isBookmarked: post.bookmarkedBy?.includes($w.auth.currentUser?.userId) || false
          };
        }) || [];
      }
      setPosts(enrichedPosts);
      setFilteredPosts(enrichedPosts);
    } catch (error) {
      console.error('获取社区帖子失败:', error);
      // 使用模拟数据
      setPosts([{
        id: '1',
        title: 'AI面试经验分享',
        content: '今天参加了AI面试，感觉非常新颖！系统根据我的回答实时调整问题，整个过程很流畅。',
        author: {
          name: '张小明',
          avatar: '/avatar1.jpg',
          role: '前端工程师'
        },
        tags: ['AI面试', '经验分享'],
        likes: 45,
        comments: 12,
        shares: 8,
        createdAt: new Date().toISOString(),
        modelConfidence: 92,
        algorithmVersion: 'v2.3.1'
      }, {
        id: '2',
        title: '偏见检测功能体验',
        content: '系统检测到我的简历可能存在性别偏见，经过调整后获得了更好的匹配结果！',
        author: {
          name: '李小红',
          avatar: '/avatar2.jpg',
          role: '产品经理'
        },
        tags: ['偏见检测', 'DEI'],
        likes: 32,
        comments: 15,
        shares: 5,
        createdAt: new Date().toISOString(),
        modelConfidence: 95,
        algorithmVersion: 'v2.3.1'
      }]);
      setFilteredPosts([{
        id: '1',
        title: 'AI面试经验分享',
        content: '今天参加了AI面试，感觉非常新颖！系统根据我的回答实时调整问题，整个过程很流畅。',
        author: {
          name: '张小明',
          avatar: '/avatar1.jpg',
          role: '前端工程师'
        },
        tags: ['AI面试', '经验分享'],
        likes: 45,
        comments: 12,
        shares: 8,
        createdAt: new Date().toISOString(),
        modelConfidence: 92,
        algorithmVersion: 'v2.3.1'
      }, {
        id: '2',
        title: '偏见检测功能体验',
        content: '系统检测到我的简历可能存在性别偏见，经过调整后获得了更好的匹配结果！',
        author: {
          name: '李小红',
          avatar: '/avatar2.jpg',
          role: '产品经理'
        },
        tags: ['偏见检测', 'DEI'],
        likes: 32,
        comments: 15,
        shares: 5,
        createdAt: new Date().toISOString(),
        modelConfidence: 95,
        algorithmVersion: 'v2.3.1'
      }]);
    } finally {
      setLoading(false);
    }
  };

  // 创建新帖子
  const createPost = async () => {
    if (!newPost.title || !newPost.content) {
      toast({
        title: "请填写完整信息",
        description: "标题和内容不能为空",
        variant: "destructive"
      });
      return;
    }
    try {
      const post = await $w.cloud.callDataSource({
        dataSourceName: 'community_post',
        methodName: 'wedaCreateV2',
        params: {
          data: {
            title: newPost.title,
            content: newPost.content,
            tags: newPost.tags,
            authorId: $w.auth.currentUser?.userId || 'anonymous',
            status: 'published',
            createdAt: new Date().toISOString(),
            likes: 0,
            comments: 0,
            shares: 0
          }
        }
      });
      toast({
        title: "发布成功",
        description: "您的帖子已成功发布到社区"
      });
      setShowCreatePost(false);
      setNewPost({
        title: '',
        content: '',
        tags: []
      });
      fetchPosts();
    } catch (error) {
      console.error('创建帖子失败:', error);
      toast({
        title: "发布失败",
        description: "请稍后重试",
        variant: "destructive"
      });
    }
  };

  // 过滤帖子
  const filterPosts = () => {
    let filtered = posts;
    if (selectedTopic !== 'all') {
      filtered = filtered.filter(post => post.tags.includes(selectedTopic));
    }
    if (searchQuery) {
      filtered = filtered.filter(post => post.title.toLowerCase().includes(searchQuery.toLowerCase()) || post.content.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    setFilteredPosts(filtered);
  };

  // 点赞帖子
  const likePost = async postId => {
    try {
      await $w.cloud.callDataSource({
        dataSourceName: 'community_post',
        methodName: 'wedaUpdateV2',
        params: {
          data: {
            likes: posts.find(p => p.id === postId).likes + 1
          },
          filter: {
            where: {
              postId: {
                $eq: postId
              }
            }
          }
        }
      });
      setPosts(posts.map(post => post.id === postId ? {
        ...post,
        likes: post.likes + 1,
        isLiked: true
      } : post));
    } catch (error) {
      console.error('点赞失败:', error);
    }
  };

  // 收藏帖子
  const bookmarkPost = async postId => {
    try {
      await $w.cloud.callDataSource({
        dataSourceName: 'community_post',
        methodName: 'wedaUpdateV2',
        params: {
          data: {
            bookmarkedBy: [$w.auth.currentUser?.userId || 'anonymous']
          },
          filter: {
            where: {
              postId: {
                $eq: postId
              }
            }
          }
        }
      });
      setPosts(posts.map(post => post.id === postId ? {
        ...post,
        isBookmarked: !post.isBookmarked
      } : post));
    } catch (error) {
      console.error('收藏失败:', error);
    }
  };
  useEffect(() => {
    fetchPosts();
  }, []);
  useEffect(() => {
    filterPosts();
  }, [selectedTopic, searchQuery, posts]);
  const topics = ['all', 'AI面试', '偏见检测', 'DEI', '经验分享', '求职技巧'];
  return <div className="min-h-screen bg-gray-50">
      <style jsx>{`
        body {
          background: #f9fafb;
        }
      `}</style>
      
      <CommunityHeader />
      
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* 搜索和过滤 */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input placeholder="搜索帖子..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10" />
            </div>
          </div>
          <TopicFilter topics={topics} selectedTopic={selectedTopic} onTopicChange={setSelectedTopic} />
        </div>

        {/* AI推荐置信度 */}
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-600">
            <TrendingUp className="inline h-4 w-4 mr-1" />
            AI推荐置信度: {modelConfidence}% | 算法版本: {algorithmVersion}
          </p>
        </div>

        {/* 帖子列表 */}
        {loading ? <div className="space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                </div>
              </div>)}
          </div> : <div className="space-y-4">
            {filteredPosts.map(post => <PostCard key={post.id} post={post} onLike={likePost} onBookmark={bookmarkPost} onShare={() => console.log('分享:', post.id)} />)}
          </div>}

        {/* 无结果提示 */}
        {filteredPosts.length === 0 && !loading && <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">暂无相关帖子</p>
          </div>}
      </div>

      {/* 创建帖子弹窗 */}
      {showCreatePost && <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
            <h3 className="text-lg font-semibold mb-4">创建新帖子</h3>
            <div className="space-y-4">
              <Input placeholder="帖子标题" value={newPost.title} onChange={e => setNewPost({
            ...newPost,
            title: e.target.value
          })} />
              <Textarea placeholder="分享你的经验..." value={newPost.content} onChange={e => setNewPost({
            ...newPost,
            content: e.target.value
          })} rows={4} />
              <Input placeholder="标签（用逗号分隔）" value={newPost.tags.join(',')} onChange={e => setNewPost({
            ...newPost,
            tags: e.target.value.split(',').map(tag => tag.trim())
          })} />
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <Button variant="outline" onClick={() => setShowCreatePost(false)}>
                取消
              </Button>
              <Button onClick={createPost}>
                发布
              </Button>
            </div>
          </div>
        </div>}

      <FloatingActionButton onClick={() => setShowCreatePost(true)} />
      <BottomNav />
    </div>;
}