import type { PrismaClient } from '@prisma/client';
import type { Request, Response, NextFunction } from 'express';

/**
 * Gets the sum of PostVote values belonging to Posts on `res.locals.post`
 * Saves the sums on `res.locals.post` if success
 * Calls the error handler otherwise
 *
 * @example
 * ```typescript
 * // If body === true
 * type res.locals.post = {
 *   // ... //
 *   postVote: {
 *     _sum: {
 *       value: number;
 *     };
 *   };
 * }[];
 * ```
 *
 * @example
 * ```typescript
 * // If body === false
 * type res.locals.post = {
 *   // No changes made
 * }[];
 * ```
 */
export default function getPostVoteSums(prisma: PrismaClient) {
  return (_req: Request, res: Response, next: NextFunction) => {
    if (!res.locals.opts.body) {
      return next();
    }

    prisma.postVote
      .groupBy({
        by: ['postId'],
        where: {
          postId: {
            in: res.locals.post.map((c: { id: number }) => c.id),
          },
        },
        _sum: { value: true },
      })
      .then(vote => {
        res.locals.post.forEach((c: any) => {
          const j = vote.findIndex(v => v.postId == c.id);

          if (j === -1) {
            c.postVote = { _sum: { value: 0 } };
          } else {
            c.postVote = vote[j];
            delete c.postVote.postId;
          }
        });

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
