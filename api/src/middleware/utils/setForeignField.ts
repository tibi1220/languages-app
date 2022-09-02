import type { Request, Response, NextFunction } from 'express';

/**
 * Sets `res.locals[local][foreign][as] = res.locals[foreign]`
 */
export default function setForeignField(
  ...args: { foreign: string; local: string }[]
) {
  return (_req: Request, res: Response, next: NextFunction) => {
    args.forEach(arg => {
      res.locals[arg.local][arg.foreign] ||= {};
      res.locals[arg.local][arg.foreign] = res.locals[arg.foreign];
    });

    return next();
  };
}
