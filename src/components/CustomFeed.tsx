import { getAuthSession } from '@/lib/auth';
import { POSTS_LIMIT } from '@/lib/config';
import { db } from '@/lib/db';
import PostFeed from './PostFeed';

const CustomFeed = async ({}) => {
  const session = await getAuthSession();

  const followedCommunities =
    await db.subscription.findMany({
      where: {
        userId: session?.user.id,
      },
      include: {
        subreddit: true,
      },
    });

  const posts = await db.post.findMany({
    where: {
      subreddit: {
        name: {
          in: followedCommunities.map(
            (c) => c.subreddit.name
          ),
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      votes: true,
      author: true,
      comments: true,
      subreddit: true,
    },
    take: POSTS_LIMIT,
  });

  return <PostFeed initialPosts={posts} />;
};

export default CustomFeed;
