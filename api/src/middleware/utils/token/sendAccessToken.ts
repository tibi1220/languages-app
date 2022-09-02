import type { Request, Response } from 'express';

/**
 * Sends the accessToken stored on `res.locals.accessToken` as the response
 */
export default function sendAccessToken() {
  return (_req: Request, res: Response) => {
    res.send({
      accessToken: res.locals.accessToken,
    });
  };
}
