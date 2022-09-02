import type { PrismaClient } from '@prisma/client';
import type { Express } from 'express';

// User
import calcKarma from '../middleware/user/calcKarma';
import emailAvailable from '../middleware/user/emailAvailable';
import getUser from '../middleware/user/getUser';
import getUserByName from '../middleware/user/getUserByName';
import searchUsers from '../middleware/user/searchUsers';
import usernameAvailable from '../middleware/user/usernameAvailable';

// CommentVote
import getCommentVoteKarma from '../middleware/commentVote/getCommentVoteKarma';

// PostVote
import getPostVoteKarma from '../middleware/postVote/getPostVoteKarma';

// Utils
import parseParams from '../middleware/utils/parseParams';
import parseOpts from '../middleware/utils/parseOpts';
import sendLocalsField from '../middleware/utils/sendLocalsField';
import setForeignField from '../middleware/utils/setForeignField';

export default function userRoutes(app: Express) {
  return (prisma: PrismaClient) => {
    app.get(
      '/user/search/:username',
      parseParams(x => x, { entity: 'user', param: 'username' }),
      parseOpts(
        parseInt,
        { opt: 'skip', default: 0 },
        { opt: 'take', default: 10 }
      ),
      searchUsers(prisma),
      sendLocalsField('user')
    );
    app.get(
      '/user/username/:username',
      parseParams(x => x, { entity: 'user', param: 'username' }),
      getUserByName(prisma),
      getCommentVoteKarma(prisma),
      getPostVoteKarma(prisma),
      calcKarma(),
      setForeignField({ foreign: 'karma', local: 'user' }),
      sendLocalsField('user')
    );
    app.get(
      '/user/available/username/:username',
      parseParams(x => x, { entity: 'user', param: 'username' }),
      usernameAvailable(prisma),
      sendLocalsField('message')
    );
    app.get(
      '/user/available/email/:email',
      parseParams(x => x, { entity: 'user', param: 'email' }),
      emailAvailable(prisma),
      sendLocalsField('message')
    );
    app.get(
      '/user/:userId',
      parseParams(parseInt, { entity: 'user', param: 'userId', as: 'id' }),
      getUser(prisma),
      getCommentVoteKarma(prisma),
      getPostVoteKarma(prisma),
      calcKarma(),
      setForeignField({ foreign: 'karma', local: 'user' }),
      sendLocalsField('user')
    );
    app.get(
      '/user/:userId/karma',
      parseParams(parseInt, { entity: 'user', param: 'userId', as: 'id' }),
      getUser(prisma),
      getCommentVoteKarma(prisma),
      getPostVoteKarma(prisma),
      calcKarma(),
      sendLocalsField('karma')
    );
  };
}
