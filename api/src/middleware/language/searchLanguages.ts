import type { PrismaClient } from '@prisma/client';
import type { Request, Response, NextFunction } from 'express';

/**
 * Searches Languages, by their name (`res.locals.language.name`)
 * Saves the Languages on `res.locals.language` if success
 * Calls the error handler otherwise
 *
 * @example
 * ```typescript
 * type res.locals.language = {
 *   id: number;
 *   name: string;
 *   createdAt: Date;
 *   userId: number;
 *   _count: {
 *     subscriptions: number;
 *     posts: number;
 *   };
 * }[];
 * ```
 */
export default function searchLanguages(prisma: PrismaClient) {
  return (_req: Request, res: Response, next: NextFunction) => {
    const body = res.locals.opts.body;

    prisma.language
      .findMany({
        where: {
          name: { contains: res.locals.language.name, mode: 'insensitive' },
        },
        select: {
          id: true,
          name: body,
          createdAt: body,
          userId: body,
          _count: body && { select: { subscriptions: true, posts: true } },
        },
        orderBy: {
          _relevance: {
            fields: ['name'],
            search: res.locals.language.name,
            sort: 'desc',
          },
        },
        take: res.locals.opts.take,
        skip: res.locals.opts.skip,
      })
      .then(language => {
        res.locals.language = language;
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
