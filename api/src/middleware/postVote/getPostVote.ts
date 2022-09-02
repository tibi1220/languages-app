import type { PrismaClient } from '@prisma/client';
import type { Request, Response, NextFunction } from 'express';

/**
 * Gets the PostVote casted by the User (id: res.locals.user.id)
 * to the specified Post (`res.locals.post.id`)
 * Stores the PostVote on `res.locals.postVote`
 * Calls the error handler otherwise
 *
 * @example
 *
 */
export default function getPostVote(prisma: PrismaClient) {
  return (_req: Request, res: Response, next: NextFunction) => {
    const userId = res.locals.user.id;
    const postId = res.locals.post.id;

    prisma.postVote
      .findUnique({
        where: { userId_postId: { userId, postId } },
        select: { value: true },
      })
      .then(postVote => {
        res.locals.postVote = { value: postVote === null ? 0 : postVote.value };
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
