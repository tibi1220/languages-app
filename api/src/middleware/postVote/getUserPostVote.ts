import type { PrismaClient } from '@prisma/client';
import type { Request, Response, NextFunction } from 'express';

/**
 * If the User is logged in, (`res.locals.opts.optionalAuth`)
 * saves their reaction casted to the Post `res.locals.post`
 * to `res.locals.post.postVote.user.value`
 *
 * @example
 * ```typescript
 * type res.locals.post = {
 *   // ... //
 *   postVote: {
 *     user: {
 *       value: number;
 *     };
 *   };
 * };
 * ```
 */
export default function getUserPostVote(prisma: PrismaClient) {
  return (_req: Request, res: Response, next: NextFunction) => {
    if (!res.locals.opts.optionalAuth) {
      return next();
    }

    prisma.postVote
      .findUnique({
        where: {
          userId_postId: {
            userId: res.locals.user.id,
            postId: res.locals.post.id,
          },
        },
        select: { value: true },
      })
      .then(vote => {
        res.locals.post.postVote.user = vote === null ? { value: 0 } : vote;
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
