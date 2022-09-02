import type { PrismaClient } from '@prisma/client';
import type { Request, Response, NextFunction } from 'express';

/**
 * Gets the sum of all the CommentVote values recieved by the
 * owner of the Comment (id: `res.locals.comment.id`)
 * Stores the sum as `res.locals.commentVote._sum.value`
 * Calls the error handler otherwise
 *
 * @example
 * ```typescript
 * type CommentVote = {
 *   _sum: {
 *     value: number;
 *   };
 * };
 * res.locals.commentVote: CommentVote
 * ```
 */
export default function getCommentVoteCount(prisma: PrismaClient) {
  return (_req: Request, res: Response, next: NextFunction) => {
    const id = res.locals.comment.id;

    res.locals.commentVote ||= {};

    prisma.commentVote
      .aggregate({
        where: { comment: { id } },
        _sum: { value: true },
      })
      .then(commentVote => {
        res.locals.commentVote._sum = commentVote._sum;
        return next();
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
