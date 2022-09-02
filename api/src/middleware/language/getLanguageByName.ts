import type { PrismaClient } from '@prisma/client';
import type { Request, Response, NextFunction } from 'express';

/**
 * Gets the Language with id `res.locals.language.id`
 * Saves the Language on `res.locals.language` if success
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
 * };
 * ```
 */
export default function getLanguageByName(prisma: PrismaClient) {
  return (_req: Request, res: Response, next: NextFunction) => {
    prisma.language
      .findFirst({
        where: {
          name: {
            equals: res.locals.language.name as string,
          },
        },
        select: {
          id: true,
          name: true,
          createdAt: true,
          userId: true,
          _count: { select: { subscriptions: true, posts: true } },
        },
      })
      .then(language => {
        if (language === null) {
          return next({
            message: 'language does not exist',
            status: 400,
          });
        }

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
