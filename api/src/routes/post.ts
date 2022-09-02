import type { PrismaClient } from '@prisma/client';
import type { Express } from 'express';

// Post
import getDetailedPost from '../middleware/post/getDetailedPost';
import getPost from '../middleware/post/getPost';
import deletePost from '../middleware/post/deletePost';

// PostVote
import handlePostVote from '../middleware/postVote/handlePostVote';
import getPostVote from '../middleware/postVote/getPostVote';
import getPostVoteSum from '../middleware/postVote/getPostVoteSum';
import getUserPostVote from '../middleware/postVote/getUserPostVote';

// PostEdit
import createPostEdit from '../middleware/postEdit/createPostEdit';
import getPostEdits from '../middleware/postEdit/getPostEdits';

// Comment
import createComment from '../middleware/comment/createComment';
import getComments from '../middleware/comment/getComments';
import getTopComments from '../middleware/comment/getTopComments';

// CommentVote
import getCommentVoteSums from '../middleware/commentVote/getCommentVoteSums';
import getUserCommentVotes from '../middleware/commentVote/getUserCommentVotes';

// Token
import verifyAccessToken from '../middleware/utils/token/verifyAccessToken';
import optionalAccessToken from '../middleware/utils/token/optionalAccessToken';

// Utils
import checkBody from '../middleware/utils/checkBody';
import parseParams from '../middleware/utils/parseParams';
import sendLocalsField from '../middleware/utils/sendLocalsField';
import parseOpts from '../middleware/utils/parseOpts';

export default function postRoutes(app: Express) {
  return (prisma: PrismaClient) => {
    app.delete(
      '/post/:postId/delete',
      verifyAccessToken(),
      parseParams(parseInt, { entity: 'post', param: 'postId', as: 'id' }),
      getPost(prisma),
      deletePost(prisma),
      sendLocalsField('message')
    );

    app.get(
      '/post/:postId',
      optionalAccessToken(),
      parseParams(parseInt, { entity: 'post', param: 'postId', as: 'id' }),
      getDetailedPost(prisma),
      getPostVoteSum(prisma),
      getUserPostVote(prisma),
      sendLocalsField('post')
    );
    app.get(
      '/post/:postId/vote',
      verifyAccessToken(),
      parseParams(parseInt, { entity: 'post', param: 'postId', as: 'id' }),
      getPostVote(prisma),
      sendLocalsField('postVote')
    );
    app.get(
      '/post/:postId/edit/history',
      parseParams(parseInt, { entity: 'post', param: 'postId', as: 'id' }),
      parseOpts(x => x == 'true', { opt: 'body', default: true }),
      parseOpts(
        parseInt,
        { opt: 'skip', default: 0 },
        { opt: 'take', default: 10 }
      ),
      getPost(prisma),
      getPostEdits(prisma),
      sendLocalsField('postEdit')
    );
    app.get(
      '/post/:postId/comment/recent',
      optionalAccessToken(),
      parseParams(parseInt, { entity: 'post', param: 'postId', as: 'id' }),
      parseOpts(x => x == 'true', { opt: 'body', default: true }),
      parseOpts(
        parseInt,
        { opt: 'skip', default: 0 },
        { opt: 'take', default: 10 },
        { opt: 'from', default: 0 },
        { opt: 'until', default: 0 }
      ),
      getPost(prisma),
      getComments(prisma),
      getCommentVoteSums(prisma),
      getUserCommentVotes(prisma),
      sendLocalsField('comment')
    );
    app.get(
      '/post/:postId/comment/top',
      optionalAccessToken(),
      parseParams(parseInt, { entity: 'post', param: 'postId', as: 'id' }),
      parseOpts(x => x == 'true', { opt: 'body', default: true }),
      parseOpts(
        parseInt,
        { opt: 'skip', default: 0 },
        { opt: 'take', default: 10 },
        { opt: 'from', default: 0 },
        { opt: 'until', default: 0 }
      ),
      getPost(prisma),
      getTopComments(prisma),
      getUserCommentVotes(prisma),
      sendLocalsField('comment')
    );

    app.post(
      '/post/:postId/vote',
      verifyAccessToken(),
      checkBody({ name: 'value', type: 'number', include: [-1, 0, 1] }),
      parseParams(parseInt, { entity: 'post', param: 'postId', as: 'id' }),
      getPost(prisma),
      handlePostVote(prisma)
    );
    app.post(
      '/post/:postId/comment/create',
      verifyAccessToken(),
      checkBody({ name: 'content', type: 'string' }),
      parseParams(parseInt, { entity: 'post', param: 'postId', as: 'id' }),
      getPost(prisma),
      createComment(prisma),
      sendLocalsField('comment')
    );
    app.post(
      '/post/:postId/edit/create',
      verifyAccessToken(),
      checkBody(
        { name: 'title', type: 'string' },
        { name: 'content', type: 'string' }
      ),
      parseParams(parseInt, { entity: 'post', param: 'postId', as: 'id' }),
      getPost(prisma),
      createPostEdit(prisma, 'body'),
      sendLocalsField('post')
    );
  };
}
