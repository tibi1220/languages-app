import type { Request, Response, NextFunction } from 'express';

type Arg = {
  name: string;
  type: 'number' | 'string' | 'boolean';
  include?: any[];
  exclude?: any[];
};

/**
 * Checks if `req.body` has the specified parameters
 * Calls the next middleware if all the specifications are met
 * Calls the error handler otherwise
 */
export default function checkBody(...args: Arg[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    for (const arg of args) {
      // Check for type
      if (!req.body || typeof req.body[arg.name] !== arg.type) {
        return next({
          message: `No ${arg.name} (type ${arg.type}) specified`,
          status: 400,
        });
      }
      // Check for included values
      if (typeof arg.include !== 'undefined') {
        if (!arg.include.includes(req.body[arg.name])) {
          return next({
            message: `${
              arg.name
            } has to be one of these values: [${arg.include.join(', ')}]`,
            status: 400,
          });
        }
      }
      // Check for excluded values
      if (typeof arg.exclude !== 'undefined') {
        if (arg.exclude.includes(req.body[arg.name])) {
          return next({
            message: `${
              arg.name
            } cannot be one of these values: [${arg.exclude.join(', ')}]`,
            status: 400,
          });
        }
      }
    }

    // No error, call the next middleware
    return next();
  };
}
