'use client';

import { useCustomToast } from '@/hooks/use-custom-toast';
import { toast } from '@/hooks/use-toast';
import { SubToSubredditPayload } from '@/lib/validators/subreddit';
import { Subreddit } from '@prisma/client';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { useRouter } from 'next/navigation';
import { FC, startTransition, useState } from 'react';
import { Button } from './ui/Button';

interface SubredditSubscrToggleProps {
  subreddit: Subreddit;
  isSubscribed: boolean;
}

const SubredditSubscrToggle: FC<
  SubredditSubscrToggleProps
> = ({ subreddit, isSubscribed: isSubscribedProp }) => {
  const { notLoginedToast } = useCustomToast();
  const router = useRouter();
  const [isSubscribed, setIsSubscribed] = useState(
    isSubscribedProp
  );

  const { mutate: subscribe, isLoading: isSubLoading } =
    useMutation({
      mutationFn: async () => {
        const payload: SubToSubredditPayload = {
          subredditId: subreddit.id,
        };

        const { data } = await axios.post<string>(
          '/api/subreddit/subscribe',
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
        setIsSubscribed((prev) => !prev);

        startTransition(() => {
          router.refresh();
        });

        return toast({
          title: 'Subscribed successfully',
          description: `You're now a subscriber of r/${subreddit.name}`,
        });
      },
    });

  const { mutate: unsubscribe, isLoading: isUnsubLoading } =
    useMutation({
      mutationFn: async () => {
        const payload: SubToSubredditPayload = {
          subredditId: subreddit.id,
        };

        const { data } = await axios.post<string>(
          '/api/subreddit/unsubscribe',
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
        setIsSubscribed((prev) => !prev);

        startTransition(() => {
          router.refresh();
        });

        return toast({
          title: 'Unsubscribed',
          description: `You've just left r/${subreddit.name}`,
        });
      },
    });

  const handleSubscribeClick = () => {
    if (isSubscribed) {
      unsubscribe();
    } else {
      subscribe();
    }
  };

  return (
    <Button
      className='w-full mt-1 mb-4'
      isLoading={isSubLoading || isUnsubLoading}
      onClick={handleSubscribeClick}
    >
      {isSubscribed ? 'Leave community' : 'Join to post'}
    </Button>
  );
};

export default SubredditSubscrToggle;
