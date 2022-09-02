import type { PrismaClient } from '@prisma/client';
import type { Request, Response, NextFunction } from 'express';

/**
 * Gets the Comment with id `res.locals.comment.id`
 * Saves the Comment on `res.locals.comment` if success
 * Calls the error handler otherwise
 *
 * @example
 * ```typescript
 * type res.locals.comment = {
 *   id: number;
 *   postId: number;
 *   createdAt: Date;
 *   content: string;
 *   user: {
 *     id: number;
 *     username: string;
 *   };
 *   _count: {
 *     commentVotes: number;
 *   };
 * };
 * ```
 */
export default function getDetailedComment(prisma: PrismaClient) {
  return (_req: Request, res: Response, next: NextFunction) => {
    const commentId = res.locals.comment.id;

    // Get comment details
    prisma.comment
      .findUnique({
        where: { id: commentId },
        select: {
          id: true,
          content: true,
          createdAt: true,
          postId: true,
          user: { select: { id: true, username: true } },
          _count: { select: { commentVotes: true } },
        },
      })
      .then(comment => {
        if (comment === null) {
          next({
            message: 'comment does not exist',
            status: 400,
          });
        }

        res.locals.comment = comment;
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
