import type { Request, Response, NextFunction } from 'express';

/**
 * Sends `res.locals.[field]` as the response
 */
export default function sendLocalsField(field: string) {
  return (_req: Request, res: Response, _next: NextFunction) => {
    return res.send(res.locals[field]);
  };
}
