import type { PrismaClient } from '@prisma/client';
import type { Express } from 'express';

// User
import createUser from '../middleware/user/createUser';
import deleteUser from '../middleware/user/deleteUser';
import getUser from '../middleware/user/getUser';
import getUserForLogin from '../middleware/user/getUserForLogin';

// Bcrypt
import comparePassword from '../middleware/utils/bcrypt/comparePassword';
import hashPassword from '../middleware/utils/bcrypt/hashPassword';

// Token
import createAccessToken from '../middleware/utils/token/createAccessToken';
import createRefreshToken from '../middleware/utils/token/createRefreshToken';
import revokeTokens from '../middleware/utils/token/revokeTokens';
import sendAccessToken from '../middleware/utils/token/sendAccessToken';
import setRefreshToken from '../middleware/utils/token/setRefreshToken';
import verifyAccessToken from '../middleware/utils/token/verifyAccessToken';
import verifyRefreshToken from '../middleware/utils/token/verifyRefreshToken';

// Utils
import checkBody from '../middleware/utils/checkBody';
import checkUnique, { UserArg } from '../middleware/utils/checkUnique';
import sendLocalsField from '../middleware/utils/sendLocalsField';

export default function authRoutes(app: Express) {
  return (prisma: PrismaClient) => {
    // Delete routes
    app.delete(
      '/auth/delete',
      verifyAccessToken(),
      checkBody({ name: 'password', type: 'string' }),
      getUser(prisma, { getPassword: true }),
      comparePassword(),
      deleteUser(prisma),
      sendLocalsField('message')
    );

    // Post routes
    app.post(
      '/auth/register',
      checkBody(
        { name: 'username', type: 'string' },
        { name: 'email', type: 'string' },
        { name: 'password', type: 'string' }
      ),
      checkUnique<UserArg>(
        prisma,
        { entity: 'user', key: 'email' },
        { entity: 'user', key: 'username' }
      ),
      hashPassword(),
      createUser(prisma),
      sendLocalsField('user')
    );
    app.post(
      '/auth/login',
      checkBody(
        { name: 'username', type: 'string' },
        { name: 'password', type: 'string' }
      ),
      getUserForLogin(prisma),
      comparePassword(),
      createRefreshToken(),
      createAccessToken(),
      setRefreshToken(),
      sendAccessToken()
    );
    app.post(
      '/auth/refresh',
      verifyRefreshToken(prisma),
      createAccessToken(),
      sendAccessToken()
    );
    app.post(
      '/auth/revoke',
      verifyAccessToken(),
      checkBody({ name: 'password', type: 'string' }),
      getUser(prisma, { getPassword: true, getSessionId: true }),
      comparePassword(),
      revokeTokens(prisma),
      sendLocalsField('message')
    );
  };
}
