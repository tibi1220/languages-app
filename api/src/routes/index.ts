import type { PrismaClient } from '@prisma/client';
import type { Express } from 'express';

import authRoutes from './auth';
import commentRoutes from './comment';
import editRoutes from './edit';
import languageRoutes from './language';
import postRoutes from './post';
import userRoutes from './user';

export default function routes(app: Express) {
  return (prisma: PrismaClient) => {
    authRoutes(app)(prisma);
    userRoutes(app)(prisma);
    languageRoutes(app)(prisma);
    postRoutes(app)(prisma);
    commentRoutes(app)(prisma);
    editRoutes(app)(prisma);

    // ------------------------------------------------------------------------
    // ---------------------- Test routes to be removed -----------------------
    // ------------------------------------------------------------------------
    app.get('/test', (req, res) => {
      // prisma.language
      //   .findUnique({
      //     where: {
      //       name: 'javascript',
      //     },
      //     include: {
      //       posts: {
      //         include: {
      //           postVotes: true,
      //           comments: {
      //             include: {
      //               commentVotes: true,
      //             },
      //           },
      //         },
      //       },
      //     },
      //   })
      //   .then(language => res.send(language));
      // prisma.user
      //   .findMany({
      //     where: {
      //       id: {
      //         in: [1, 2, 3],
      //       },
      //     },
      //   })
      //   .then(user => res.send(user));
      //@ts-ignore
      res.send(req.query);
    });

    app.get('/error', (_req, _res, next) => {
      next({
        message: 'error',
        status: 400,
      });
    });

    app.get('/', (_req, res) => {
      return res.send('Hello from the server!');
    });
  };
}
