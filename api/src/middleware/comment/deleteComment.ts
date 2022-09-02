import type { PrismaClient } from '@prisma/client';
import type { Request, Response, NextFunction } from 'express';

/**
 * Deletes a Comment based on `res.locals.comment.id`
 * Stores the deleted Comment at `res.locals.comment`
 * `{ success: true }` on `res.locals.message` if success
 * Calls the error handler otherwise
 *
 * @example
 * ```typescript
 * type res.locals.comment = {
 *   id: number;
 *   createdAt: Date;
 *   content: string;
 *   userId: number;
 *   postId: number;
 * };
 * ```
 */
export default function deleteComment(prisma: PrismaClient) {
  return (_req: Request, res: Response, next: NextFunction) => {
    // If post is not owned by user
    if (res.locals.user.id !== res.locals.comment.userId) {
      return next({
        message: 'comment not owned by user',
        status: 403,
      });
    }

    prisma.comment
      .delete({ where: { id: res.locals.comment.id } })
      .then(comment => {
        res.locals.comment = comment;
        res.locals.message = { success: true };
        return next();
      })
      .catch(err => {
        console.error(err);
        next({
          message: 'database error',
          status: 500,
        });
      });
  };
}
