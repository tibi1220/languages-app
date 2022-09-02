import type { PrismaClient } from '@prisma/client';
import type { Request, Response, NextFunction } from 'express';

/**
 * Gets the CommentVote values casted by the User (id `res.locals.user.id`)
 * belonging to Comment on `res.locals.comment`
 * Saves the sums on `res.locals.comment` if success
 * Calls the error handler otherwise
 *
 * @example
 * ```typescript
 * // If body === true && optionalAuth === true
 * type res.locals.comment = {
 *   // .. //
 *   commentVote: {
 *     // .. //
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
 * type res.locals.comment = {
 *   // No changes made
 * }[];
 * ```
 */
export default function getUserCommentVotes(prisma: PrismaClient) {
  return (_req: Request, res: Response, next: NextFunction) => {
    if (!res.locals.opts.optionalAuth || !res.locals.opts.body) {
      return next();
    }

    prisma.commentVote
      .findMany({
        where: {
          userId: res.locals.user.id,
          commentId: { in: res.locals.comment.map((x: { id: any }) => x.id) },
        },
      })
      .then(vote => {
        let j = 0;
        for (let i = 0; i < res.locals.comment.length; i++) {
          if (res.locals.user.id == vote[i - j]?.userId) {
            res.locals.comment[i].commentVote.user = {
              value: vote[i - j].value,
            };
          } else {
            res.locals.comment[i].commentVote.user = { value: 0 };
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
