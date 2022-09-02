import type { PrismaClient } from '@prisma/client';
import type { Request, Response, NextFunction } from 'express';

/**
 * If the User is logged in, (`res.locals.opts.optionalAuth`)
 * saves their reaction casted to the Comment `res.locals.comment`
 * to `res.locals.post.commentVote.user.value`
 *
 * @example
 * ```typescript
 * type Comment = {
 *   commentVote: {
 *     // ... //
 *     user: {
 *       value: -1 | 0 | 1;
 *     };
 *   };
 * };
 * res.locals.comment: Comment
 * ```
 */
export default function getUserCommentVote(prisma: PrismaClient) {
  return (_req: Request, res: Response, next: NextFunction) => {
    if (!res.locals.opts.optionalAuth) {
      return next();
    }

    const userId = res.locals.user.id;
    const commentId = res.locals.comment.id;

    prisma.commentVote
      .findUnique({
        where: { userId_commentId: { userId, commentId } },
        select: { value: true },
      })
      .then(vote => {
        res.locals.comment.commentVote.user =
          vote === null ? { value: 0 } : vote;

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
