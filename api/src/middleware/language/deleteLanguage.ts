import type { PrismaClient } from '@prisma/client';
import type { Request, Response, NextFunction } from 'express';

/**
 * Deletes a Language based on `res.locals.language.id`
 * Stores the deleted language on `res.locals.language` and
 * `{ success: true }` on `res.locals.message` if success
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
export default function deleteLanguage(prisma: PrismaClient) {
  // If post is not owned by user
  return (_req: Request, res: Response, next: NextFunction) => {
    if (res.locals.user.id !== res.locals.language.userId) {
      return next({
        message: 'language not owned by user',
        status: 403,
      });
    }

    prisma.language
      .delete({ where: { id: res.locals.language.id } })
      .then(language => {
        res.locals.language = language;
        res.locals.message = { success: true };
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
