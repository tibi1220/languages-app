import type { PrismaClient } from '@prisma/client';
import type { Express } from 'express';

// Comment
import getComment from '../middleware/comment/getComment';
import getDetailedComment from '../middleware/comment/getDetailedComment';
import deleteComment from '../middleware/comment/deleteComment';

// CommentVote
import getCommentVote from '../middleware/commentVote/getCommentVote';
import handleCommentVote from '../middleware/commentVote/handleCommentVote';
import getCommentVoteSum from '../middleware/commentVote/getCommentVoteSum';
import getUserCommentVote from '../middleware/commentVote/getUserCommentVote';

// Token
import verifyAccessToken from '../middleware/utils/token/verifyAccessToken';
import optionalAccessToken from '../middleware/utils/token/optionalAccessToken';

// Utils
import checkBody from '../middleware/utils/checkBody';
import parseParams from '../middleware/utils/parseParams';
import sendLocalsField from '../middleware/utils/sendLocalsField';

export default function commentRoutes(app: Express) {
  return (prisma: PrismaClient) => {
    app.delete(
      '/comment/:commentId/delete',
      verifyAccessToken(),
      parseParams(parseInt, {
        entity: 'comment',
        param: 'commentId',
        as: 'id',
      }),
      getComment(prisma),
      deleteComment(prisma),
      sendLocalsField('message')
    );

    app.get(
      '/comment/:commentId/vote',
      verifyAccessToken(),
      parseParams(parseInt, {
        entity: 'comment',
        param: 'commentId',
        as: 'id',
      }),
      getComment(prisma),
      getCommentVote(prisma),
      sendLocalsField('commentVote')
    );

    app.get(
      '/comment/:commentId',
      optionalAccessToken(),
      parseParams(parseInt, {
        entity: 'comment',
        param: 'commentId',
        as: 'id',
      }),
      getDetailedComment(prisma),
      getCommentVoteSum(prisma),
      getUserCommentVote(prisma),
      sendLocalsField('comment')
    );

    app.post(
      '/comment/:commentId/vote',
      verifyAccessToken(),
      checkBody({ name: 'value', type: 'number', include: [-1, 0, 1] }),
      parseParams(parseInt, {
        entity: 'comment',
        param: 'commentId',
        as: 'id',
      }),
      getComment(prisma),
      handleCommentVote(prisma)
    );
  };
}
