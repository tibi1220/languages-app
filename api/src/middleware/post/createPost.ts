import type { PrismaClient } from '@prisma/client';
import type { Request, Response, NextFunction } from 'express';

/**
 * Creates a Post based on the request body parameters `req.body.(title|content)`
 * The connecting params should be on res.locals `res.locals.(user|language).id`
 * Id success, stores the newly created Post on `res.locals.post`
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
export default function createPost(prisma: PrismaClient) {
  return (req: Request, res: Response, next: NextFunction) => {
    prisma.post
      .create({
        data: {
          title: req.body.title,
          content: req.body.content,
          userId: res.locals.user.id,
          languageId: res.locals.language.id,
        },
      })
      .then(post => {
        res.locals.post = post;
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
