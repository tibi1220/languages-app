import type { PrismaClient } from '@prisma/client';
import type { Request, Response, NextFunction } from 'express';

/**
 * Gets the PostEdits with postId `res.locals.post.id`
 * Saves the PostEdits on `res.locals.postEdit` if success
 * Calls the error handler otherwise
 *
 * @example
 * ```typescript
 * type res.locals.postEdit = {
 *   id: number;
 *   createdAt: Date;
 *   title: string;
 *   content: string;
 * }[];
 * ```
 */
export default function getPostEdits(prisma: PrismaClient) {
  return (_req: Request, res: Response, next: NextFunction) => {
    const opts = res.locals.opts;
    const body = opts.body;

    prisma.postEdit
      .findMany({
        where: { postId: res.locals.post.id },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          createdAt: body,
          title: body,
          content: body,
        },
        skip: opts.skip,
        take: opts.take,
      })
      .then(postEdits => {
        res.locals.postEdit = postEdits;
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
