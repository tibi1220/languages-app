import type { PrismaClient } from '@prisma/client';
import type { Request, Response, NextFunction } from 'express';

/**
 * Gets the recent Comments with postId `res.locals.post.id`
 * Saves the Comments on `res.locals.comment` if success
 * Calls the error handler otherwise
 *
 *
 * @example
 * ```typescript
 * // If body === true
 * type res.locals.comment = {
 *   id: number;
 *   postId: number;
 *   createdAt: Date;
 *   content: string;
 *   user: {
 *     id: number;
 *     username: string;
 *   };
 * }[];
 * ```
 *
 * @example
 * ```typescript
 * // If body === false
 * type res.locals.comment = {
 *   id: number;
 * }[];
 * ```
 */
export default function getComments(prisma: PrismaClient) {
  return (_req: Request, res: Response, next: NextFunction) => {
    const opts = res.locals.opts;
    const body = opts.body;

    prisma.comment
      .findMany({
        where: {
          postId: res.locals.post.postId,
          createdAt: {
            gte: opts.from ? new Date(opts.from) : undefined,
            lte: opts.until ? new Date(opts.until) : undefined,
          },
        },
        select: {
          id: true,
          postId: body,
          createdAt: body,
          content: body,
          user: body && { select: { id: body, username: body } },
          _count: { select: { commentVotes: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: opts.skip,
        take: opts.take,
      })
      .then(comment => {
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
