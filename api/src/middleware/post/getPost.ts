import type { PrismaClient } from '@prisma/client';
import type { Request, Response, NextFunction } from 'express';

/**
 * Checks the Post with id `res.locals.post.id`
 * Saves the Post on `res.locals.post` if success
 * Calls the error handler otherwise
 *
 * @example
 * ```typescript
 * type Post = {
 *   id: number;
 *   userId: number;
 *   title: string;
 *   content: string;
 *   createdAt: Date;
 *   editedAt: Date | null;
 * };
 * res.locals.post : Post
 * ```
 */
export default function getPost(prisma: PrismaClient) {
  return (_req: Request, res: Response, next: NextFunction) => {
    prisma.post
      .findUnique({
        where: { id: res.locals.post.id },
      })
      .then(post => {
        if (post === null) {
          return next({
            message: 'post does not exist',
            status: 400,
          });
        }

        res.locals.post = post;
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
