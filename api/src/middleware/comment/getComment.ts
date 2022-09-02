import type { PrismaClient } from '@prisma/client';
import type { Request, Response, NextFunction } from 'express';

/**
 * Gets the Comment with id `res.locals.comment.id` if exists
 * Saves the Comment on `res.locals.comment` if success
 * Calls the error handler otherwise
 *
 * @example
 * ```typescript
 * type Comment = {
 *   id: number;
 *   createdAt: Date;
 *   content: string;
 *   userId: number;
 *   postId: number;
 * };
 * res.locals.comment: Comment
 * ```
 */
export default function getComment(prisma: PrismaClient) {
  return (_req: Request, res: Response, next: NextFunction) => {
    prisma.comment
      .findUnique({
        where: { id: res.locals.comment.id },
      })
      .then(comment => {
        if (comment === null) {
          return next({
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
