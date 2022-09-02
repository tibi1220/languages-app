import type { PrismaClient } from '@prisma/client';
import type { Request, Response, NextFunction } from 'express';

/**
 * Creates a Comment based on the request body parameters `req.body.content`
 * The connecting params should be on res.locals `res.locals.(post|user).id`
 * Saves the newly created Comment to `res.locals.comment` if success
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
export default function createComment(prisma: PrismaClient) {
  return (req: Request, res: Response, next: NextFunction) => {
    prisma.comment
      .create({
        data: {
          content: req.body.content,
          postId: res.locals.post.id,
          userId: res.locals.user.id,
        },
      })
      .then(comment => {
        res.locals.comment = comment;
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
