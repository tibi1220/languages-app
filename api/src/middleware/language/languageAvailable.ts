import type { PrismaClient } from '@prisma/client';
import type { Request, Response, NextFunction } from 'express';

/**
 * Checks if the Language name is still available to use
 * Saves the Language on `res.locals.language` if not available
 * Saves the status to `res.locals.message`
 *
 * @example
 * ```typescript
 * type res.locals.message = {
 *   isAvailable: boolean;
 * };
 * ```
 */
export default function languageAvailable(prisma: PrismaClient) {
  return (_req: Request, res: Response, next: NextFunction) => {
    prisma.language
      .findUnique({ where: { name: res.locals.language.name } })
      .then(language => {
        if (language === null) {
          res.locals.message = { isAvailable: true };
          return next();
        }

        res.locals.language = language;
        res.locals.message = { isAvailable: false };
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
