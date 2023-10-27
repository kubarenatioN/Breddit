import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { PostValidator } from '@/lib/validators/post';
import { z } from 'zod';

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();

    if (!session?.user) {
      return new Response('Unauthorized', { status: 401 });
    }

    const body = await req.json();

    const { subredditId, title, content } =
      PostValidator.parse(body);

    const subscriptionExists =
      await db.subscription.findFirst({
        where: {
          subredditId,
          userId: session.user.id,
        },
      });

    if (!subscriptionExists) {
      return new Response(
        'Subscribe to post to publish post',
        {
          status: 400,
        }
      );
    }

    await db.post.create({
      data: {
        title,
        content,
        subredditId,
        authorId: session.user.id,
      },
    });

    return new Response('Created');
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
