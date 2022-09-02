import type { PrismaClient } from '@prisma/client';
import type { Request, Response, NextFunction } from 'express';

/**
 * Aggregates the sum of CommentVote values belonging to Comment
 * `res.locals.comment` and saves it to `res.locals.comment.commentVote`
 *
 * @example
 * ```typescript
 * type res.locals.comment = {
 *   // ... //
 *   commentVote: {
 *     _sum: {
 *       value: number;
 *     };
 *   };
 * };
 * ```
 */
export default function getCommentVoteSum(prisma: PrismaClient) {
  return (_req: Request, res: Response, next: NextFunction) => {
    const commentId = res.locals.comment.id;

    prisma.commentVote
      .aggregate({
        where: { commentId },
        _sum: { value: true },
      })
      .then(vote => {
        res.locals.comment.commentVote = {
          _sum: { value: vote._sum.value || 0 },
        };
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
