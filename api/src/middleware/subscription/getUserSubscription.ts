import type { PrismaClient } from '@prisma/client';
import type { Request, Response, NextFunction } from 'express';

/**
 * Gets the Subscription casted by the User (id: res.locals.user.id)
 * to the specified Language (`res.locals.language.id`)
 * Stores the Subscription on `res.locals.subscription` if success
 * Calls the error handler otherwise
 *
 * @example
 * ```typescript
 * type res.locals.subscription = {
 *   value: boolean;
 * };
 * ```
 */
export default function getOptionalSubscription(prisma: PrismaClient) {
  return (_req: Request, res: Response, next: NextFunction) => {
    if (!res.locals.opts.optionalAuth) {
      return next();
    }

    const userId = res.locals.user.id;
    const languageId = res.locals.language.id;

    res.locals.language.subscription ||= {};

    prisma.subscription
      .findUnique({
        where: { userId_languageId: { userId, languageId } },
      })
      .then(sub => {
        if (sub === null) {
          res.locals.language.subscription.user = { value: false };
          return next();
        }

        res.locals.language.subscription.user = { value: true };
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
