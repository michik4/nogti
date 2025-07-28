
import { useState } from 'react';
import { X, Send, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";

interface Comment {
  id: string;
  author: string;
  avatar: string;
  text: string;
  time: string;
  likes: number;
}

interface CommentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  masterName: string;
}

const mockComments: Comment[] = [
  {
    id: '1',
    author: 'Мария К.',
    avatar: '/placeholder.svg',
    text: 'Какой красивый дизайн! 😍',
    time: '2 мин назад',
    likes: 5
  },
  {
    id: '2',
    author: 'Анна С.',
    avatar: '/placeholder.svg',
    text: 'А сколько стоит такой маникюр?',
    time: '5 мин назад',
    likes: 2
  },
  {
    id: '3',
    author: 'Елена М.',
    avatar: '/placeholder.svg',
    text: 'Записалась на следующую неделю! 💅',
    time: '10 мин назад',
    likes: 8
  }
];

export const CommentsModal = ({ isOpen, onClose, masterName }: CommentsModalProps) => {
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState(mockComments);
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set());

  const handleSendComment = () => {
    if (!newComment.trim()) return;
    
    const comment: Comment = {
      id: Date.now().toString(),
      author: 'Вы',
      avatar: '/placeholder.svg',
      text: newComment,
      time: 'только что',
      likes: 0
    };
    
    setComments(prev => [comment, ...prev]);
    setNewComment('');
  };

  const handleLikeComment = (commentId: string) => {
    const newLiked = new Set(likedComments);
    if (newLiked.has(commentId)) {
      newLiked.delete(commentId);
    } else {
      newLiked.add(commentId);
    }
    setLikedComments(newLiked);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendComment();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto h-[80vh] p-0 flex flex-col">
        <DialogHeader className="p-4 border-b">
          <DialogTitle className="text-center">Комментарии к {masterName}</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {comments.map((comment) => (
              <Card key={comment.id} className="p-3">
                <div className="flex items-start gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={comment.avatar} />
                    <AvatarFallback>{comment.author[0]}</AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm">{comment.author}</h4>
                      <span className="text-xs text-muted-foreground">{comment.time}</span>
                    </div>
                    
                    <p className="text-sm mb-2">{comment.text}</p>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs"
                        onClick={() => handleLikeComment(comment.id)}
                      >
                        <Heart className={`w-3 h-3 mr-1 ${likedComments.has(comment.id) ? 'fill-current text-red-500' : ''}`} />
                        {comment.likes + (likedComments.has(comment.id) ? 1 : 0)}
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>
        
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              placeholder="Написать комментарий..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Button 
              size="icon"
              onClick={handleSendComment}
              disabled={!newComment.trim()}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
