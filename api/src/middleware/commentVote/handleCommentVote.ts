import type { PrismaClient } from '@prisma/client';
import type { Request, Response, NextFunction } from 'express';

/**
 * Handler middleware for casting CommentVotes based on `req.body.value`
 * The connectiong data should be on `res.locals.(user|comment).id`
 * Can remove, update, create CommentVotes
 * Sends the newly created CommentVotes as the response if success
 * Calls the error handler otherwise
 */
export default function handleCommentVote(prisma: PrismaClient) {
  return (req: Request, res: Response, next: NextFunction) => {
    const userId = res.locals.user.id;
    const commentId = res.locals.comment.id;
    const value = req.body.value;

    prisma.commentVote
      .findUnique({ where: { userId_commentId: { userId, commentId } } })
      .then(oldVote => {
        if (oldVote === null) {
          // User has not casted their vote yet
          if (value === 0) {
            // But want to remove vote, call error handler
            return next({
              message: 'not voted yet',
              code: 400,
            });
          } else {
            // And want to vote now
            prisma.commentVote
              .create({ data: { userId, commentId, value } })
              .then(createdVote => {
                return res.send(createdVote);
              });
          }
        } else {
          // User already casted their vote
          const oldValue = oldVote.value;

          if (oldValue === value) {
            // But voted the same last time, call error handler
            return next({
              message: 'already voted the same',
              code: 400,
            });
          } else if (value === 0) {
            // And wants to remove their vote
            prisma.commentVote
              .delete({
                where: { userId_commentId: { userId, commentId } },
              })
              .then(_deletedVote => {
                return res.send({ success: true });
              });
          } else {
            // And wants to change their vote
            prisma.commentVote
              .update({
                where: { userId_commentId: { userId, commentId } },
                data: { value },
              })
              .then(updatedVote => {
                return res.send(updatedVote);
              });
          }
        }
      })
      .catch(err => {
        console.error(err);
        return next({
          message: 'database error',
          status: 500,
        });
      });
  };
}
