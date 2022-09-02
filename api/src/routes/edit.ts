import type { PrismaClient } from '@prisma/client';
import type { Express } from 'express';

// Token
import verifyAccessToken from '../middleware/utils/token/verifyAccessToken';

// Post
import getPost from '../middleware/post/getPost';

// PostEdit
import getPostEdit from '../middleware/postEdit/getPostEdit';
import createPostEdit from '../middleware/postEdit/createPostEdit';

// Utils
import parseParams from '../middleware/utils/parseParams';
import sendLocalsField from '../middleware/utils/sendLocalsField';

export default function editRoutes(app: Express) {
  return (prisma: PrismaClient) => {
    app.get(
      '/edit/:editId',
      parseParams(parseInt, { entity: 'postEdit', param: 'editId', as: 'id' }),
      getPostEdit(prisma),
      sendLocalsField('postEdit')
    );

    app.post(
      '/edit/:editId/revert',
      verifyAccessToken(),
      parseParams(parseInt, { entity: 'postEdit', param: 'editId', as: 'id' }),
      getPostEdit(prisma),
      getPost(prisma),
      createPostEdit(prisma, 'locals'),
      sendLocalsField('post')
    );
  };
}
