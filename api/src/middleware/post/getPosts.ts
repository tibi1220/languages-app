import type { PrismaClient } from '@prisma/client';
import type { Request, Response, NextFunction } from 'express';

/**
 * Gets the recent Posts with languageId `res.locals.language.id`
 * Saves the posts on `res.locals.post` if success
 * Calls the error handler otherwise
 *
 * @example
 * ```typescript
 * // If body === true
 * type res.locals.post = {
 *   id: number;
 *   languageId: number;
 *   createdAt: Date;
 *   editedAt: Date | null;
 *   content: string;
 *   postEdits: PostEdit[];
 *   user: {
 *     id: number;
 *     username: string;
 *   };
 *   _count: {
 *     comments: number;
 *     postVotes: number;
 *   };
 * }[];
 * ```
 *
 * @example
 * ```typescript
 * // If body === false
 * type res.locals.post = {
 *   id: number;
 * }[];
 * ```
 */
export default function getPosts(prisma: PrismaClient) {
  return (_req: Request, res: Response, next: NextFunction) => {
    const opts = res.locals.opts;
    const body = opts.body;

    prisma.post
      .findMany({
        where: {
          languageId: res.locals.language.id,
          createdAt: {
            lte: opts.until ? new Date(opts.until) : undefined,
            gte: opts.from ? new Date(opts.from) : undefined,
          },
        },
        select: {
          id: true,
          languageId: body,
          createdAt: body,
          editedAt: body,
          title: body,
          content: body,
          user: body && { select: { id: true, username: true } },
          _count: body && { select: { comments: true, postVotes: true } },
          postEdits: body && {
            select: { id: true, createdAt: true, title: true, content: true },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: opts.skip,
        take: opts.take,
      })
      .then(post => {
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
