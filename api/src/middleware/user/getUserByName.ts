import type { PrismaClient } from '@prisma/client';
import type { Request, Response, NextFunction } from 'express';

/**
 * Gets the User with username `req.body.username` if exists
 * Saves the User on `res.locals.user` if success
 * Calls the error handler otherwise
 *
 * @example
 * ```typescript
 * type res.locals.user = {
 *   id: number;
 *   email: string;
 *   username: string;
 *   createdAt: Date;
 *   password?: string;
 *   sessionId?: number;
 * };
 * ```
 */
export default function getUserByName(
  prisma: PrismaClient,
  opts?: { getPassword?: boolean; getSessionId?: boolean; getCount?: boolean }
) {
  return (_req: Request, res: Response, next: NextFunction) => {
    prisma.user
      .findFirst({
        where: {
          username: { equals: res.locals.user.username, mode: 'insensitive' },
        },
        select: {
          id: true,
          username: true,
          email: true,
          createdAt: true,
          password: !!opts?.getPassword,
          sessionId: !!opts?.getSessionId,
          _count: opts?.getCount && {
            select: {
              postVotes: true,
              comments: true,
              commentVote: true,
              languages: true,
              posts: true,
              subscriptions: true,
            },
          },
        },
      })
      .then(user => {
        if (user === null) {
          return next({
            message: 'user does not exist',
            status: 400,
          });
        }

        res.locals.user = user;
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
