import type { Request, Response, NextFunction } from 'express';

/**
 * Calculates the karma of the user by adding together
 * `res.locals.postVote._sum.value` and `res.locals.commentVote._sum.value`
 * and stores all values on `res.locals.karma`
 *
 * @example
 * ```typescript
 * type res.locals.karma = {
 *   post: number;
 *   comment: number;
 *   combined: number;
 * };
 * ```
 */
export default function calcKarma() {
  return (_req: Request, res: Response, next: NextFunction) => {
    const post = res.locals.postVote._sum.value || 0;
    const comment = res.locals.commentVote._sum.value || 0;
    const combined = post + comment;

    res.locals.karma = { post, comment, combined };

    return next();
  };
}
