import { db } from '@/lib/db';

export const getSubreddit = async (slug: string) => {
  return db.subreddit.findFirst({
    where: {
      name: slug,
    },
    include: {
      posts: {
        include: {
          author: true,
          votes: true,
          comments: true,
          subreddit: true,
        },
      },
    },
    take: 2,
  });
};
