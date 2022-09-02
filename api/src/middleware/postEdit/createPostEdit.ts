import type { PrismaClient } from '@prisma/client';
import type { Request, Response, NextFunction } from 'express';

/**
 * Creates a PostEdit based on the `req.body` or `res.locals.postEdit`
 * The connecting params should be on res.locals `res.locals.(post|user).id`
 * Saves the newly created PostEdit to `res.locals.comment` if success
 * Calls the error handler otherwise
 *
 * @example
 * ```typescript
 * type res.locals.post = {
 *   id: number;
 *   createdAt: Date;
 *   editedAt: Date;
 *   title: string;
 *   content: string;
 *   userId: number;
 *   languageId: number;
 * };
 * ```
 */
export default function createPostEdit(
  prisma: PrismaClient,
  src: 'body' | 'locals'
) {
  return (req: Request, res: Response, next: NextFunction) => {
    const oldPost = res.locals.post;
    const newPost = src === 'body' ? req.body : res.locals.postEdit;
    const user = res.locals.user;

    if (user.id !== oldPost.userId) {
      return next({
        message: 'post not owned by user',
        status: 403,
      });
    }

    prisma.post
      .update({
        where: { id: oldPost.id },
        data: {
          title: newPost.title,
          content: newPost.content,
          editedAt: new Date(),
        },
        select: {
          id: true,
          createdAt: true,
          editedAt: true,
          title: true,
          content: true,
          userId: true,
          languageId: true,
          _count: { select: { postEdits: true } },
          postEdits: true,
        },
      })
      .then(post => {
        res.locals.post = post;

        return prisma.postEdit.create({
          data: {
            title: oldPost.title,
            content: oldPost.content,
            createdAt: oldPost.editedAt || oldPost.createdAt,
            postId: oldPost.id || oldPost.postId,
          },
        });
      })
      .then(postEdit => {
        res.locals.postEdit = postEdit;
        return next();
      })
      .catch(err => {
        console.error(err);
        next({
          message: 'database error',
          status: 500,
        });
      });
  };
}
