import type { PrismaClient } from '@prisma/client';
import type { Request, Response, NextFunction } from 'express';

/**
 * Gets the sum of CommentVote values belonging to Comments on `res.locals.comment`
 * Saves the sums on `res.locals.comment` if success
 * Calls the error handler otherwise
 *
 *
 * @example
 * ```typescript
 * // If body === true
 * type res.locals.comment = {
 *   // .. //
 *   commentVote: {
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
 * type res.locals.comment = {
 *   // No changes made
 * }[];
 * ```
 */
export default function getCommentVoteSums(prisma: PrismaClient) {
  return (_req: Request, res: Response, next: NextFunction) => {
    if (!res.locals.opts.body) {
      return next();
    }

    prisma.commentVote
      .groupBy({
        by: ['commentId'],
        where: {
          commentId: {
            in: res.locals.comment.map((c: { id: number }) => c.id),
          },
        },
        _sum: { value: true },
      })
      .then(vote => {
        res.locals.comment.forEach((c: any) => {
          const j = vote.findIndex(v => v.commentId === c.id);

          if (j === -1) {
            c.commentVote = { _sum: { value: 0 } };
          } else {
            c.commentVote = vote[j];
            delete c.commentVote.commentId;
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
