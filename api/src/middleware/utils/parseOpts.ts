import type { Request, Response, NextFunction } from 'express';

/**
 * Parses the optional parameters (URL queries)
 * Stores parsed values on res.locals.options
 */
export default function parseOpts(
  parser: (x: any) => any,
  ...args: { opt: string; default: any }[]
) {
  return (req: Request, res: Response, next: NextFunction) => {
    res.locals.opts ||= {};

    for (const arg of args) {
      if (typeof req.query[arg.opt] === 'undefined') {
        res.locals.opts[arg.opt] = arg.default;
      } else {
        res.locals.opts[arg.opt] = parser(req.query[arg.opt]);
      }
    }

    return next();
  };
}
