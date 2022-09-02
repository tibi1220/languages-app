import type { Request, Response, NextFunction } from 'express';

/**
 * Parses the selected URL params with the parser function
 * Stores parsed values on res.locals.params
 */
export default function parseParams(
  parser: (x: any) => any,
  ...args: { entity: string; param: string; as?: string }[]
) {
  return (req: Request, res: Response, next: NextFunction) => {
    for (const arg of args) {
      res.locals[arg.entity] ||= {};
      res.locals[arg.entity][arg.as || arg.param] = parser(
        req.params[arg.param]
      );
    }

    return next();
  };
}
