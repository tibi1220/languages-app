import type { PrismaClient } from '@prisma/client';
import type { Request, Response, NextFunction } from 'express';

/**
 * Creates a Language based on the request body parameters `req.body.name`
 * The connecting params should be on res.locals `res.locals.user.id`
 * Saves the newly created Language on `res.locals.language`
 * Calls the error handler otherwise
 *
 * @example
 * ```typescript
 * type res.locals.language = {
 *   id: number;
 *   name: string;
 *   createdAt: Date;
 *   userId: number;
 * };
 * ```
 */
export default function createLanguage(prisma: PrismaClient) {
  return (req: Request, res: Response, next: NextFunction) => {
    prisma.language
      .create({
        data: {
          name: req.body.name,
          userId: res.locals.user.id,
        },
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
