'use client';

import { POSTS_LIMIT } from '@/lib/config';
import { ExtendedPost } from '@/types/db';
import { useIntersection } from '@mantine/hooks';
import { useInfiniteQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import { FC, useEffect, useRef } from 'react';
import Post from './Post';

interface PostFeedProps {
  initialPosts: ExtendedPost[];
  subredditName?: string;
}

const PostFeed: FC<PostFeedProps> = ({
  initialPosts,
  subredditName,
}) => {
  const lastPostRef = useRef<HTMLElement>(null);

  const { ref, entry } = useIntersection({
    root: lastPostRef.current,
    threshold: 1,
  });

  const { data: session } = useSession();

  const { data, fetchNextPage, isFetchingNextPage } =
    useInfiniteQuery(
      ['infinite-query'],
      async ({ pageParam = 1 }) => {
        const query =
          `/api/posts?limit=${POSTS_LIMIT}&page=${pageParam}` +
          (Boolean(subredditName)
            ? `&subredditName=${subredditName}`
            : '');

        const { data } = await axios.get(query);

        return data as ExtendedPost[];
      },
      {
        getNextPageParam: (_, pages) => {
          return pages.length + 1;
        },
        initialData: {
          pages: [initialPosts],
          pageParams: [1],
        },
      }
    );

  useEffect(() => {
    if (entry?.isIntersecting) {
      fetchNextPage();
    }
  }, [entry, fetchNextPage]);

  const posts =
    data?.pages.flatMap((page) => page) ?? initialPosts;

  return (
    <ul className='flex flex-col col-span-2 space-y-6'>
      {posts.map((post, index) => {
        const votesCount = post.votes.reduce(
          (acc, vote) => {
            if (vote.type === 'UP') {
              return acc + 1;
            }
            if (vote.type === 'DOWN') {
              return acc - 1;
            }
            return acc;
          },
          0
        );

        const currentVote = post.votes.find(
          (vote) => vote.userId === session?.user.id
        );

        if (index === posts.length - 1) {
          return (
            <li key={post.id} ref={ref}>
              <Post
                commentAmount={post.comments.length}
                post={post}
                subredditName={post.subreddit.name}
                currentVote={currentVote}
                votesAmt={votesCount}
              ></Post>
            </li>
          );
        }

        return (
          <li key={post.id}>
            <Post
              commentAmount={post.comments.length}
              post={post}
              subredditName={post.subreddit.name}
              currentVote={currentVote}
              votesAmt={votesCount}
            ></Post>
          </li>
        );
      })}
    </ul>
  );
};

export default PostFeed;
