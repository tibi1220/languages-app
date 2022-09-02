import type { PrismaClient } from '@prisma/client';
import type { Request, Response, NextFunction } from 'express';

/**
 * Gets the top Comments with postId `res.locals.post.id`
 * Saves the Comments on `res.locals.comment` if success
 * Calls the error handler otherwise
 *
 *
 * @example
 * ```typescript
 * // If body === true
 * type res.locals.comment = {
 *   id: number;
 *   postId: number;
 *   createdAt: Date;
 *   content: string;
 *   user: {
 *     id: number;
 *     username: string;
 *   };
 *   commentVote: {
 *     _sum: {
 *       value: number;
 *     };
 *   };
 * }[];
 * ```
 *
 * @example
 * ```typescript
 * // If body === false
 * type res.locals.comment = {
 *   id: number;
 * }[];
 * ```
 */
export default function getTopComments(prisma: PrismaClient) {
  return (_req: Request, res: Response, next: NextFunction) => {
    const postId = res.locals.post.id;
    const opts = res.locals.opts;
    const body = opts.body;

    prisma.commentVote
      .groupBy({
        by: ['commentId'],
        orderBy: {
          _sum: {
            value: 'desc',
          },
        },
        _sum: {
          value: true,
        },
        where: {
          comment: {
            postId,
            createdAt: {
              lte: opts.until ? new Date(opts.until) : undefined,
              gte: opts.from ? new Date(opts.from) : undefined,
            },
          },
        },
      })
      .then(commentVotes => {
        res.locals.commentVote = commentVotes;

        // If !body only gets ids, else everything
        return prisma.comment.findMany({
          where: {
            id: { in: commentVotes.map(vote => vote.commentId) },
          },
          select: {
            id: true,
            postId: body,
            createdAt: body,
            content: body,
            user: body && { select: { id: body, username: body } },
            _count: { select: { commentVotes: true } },
          },
          skip: opts.skip,
          take: opts.take,
        });
      })
      .then(comments => {
        res.locals.comment = comments;

        // If !body, no need for CommentVote value sums
        if (!body) {
          return next();
        }

        res.locals.comment.forEach((c: any) => {
          c.commentVote =
            res.locals.commentVote[
              res.locals.commentVote.findIndex(
                (v: { commentId: number }) => v.commentId === c.id
              )
            ];

          delete c.commentVote.commentId;
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
