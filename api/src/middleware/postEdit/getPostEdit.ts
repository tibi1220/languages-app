import type { PrismaClient } from '@prisma/client';
import type { Request, Response, NextFunction } from 'express';

/**
 * Gets the PostEdit with id `res.locals.postEdit.id`
 * Saves the PostEdit on `res.locals.postEdit` if success
 * Calls the error handler otherwise
 *
 * @example
 * ```typescript
 * type res.locals.postEdit = {
 *   id: number;
 *   createdAt: Date;
 *   title: string;
 *   content: string;
 *   postId: number;
 * };
 * ```
 */
export default function getPostEdit(prisma: PrismaClient) {
  return (_req: Request, res: Response, next: NextFunction) => {
    prisma.postEdit
      .findUnique({
        where: { id: res.locals.postEdit.id },
      })
      .then(postEdit => {
        if (postEdit === null) {
          return next({
            message: 'postEdit does not exist',
            status: 400,
          });
        }

        res.locals.post = { id: postEdit.postId };
        res.locals.postEdit = postEdit;
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
