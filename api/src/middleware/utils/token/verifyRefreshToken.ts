import { verify } from 'jsonwebtoken';
import { REFRESH_TOKEN_SECRET as secret } from './secret';

import type { Request, Response, NextFunction } from 'express';
import type { PrismaClient } from '@prisma/client';

/**
 * Checks if the refreshToken stored in a Cookie is valid
 * If valid, it stores the owner's details on `res.locals.user`
 * If not, calls the error handler
 */
export default function verifyRefreshToken(prisma: PrismaClient) {
  return (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies['x-r-jwt'];

    // If no token, return error
    if (!token) {
      return next({
        message: 'no token provided',
        status: 400,
      });
    }

    // Try to verify the token
    verify(token as string, secret, (err, decoded) => {
      if (err || !decoded || typeof decoded === 'string') {
        return next({
          message: err?.message,
          status: 400,
        });
      }

      prisma.user.findUnique({ where: { id: decoded.id } }).then(user => {
        if (user === null) {
          return next({
            message: 'token belongs to no user',
            status: 400,
          });
        }
        if (user.sessionId !== decoded.sessionId) {
          return next({
            message: 'token has been revoked',
            status: 400,
          });
        }

        res.locals.user = user;
        return next();
      });
    });
  };
}
