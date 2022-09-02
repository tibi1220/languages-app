import type { PrismaClient } from '@prisma/client';
import type { Request, Response, NextFunction } from 'express';

/**
 * Gets the CommentVote casted by the User (id: `res.locals.user.id`)
 * to the specified Comment (`res.locals.comment.id`)
 * Calls the error handler otherwise
 *
 * @example
 * ```typescript
 * type res.locals.commentVote = {
 *   value: -1 | 0 | 1;
 * };
 * ```
 */
export default function getCommentVote(prisma: PrismaClient) {
  return (_req: Request, res: Response, next: NextFunction) => {
    const userId = res.locals.user.id;
    const commentId = res.locals.comment.id;

    res.locals.commentVote ||= {};

    prisma.commentVote
      .findUnique({
        where: { userId_commentId: { userId, commentId } },
        select: { value: true },
      })
      .then(commentVote => {
        if (commentVote === null) {
          res.locals.commentVote.value = 0;
          return next();
        }

        res.locals.commentVote.value = commentVote.value;
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
