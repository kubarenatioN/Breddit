'use client';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { useCustomToast } from '@/hooks/use-custom-toast';
import { toast } from '@/hooks/use-toast';
import { CreateSubredditPayload } from '@/lib/validators/subreddit';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const Page = ({}) => {
  const [communityName, setCommunityName] = useState('');
  const router = useRouter();
  const { notLoginedToast } = useCustomToast();

  const { mutate: createCommunity, isLoading } =
    useMutation({
      mutationFn: async () => {
        const payload: CreateSubredditPayload = {
          name: communityName,
        };

        const { data } = await axios.post<{ name: string }>(
          '/api/subreddit',
          payload
        );

        return data;
      },
      onError: (err) => {
        if (err instanceof AxiosError) {
          if (err.response?.status === 409) {
            return toast({
              title: 'Subreddit already exists.',
              description:
                'Please, use different community name',
              variant: 'destructive',
            });
          }

          if (err.response?.status === 422) {
            return toast({
              title: 'Invalid subreddit name.',
              description:
                'Please, specify name to have from 3 to 24 letters',
              variant: 'destructive',
            });
          }

          if (err.response?.status === 401) {
            return notLoginedToast();
          }
        }

        return toast({
          title: 'There was an error.',
          description: 'Could not create subreddit',
          variant: 'destructive',
        });
      },
      onSuccess: (data) => {
        router.push(`/r/${data.name}`);
      },
    });

  return (
    <div className='container flex items-center h-full max-w-3xl mx-auto'>
      <div className='relative bg-white w-full h-fit p-4 rounded-lg space-y-6'>
        <div className='flex justify-between items-center'>
          <h1 className='text-xl font-semibold'>
            Create a Community
          </h1>
        </div>

        <hr className='bg-red-500 h-px' />

        <div>
          <p className='text-lg font-medium'>Name</p>
          <p className='text-xs pb-2'>
            Community names including capitalization cannot
            be changed.
          </p>
          <div className='relative'>
            <p className='absolute text-sm left-0 w-8 inset-y-0 grid place-items-center text-zinc-400'>
              r/
            </p>
            <Input
              value={communityName}
              onChange={(e) =>
                setCommunityName(e.target.value)
              }
              className='pl-6'
            />
          </div>
        </div>

        <div className='flex justify-end gap-4'>
          <Button
            variant='subtle'
            isLoading={isLoading}
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button
            isLoading={isLoading}
            disabled={
              communityName.length < 3 ||
              communityName.length > 24
            }
            onClick={() => createCommunity()}
          >
            Create Community
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Page;
