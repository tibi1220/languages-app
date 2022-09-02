import type { PrismaClient } from '@prisma/client';
import type { Request, Response, NextFunction } from 'express';

/**
 * Checks the Post with id `res.locals.post.id`
 * Saves the Post on `res.locals.post` if success
 * Calls the error handler otherwise
 */
export default function getPostsByLanguage(
  prisma: PrismaClient,
  order: 'recent' | 'top' | 'hot'
) {
  return (_req: Request, res: Response, next: NextFunction) => {
    prisma.post
      .findMany({
        where: { languageId: res.locals.language.id },
        select: {
          id: true,
          title: true,
          content: true,
          createdAt: true,
          editedAt: true,
          user: { select: { id: true, username: true } },
        },
        orderBy: { createdAt: 'asc' },
      })
      .then(post => {
        if (post === null) {
          return next({
            message: 'post does not exist',
            status: 400,
          });
        }

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
