import type { PrismaClient } from '@prisma/client';
import type { Request, Response, NextFunction } from 'express';

/**
 * Handler middleware for subscribing to Languages
 * The connectiong data should be on `res.locals.(user|language).id`
 * Can create and remove Subscriptions
 * Sends `{ success: true}` if no error occured
 * Calls the error handler otherwise
 */
export default function handleSubscription(prisma: PrismaClient) {
  return (req: Request, res: Response, next: NextFunction) => {
    const userId = res.locals.user.id;
    const languageId = res.locals.language.id;
    const value = req.body.value;

    prisma.subscription
      .findUnique({ where: { userId_languageId: { userId, languageId } } })
      .then(oldSub => {
        if (oldSub === null) {
          // User has not subsribed yet
          if (value === false) {
            // But wants to unsubscribe
            return next({
              message: 'not subscribed yet',
              code: 400,
            });
          } else {
            // And want to vote now
            prisma.subscription
              .create({ data: { userId, languageId } })
              .then(_createdSub => {
                return res.send({ success: true });
              });
          }
        } else {
          // User already subscribed their vote

          if (value === true) {
            // But wants to subscribe again
            return next({
              message: 'already subscibed',
              code: 400,
            });
          } else {
            // And wants to unsubscribe
            prisma.subscription
              .delete({
                where: { userId_languageId: { userId, languageId } },
              })
              .then(_deletedSub => {
                return res.send({ success: true });
              });
          }
        }
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
