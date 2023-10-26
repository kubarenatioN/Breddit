'use client';

import { useCustomToast } from '@/hooks/use-custom-toast';
import { toast } from '@/hooks/use-toast';
import { CommentRequest } from '@/lib/validators/comment';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { useRouter } from 'next/navigation';
import { FC, useState } from 'react';
import { Button } from './ui/Button';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';

interface CreateCommentProps {
  postId: string;
  replyToId?: string;
}

const CreateComment: FC<CreateCommentProps> = ({
  postId,
  replyToId,
}) => {
  const [comment, setComment] = useState('');
  const { notLoginedToast } = useCustomToast();
  const router = useRouter();

  const { mutate: submitComment, isLoading } = useMutation({
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
        '/api/subreddit/post/comment',
        payload
      );

      return data;
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 401) {
          return notLoginedToast();
        }
      }

      return toast({
        title: 'There was an error',
        description:
          'Something went wrong. Try again later.',
        variant: 'destructive',
      });
    },
    onSuccess: () => {
      setComment('');
      router.refresh();
    },
  });

  return (
    <div className='grid w-full gap-1.5'>
      <Label htmlFor='comment'>Your comment</Label>
      <div className='mt-2'>
        <Textarea
          id='comment'
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={1}
          placeholder='What are your thoughts?'
        />

        <div className='mt-2 flex justify-end'>
          <Button
            isLoading={isLoading}
            disabled={comment.length <= 3}
            onClick={() =>
              submitComment({
                postId,
                text: comment,
                replyToId,
              })
            }
          >
            Post
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateComment;
