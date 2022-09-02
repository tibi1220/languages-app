import type { PrismaClient } from '@prisma/client';
import type { Request, Response, NextFunction } from 'express';

/**
 * Gets the Post with id `res.locals.post.id`
 * Saves the Post on `res.locals.post` if success
 * Calls the error handler otherwise
 *
 * @example
 * ```typescript
 * type res.locals.post = {
 *   id: number;
 *   title: string;
 *   content: string;
 *   createdAt: Date;
 *   editedAt: Date | null;
 *   user: {
 *     id: number;
 *     username: string;
 *   };
 *   postEdits: {
 *     id: number;
 *     createdAt: Date;
 *     title: string;
 *     content: string;
 *   }[];
 * };
 * ```
 */
export default function getDetailedPost(prisma: PrismaClient) {
  return (_req: Request, res: Response, next: NextFunction) => {
    prisma.post
      .findUnique({
        where: { id: res.locals.post.id },
        select: {
          id: true,
          title: true,
          content: true,
          createdAt: true,
          editedAt: true,
          user: { select: { id: true, username: true } },
          postEdits: {
            select: { id: true, createdAt: true, title: true, content: true },
          },
          _count: {
            select: { comments: true, postVotes: true, postEdits: true },
          },
        },
      })
      .then(post => {
        if (post === null) {
          next({
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
