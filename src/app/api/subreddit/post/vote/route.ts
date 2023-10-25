import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { redis } from '@/lib/redis';
import { PostVoteValidator } from '@/lib/validators/vote';
import type { CachedPost } from '@/types/redis';
import { Post, User, Vote, VoteType } from '@prisma/client';
import { z } from 'zod';

const CACHE_AFTER_UPVOTES = 1;

export async function PATCH(req: Request) {
  try {
    const body = await req.json();

    const { postId, voteType } =
      PostVoteValidator.parse(body);

    const session = await getAuthSession();

    if (!session?.user) {
      return new Response('Unauthorized', { status: 401 });
    }

    const { id: userId } = session.user;

    const existingVote = await db.vote.findFirst({
      where: {
        userId,
        postId,
      },
    });

    const post = await db.post.findUnique({
      where: {
        id: postId,
      },
      include: {
        author: true,
        votes: true,
      },
    });

    if (!post) {
      return new Response('Post not found', {
        status: 404,
      });
    }

    if (existingVote) {
      console.log(voteType);

      if (existingVote.type === voteType) {
        // delete vote
        await db.vote.delete({
          where: {
            userId_postId: {
              postId,
              userId,
            },
          },
        });
      }

      if (existingVote.type !== voteType) {
        // delete vote
        await db.vote.update({
          where: {
            userId_postId: {
              postId,
              userId,
            },
          },
          data: {
            type: voteType,
          },
        });
      }

      // recount the votes
      await cacheVotes({ post, voteType });

      return new Response('Ok');
    } else {
      await db.vote.create({
        data: {
          type: voteType,
          userId,
          postId,
        },
      });

      // recount the votes
      await cacheVotes({ post, voteType });

      return new Response('Ok');
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(
        `Invalid request payload. ${error.message}`,
        { status: 422 }
      );
    }

    return new Response('Server error', {
      status: 500,
    });
  }
}

async function cacheVotes({
  post,
  voteType,
}: {
  post: Post & {
    author: User;
    votes: Vote[];
  };
  voteType: VoteType;
}) {
  const votesAmt = post.votes.reduce((acc, vote) => {
    if (voteType === 'UP') {
      return acc + 1;
    }
    if (voteType === 'DOWN') {
      return acc - 1;
    }
    return acc;
  }, 0);

  if (votesAmt >= CACHE_AFTER_UPVOTES) {
    const cachePayload: CachedPost = {
      id: post.id,
      title: post.title,
      content: JSON.stringify(post.content),
      authorUsername: post.author.username ?? '',
      createdAt: post.createdAt,
    };

    await redis.hset(`post:${post.id}`, cachePayload);
  }
}
