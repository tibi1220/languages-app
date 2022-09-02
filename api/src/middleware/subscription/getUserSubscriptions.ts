import type { PrismaClient } from '@prisma/client';
import type { Request, Response, NextFunction } from 'express';

export default function getUserSubscriptions(prisma: PrismaClient) {
  return (_req: Request, res: Response, next: NextFunction) => {
    if (!res.locals.opts.optionalAuth || !res.locals.opts.body) {
      return next();
    }

    prisma.subscription
      .findMany({
        where: {
          userId: res.locals.user.id,
          languageId: { in: res.locals.language.map((x: { id: any }) => x.id) },
        },
      })
      .then(sub => {
        let j = 0;
        for (let i = 0; i < res.locals.language.length; i++) {
          if (res.locals.user.id == sub[i - j]?.userId) {
            res.locals.language[i].subscription = { user: { value: true } };
          } else {
            res.locals.language[i].subscription = { user: { value: false } };
            j++;
          }
        }

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
