import type { PrismaClient } from '@prisma/client';
import type { Request, Response, NextFunction } from 'express';

/**
 * Gets the top Posts with languageId `res.locals.language.id`
 * Saves the posts on `res.locals.post` if success
 * Calls the error handler otherwise
 *
 * @example
 * ```typescript
 * // If body === true
 * type res.locals.post = {
 *   id: number;
 *   languageId: number;
 *   createdAt: Date;
 *   editedAt: Date | null;
 *   content: string;
 *   postEdits: PostEdit[];
 *   user: {
 *     id: number;
 *     username: string;
 *   };
 *   _count: {
 *     comments: number;
 *     postVotes: number;
 *   };
 *   postVote: {
 *     _sum: {
 *       value: number
 *     }
 *   };
 * }[];
 * ```
 *
 * @example
 * ```typescript
 * // If body === false
 * type res.locals.post = {
 *   id: number;
 * }[];
 * ```
 */

export default function getTopPosts(prisma: PrismaClient) {
  return (_req: Request, res: Response, next: NextFunction) => {
    const languageId = res.locals.language.id;
    const opts = res.locals.opts;
    const body = opts.body;

    prisma.postVote
      .groupBy({
        by: ['postId'],
        where: {
          post: {
            languageId,
            createdAt: {
              lte: opts.until ? new Date(opts.until) : undefined,
              gte: opts.from ? new Date(opts.from) : undefined,
            },
          },
        },
        orderBy: {
          _sum: {
            value: 'desc',
          },
        },
        _sum: {
          value: true,
        },
        skip: opts.skip,
        take: opts.take,
      })
      .then(postVotes => {
        res.locals.postVote = postVotes;

        // If !body, only get ids, else everything
        return prisma.post.findMany({
          where: {
            id: { in: postVotes.map(vote => vote.postId) },
          },
          select: {
            id: true,
            languageId: body,
            createdAt: body,
            editedAt: body,
            title: body,
            content: body,
            user: body && { select: { id: true, username: true } },
            _count: body && { select: { comments: true, postVotes: true } },
            postEdits: body && {
              select: { id: true, createdAt: true, title: true, content: true },
            },
          },
        });
      })
      .then(posts => {
        res.locals.post = posts;

        // If !body, no need for PostVote value sums
        if (!body) {
          return next();
        }

        res.locals.post.forEach((p: any) => {
          p.postVote =
            res.locals.postVote[
              res.locals.postVote.findIndex(
                (v: { postId: number }) => v.postId === p.id
              )
            ];

          delete p.postVote.postId;
        });

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
