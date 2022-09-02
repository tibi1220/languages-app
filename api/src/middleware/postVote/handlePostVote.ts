import type { PrismaClient } from '@prisma/client';
import type { Request, Response, NextFunction } from 'express';

/**
 * Handler middleware for casting PostVotes based on `req.body.value`
 * The connectiong data should be on `res.locals.(user|post).id`
 * Can remove, update, create PostVotes
 * Sends the newly created/updated PostVote, or `{success: true}` in case
 * of deletation as the response if success
 * Calls the error handler otherwise
 */
export default function handlePostVote(prisma: PrismaClient) {
  return (req: Request, res: Response, next: NextFunction) => {
    const userId = res.locals.user.id;
    const postId = res.locals.post.id;
    const value = req.body.value;

    prisma.postVote
      .findUnique({ where: { userId_postId: { userId, postId } } })
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
            prisma.postVote
              .create({ data: { userId, postId, value } })
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
            prisma.postVote
              .delete({
                where: { userId_postId: { userId, postId } },
              })
              .then(_deletedVote => {
                return res.send({ success: true });
              });
          } else {
            // And wants to change their vote
            prisma.postVote
              .update({
                where: { userId_postId: { userId, postId } },
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
