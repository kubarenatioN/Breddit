import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { CommentVoteValidator } from '@/lib/validators/vote';
import { z } from 'zod';

export async function PATCH(req: Request) {
  try {
    const body = await req.json();

    const { commentId, voteType } =
      CommentVoteValidator.parse(body);

    const session = await getAuthSession();

    if (!session?.user) {
      return new Response('Unauthorized', { status: 401 });
    }

    const { id: userId } = session.user;

    const existingVote = await db.commentVote.findFirst({
      where: {
        userId,
        commentId,
      },
    });

    if (existingVote) {
      if (existingVote.type === voteType) {
        // delete vote
        await db.commentVote.delete({
          where: {
            userId_commentId: {
              commentId,
              userId,
            },
          },
        });
      }

      if (existingVote.type !== voteType) {
        // delete vote
        await db.commentVote.update({
          where: {
            userId_commentId: {
              commentId,
              userId,
            },
          },
          data: {
            type: voteType,
          },
        });
      }

      return new Response('Ok');
    } else {
      await db.commentVote.create({
        data: {
          type: voteType,
          userId,
          commentId,
        },
      });

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
