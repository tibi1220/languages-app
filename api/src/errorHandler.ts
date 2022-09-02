import type { Request, Response, NextFunction } from 'express';

export class HttpException extends Error {
  status: number;
  message: string;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.message = message;
  }
}

export default function errorHandler(
  err: HttpException,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error(err);
  res.status(err.status || 400).send({
    error: err.message || err || 'error',
  });
}
