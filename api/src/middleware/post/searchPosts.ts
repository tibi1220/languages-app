import type { PrismaClient } from '@prisma/client';
import type { Request, Response, NextFunction } from 'express';

/**
 * Searches Languages, by their name (`res.locals.language.name`)
 * Sends an array of Languages if success
 * Calls the error handler otherwise
 */
export default function searchPosts(prisma: PrismaClient) {
  return (_req: Request, res: Response, next: NextFunction) => {
    const opts = res.locals.opts;
    const body = opts.body;
    const title = res.locals.opts.title;
    const content = res.locals.opts.content;

    const fields: ('title' | 'content')[] = [];
    const OR = [];

    if (title) {
      fields.push('title');
      OR.push({
        title: { contains: res.locals.post.string, mode: 'insensitive' },
      });
    }
    if (content) {
      fields.push('content');
      OR.push({
        content: { contains: res.locals.post.string, mode: 'insensitive' },
      });
    }

    prisma.post
      .findMany({
        where: {
          languageId: res.locals.language.id,
          createdAt: {
            gte: opts.from ? new Date(opts.from) : undefined,
            lte: opts.until ? new Date(opts.until) : undefined,
          },
          OR: OR as any,
        },
        select: {
          id: true,
          languageId: body,
          createdAt: body,
          editedAt: body,
          title: body,
          content: body,
          postEdits: body && {
            select: { id: true, createdAt: true, title: true, content: true },
          },
          user: body && { select: { id: true, username: true } },
        },
        orderBy: {
          _relevance: {
            fields,
            search: res.locals.post.string,
            sort: 'desc',
          },
          // _count: {
          //   subscriptions: true,
          // },
        },
        take: opts.take,
        skip: opts.skip,
      })
      .then(post => {
        res.locals.post = post;
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
