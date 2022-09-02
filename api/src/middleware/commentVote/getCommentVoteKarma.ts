import type { PrismaClient } from '@prisma/client';
import type { Request, Response, NextFunction } from 'express';

/**
 * Gets the sum of all the CommentVote values recieved by the User
 * (id: `res.locals.user.id`)
 * Stores the sum as `res.locals.commentVote._sum.value`
 * Calls the error handler otherwise
 *
 * @example
 * ```typescript
 * type res.locals.commentVote = {
 *   _sum: {
 *     value: number;
 *   };
 * };
 * ```
 */
export default function getCommentVoteKarma(prisma: PrismaClient) {
  return (_req: Request, res: Response, next: NextFunction) => {
    const id = res.locals.user.id;

    res.locals.commentVote ||= {};

    prisma.commentVote
      .aggregate({
        where: { user: { id } },
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
