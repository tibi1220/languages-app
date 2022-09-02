import type { PrismaClient } from '@prisma/client';
import type { Request, Response, NextFunction } from 'express';

/**
 * Gets the PostVote values casted by the User (id `res.locals.user.id`)
 * belonging to Posts on `res.locals.post`
 * Saves the sums on `res.locals.post` if success
 * Calls the error handler otherwise
 *
 * @example
 * ```typescript
 * // If body === true && optionalAuth === true
 * type res.locals.post = {
 *   // ... //
 *   postVote: {
 *     user: {
 *       value: number;
 *     };
 *   };
 * }[];
 * ```
 *
 * @example
 * ```typescript
 * // If body === false || optionalAuth === false
 * type res.locals.post = {
 *   // No changes made
 * }[];
 * ```
 */
export default function getUserPostVotes(prisma: PrismaClient) {
  return (_req: Request, res: Response, next: NextFunction) => {
    if (!res.locals.opts.optionalAuth || !res.locals.opts.body) {
      return next();
    }

    prisma.postVote
      .findMany({
        where: {
          userId: res.locals.user.id,
          postId: { in: res.locals.post.map((x: { id: any }) => x.id) },
        },
      })
      .then(vote => {
        let j = 0;
        for (let i = 0; i < res.locals.post.length; i++) {
          if (res.locals.user.id == vote[i - j]?.userId) {
            // res.locals.post[i].postVote.user = vote[i - j];
            res.locals.post[i].postVote.user = {
              value: vote[i - j].value,
            };
          } else {
            res.locals.post[i].postVote.user = { value: 0 };
            j++;
          }
        }

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
