import type { PrismaClient } from '@prisma/client';
import type { Request, Response, NextFunction } from 'express';

/**
 * Gets the sum of all the PostVote values recieved by the owner of the
 * Post (id: res.locals.post.id)
 * Sores the sum as res.locals.postVote._sum.value
 * Calls the error handler otherwise
 */
export default function getPostVoteCount(prisma: PrismaClient) {
  return (_req: Request, res: Response, next: NextFunction) => {
    const id = res.locals.post.id;

    res.locals.postVote ||= {};

    prisma.postVote
      .aggregate({
        where: { post: { id } },
        _sum: { value: true },
      })
      .then(postVote => {
        res.locals.postVote._sum = postVote._sum;
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
