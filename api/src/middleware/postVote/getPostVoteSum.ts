import type { PrismaClient } from '@prisma/client';
import type { Request, Response, NextFunction } from 'express';

/**
 * Aggregates the sum of PostVote values belonging to Post
 * `res.locals.post` and saves it to `res.locals.post.postVote`
 *
 * @example
 * ```typescript
 * type res.locals.post = {
 *   // ... //
 *   postVote: {
 *     _sum: {
 *       value: number;
 *     };
 *   };
 * };
 * ```
 */
export default function getPostVoteSum(prisma: PrismaClient) {
  return (_req: Request, res: Response, next: NextFunction) => {
    prisma.postVote
      .aggregate({
        where: { postId: res.locals.post.id },
        _sum: { value: true },
      })
      .then(vote => {
        res.locals.post.postVote = { _sum: { value: vote._sum.value || 0 } };
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
