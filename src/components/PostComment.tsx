'use client';

import { toast } from '@/hooks/use-toast';
import { formatTimeToNow } from '@/lib/utils';
import { CommentRequest } from '@/lib/validators/comment';
import {
  Comment,
  CommentVote,
  User,
  VoteType,
} from '@prisma/client';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { MessageSquare } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { FC, useRef, useState } from 'react';
import CommentVotes from './CommentVotes';
import UserAvatar from './UserAvatar';
import { Button } from './ui/Button';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';

type ExtendedComment = Comment & {
  votes: CommentVote[];
  author: User;
};

interface PostCommentProps {
  comment: ExtendedComment;
  initialVote: VoteType | undefined;
  votesAmt: number;
  postId: string;
}

const PostComment: FC<PostCommentProps> = ({
  comment,
  initialVote,
  votesAmt,
  postId,
}) => {
  const commentRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { data: session } = useSession();
  const [isReplying, setIsReplying] = useState(false);
  const [commentText, setCommentText] = useState('');

  const { mutate: postComment, isLoading } = useMutation({
    mutationFn: async ({
      postId,
      text,
      replyToId,
    }: CommentRequest) => {
      const payload: CommentRequest = {
        postId,
        text,
        replyToId,
      };

      const { data } = await axios.patch(
        `/api/subreddit/post/comment`,
        payload
      );

      return data;
    },
    onError: (err) => {
      return toast({
        title: 'Something went wrong',
        description: 'Comment was not posted successfully',
        variant: 'destructive',
      });
    },
    onSuccess: () => {
      router.refresh();
      setIsReplying(false);
    },
  });

  return (
    <div className='flex flex-col ' ref={commentRef}>
      <div className='flex items-center'>
        <UserAvatar
          user={{
            name: comment.author.name ?? null,
            image: comment.author.image ?? null,
          }}
          className='h-6 w-6'
        />

        <div className='ml-2 flex items-center gap-x-2'>
          <p className='text-sm font-medium text-gray-900'>
            u/{comment.author.username}
          </p>
          <p className='max-h-40 truncate text-xs text-zinc-500'>
            {formatTimeToNow(new Date(comment.createdAt))}
          </p>
        </div>
      </div>

      <p className='text-sm text-zinc-900 mt-2'>
        {comment.text}
      </p>

      <div className='flex gap-2 items-center flex-wrap'>
        <CommentVotes
          commentId={comment.id}
          initialVotesAmount={votesAmt}
          initialVote={initialVote}
        />

        <Button
          onClick={() => {
            if (!session) {
              return router.push('/sign-in');
            }
            setIsReplying(true);
          }}
          variant='ghost'
          size='xs'
          aria-label='Reply'
        >
          <MessageSquare className='h-4 w-4 mr-1.5' />
          Reply
        </Button>

        {isReplying ? (
          <div className='grid w-full gap-1.5'>
            <Label htmlFor='comment'>Your comment</Label>
            <div className='mt-2'>
              <Textarea
                id='comment'
                value={commentText}
                onChange={(e) =>
                  setCommentText(e.target.value)
                }
                rows={1}
                placeholder='What are your thoughts?'
              />

              <div className='mt-2 flex justify-end gap-2'>
                <Button
                  tabIndex={-1}
                  variant='subtle'
                  onClick={() => setIsReplying(false)}
                >
                  Cancel
                </Button>
                <Button
                  isLoading={isLoading}
                  disabled={commentText.length <= 3}
                  onClick={() =>
                    postComment({
                      postId,
                      text: commentText,
                      replyToId:
                        comment.replyToId ?? comment.id,
                    })
                  }
                >
                  Post
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default PostComment;
