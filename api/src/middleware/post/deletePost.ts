import type { PrismaClient } from '@prisma/client';
import type { Request, Response, NextFunction } from 'express';

/**
 * Deletes a Post based on `res.locals.post.id`
 * Stores the deleted Post at `res.locals.post` and
 * `{ success: true }` on `res.locals.message` if success
 * Calls the error handler otherwise
 *
 * @example
 * ```typescript
 * type res.locals.post = {
 *   id: number;
 *   createdAt: Date;
 *   editedAt: Date | null;
 *   title: string;
 *   content: string;
 *   userId: number;
 *   languageId: number;
 * };
 * ```
 */
export default function deletePost(prisma: PrismaClient) {
  return (_req: Request, res: Response, next: NextFunction) => {
    // If post is not owned by user
    if (res.locals.user.id !== res.locals.post.userId) {
      return next({
        message: 'post not owned by user',
        status: 403,
      });
    }

    prisma.post
      .delete({ where: { id: res.locals.post.id } })
      .then(post => {
        res.locals.post = post;
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
