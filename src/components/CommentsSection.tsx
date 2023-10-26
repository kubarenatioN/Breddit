import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import CreateComment from './CreateComment';
import PostComment from './PostComment';

interface CommentsSectionProps {
  postId: string;
}

const CommentsSection = async ({
  postId,
}: CommentsSectionProps) => {
  const session = await getAuthSession();

  const comments = await db.comment.findMany({
    where: {
      postId,
      replyToId: null,
    },
    include: {
      author: true,
      votes: true,
      replies: {
        include: {
          author: true,
          votes: true,
        },
      },
    },
  });

  return (
    <div className='flex flex-col gap-y-4 mt-4'>
      <hr className='w-full h-px my-6' />

      <CreateComment postId={postId} />

      <div className='flex flex-col gap-y-6 mt-4'>
        {comments
          .filter((c) => !c.replyToId)
          .map((c) => {
            const topLevelCommentVotesAmt = c.votes.reduce(
              (acc, vote) => {
                return vote.type === 'UP'
                  ? acc + 1
                  : vote.type === 'DOWN'
                  ? acc - 1
                  : 0;
              },
              0
            );

            const topLevelCommentVote = c.votes.find(
              (vote) => vote.userId === session?.user.id
            );

            return (
              <div key={c.id} className='flex flex-col'>
                <div className='mb-2'>
                  <PostComment
                    comment={c}
                    initialVote={topLevelCommentVote?.type}
                    votesAmt={topLevelCommentVotesAmt}
                    postId={postId}
                  />
                </div>

                {/* render replies */}
                {c.replies
                  .sort(
                    (a, b) =>
                      b.votes.length - a.votes.length
                  )
                  .map((reply) => {
                    const replyVotesAmt =
                      reply.votes.reduce((acc, vote) => {
                        return vote.type === 'UP'
                          ? acc + 1
                          : vote.type === 'DOWN'
                          ? acc - 1
                          : 0;
                      }, 0);

                    const replyVote = reply.votes.find(
                      (vote) =>
                        vote.userId === session?.user.id
                    );

                    return (
                      <div
                        key={reply.id}
                        className='ml-2 py-2 pl-4 border-1-2 border-zinc-200'
                      >
                        <PostComment
                          comment={reply}
                          initialVote={replyVote?.type}
                          votesAmt={replyVotesAmt}
                          postId={postId}
                        />
                      </div>
                    );
                  })}
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default CommentsSection;
