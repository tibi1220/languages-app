import type { PrismaClient } from '@prisma/client';
import type { Request, Response, NextFunction } from 'express';

/**
 * Searches Users, by their username (`res.locals.user.username`)
 * Sends an array of Users if success
 * Calls the error handler otherwise
 *
 * @example
 * ```typescript
 * type res.locals.user = {
 *   id: number;
 *   username: string;
 *   email: string;
 *   createdAt: Date;
 * }[];
 * ```
 */
export default function searchUsers(prisma: PrismaClient) {
  return (_req: Request, res: Response, next: NextFunction) => {
    prisma.user
      .findMany({
        where: {
          username: { contains: res.locals.user.username, mode: 'insensitive' },
        },
        select: { id: true, username: true, email: true, createdAt: true },
        orderBy: {
          _relevance: {
            fields: ['username'],
            search: res.locals.user.username,
            sort: 'desc',
          },
        },
        skip: res.locals.opts.skip,
        take: res.locals.opts.take,
      })
      .then(users => {
        res.locals.user = users;
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
