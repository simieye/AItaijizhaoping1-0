// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Heart, MessageCircle, Share2, MoreHorizontal } from 'lucide-react';
// @ts-ignore;
import { Avatar, AvatarFallback, AvatarImage, Button, Card, CardContent, CardFooter, CardHeader } from '@/components/ui';
// @ts-ignore;
import { cn } from '@/lib/utils';

export function PostCard({
  post,
  onLike,
  onComment,
  onShare
}) {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(post.likes || 0);
  const handleLike = () => {
    setLiked(!liked);
    setLikes(liked ? likes - 1 : likes + 1);
    onLike?.(post.id);
  };
  return <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={post.user.avatar} alt={post.user.name} />
              <AvatarFallback>{post.user.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-sm">{post.user.name}</p>
              <p className="text-xs text-gray-500">{post.user.title}</p>
              <p className="text-xs text-gray-400">{post.time}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="pb-3">
        <p className="text-sm text-gray-800 mb-3">{post.content}</p>
        {post.images && post.images.length > 0 && <div className="grid grid-cols-2 gap-2">
            {post.images.map((img, idx) => <img key={idx} src={img} alt={`Post image ${idx + 1}`} className="rounded-lg w-full h-32 object-cover" />)}
          </div>}
        {post.topic && <div className="mt-3">
            <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
              #{post.topic}
            </span>
          </div>}
      </CardContent>
      
      <CardFooter className="flex justify-between pt-3">
        <Button variant="ghost" size="sm" className={cn("flex items-center space-x-1", liked && "text-red-500")} onClick={handleLike}>
          <Heart className={cn("w-4 h-4", liked && "fill-current")} />
          <span className="text-sm">{likes}</span>
        </Button>
        
        <Button variant="ghost" size="sm" className="flex items-center space-x-1" onClick={() => onComment?.(post.id)}>
          <MessageCircle className="w-4 h-4" />
          <span className="text-sm">{post.comments || 0}</span>
        </Button>
        
        <Button variant="ghost" size="sm" className="flex items-center space-x-1" onClick={() => onShare?.(post.id)}>
          <Share2 className="w-4 h-4" />
          <span className="text-sm">分享</span>
        </Button>
      </CardFooter>
    </Card>;
}