import type { PrismaClient } from '@prisma/client';
import type { Express } from 'express';

// Language
import createLanguage from '../middleware/language/createLanguage';
import deleteLanguage from '../middleware/language/deleteLanguage';
import getDetailedLanguage from '../middleware/language/getDetailedLanguage';
import getLanguage from '../middleware/language/getLanguage';
import getLanguageByName from '../middleware/language/getLanguageByName';
import languageAvailable from '../middleware/language/languageAvailable';
import searchLanguages from '../middleware/language/searchLanguages';

// Post
import createPost from '../middleware/post/createPost';
import getPosts from '../middleware/post/getPosts';
import getTopPosts from '../middleware/post/getTopPosts';
import searchPosts from '../middleware/post/searchPosts';

// PostVote
import getPostVoteSums from '../middleware/postVote/getPostVoteSums';
import getUserPostVotes from '../middleware/postVote/getUserPostVotes';

// Subscription
import handleSubscription from '../middleware/subscription/handleSubscription';
import getSubscription from '../middleware/subscription/getSubscription';
import getUserSubscription from '../middleware/subscription/getUserSubscription';
import getUserSubscriptions from '../middleware/subscription/getUserSubscriptions';

// Token
import verifyAccessToken from '../middleware/utils/token/verifyAccessToken';
import optionalAccessToken from '../middleware/utils/token/optionalAccessToken';

// Utils
import checkBody from '../middleware/utils/checkBody';
import checkUnique, { LanguageArg } from '../middleware/utils/checkUnique';
import parseParams from '../middleware/utils/parseParams';
import sendLocalsField from '../middleware/utils/sendLocalsField';
import parseOpts from '../middleware/utils/parseOpts';

export default function languageRoutes(app: Express) {
  return (prisma: PrismaClient) => {
    // Delete routes
    app.delete(
      '/language/:languageId/delete',
      verifyAccessToken(),
      parseParams(parseInt, {
        entity: 'language',
        param: 'languageId',
        as: 'id',
      }),
      getLanguage(prisma),
      deleteLanguage(prisma),
      sendLocalsField('message')
    );

    // Get routes
    app.get(
      '/language/available/:name',
      parseParams(x => x, { entity: 'language', param: 'name' }),
      languageAvailable(prisma),
      sendLocalsField('message')
    );
    app.get(
      '/language/name/:name',
      optionalAccessToken(),
      parseParams(x => x, { entity: 'language', param: 'name' }),
      parseOpts(
        parseInt,
        { opt: 'take', default: 10 },
        { opt: 'skip', default: 0 }
      ),
      getLanguageByName(prisma),
      getUserSubscription(prisma),
      sendLocalsField('language')
    );
    app.get(
      '/language/search/:name',
      optionalAccessToken(),
      parseParams(x => x, { entity: 'language', param: 'name' }),
      parseOpts(x => x == 'true', { opt: 'body', default: true }),
      parseOpts(
        parseInt,
        { opt: 'take', default: 10 },
        { opt: 'skip', default: 0 }
      ),
      searchLanguages(prisma),
      getUserSubscriptions(prisma),
      sendLocalsField('language')
    );
    app.get(
      '/language/:languageId',
      optionalAccessToken(),
      parseParams(parseInt, {
        entity: 'language',
        param: 'languageId',
        as: 'id',
      }),
      getDetailedLanguage(prisma),
      getUserSubscription(prisma),
      sendLocalsField('language')
    );
    app.get(
      '/language/:languageId/subscribe',
      verifyAccessToken(),
      parseParams(parseInt, {
        entity: 'language',
        param: 'languageId',
        as: 'id',
      }),
      getLanguage(prisma),
      getSubscription(prisma),
      sendLocalsField('subscription')
    );
    app.get(
      '/language/:languageId/post/recent',
      optionalAccessToken(),
      parseParams(parseInt, {
        entity: 'language',
        param: 'languageId',
        as: 'id',
      }),
      parseOpts(x => x == 'true', { opt: 'body', default: true }),
      parseOpts(
        parseInt,
        { opt: 'skip', default: 0 },
        { opt: 'take', default: 10 },
        { opt: 'from', default: 0 },
        { opt: 'until', default: 0 }
      ),
      getLanguage(prisma),
      getPosts(prisma),
      getPostVoteSums(prisma),
      getUserPostVotes(prisma),
      sendLocalsField('post')
    );
    app.get(
      '/language/:languageId/post/top',
      optionalAccessToken(),
      parseParams(parseInt, {
        entity: 'language',
        param: 'languageId',
        as: 'id',
      }),
      parseOpts(x => x == 'true', { opt: 'body', default: true }),
      parseOpts(
        parseInt,
        { opt: 'skip', default: 0 },
        { opt: 'take', default: 10 },
        { opt: 'from', default: 0 },
        { opt: 'until', default: 0 }
      ),
      getLanguage(prisma),
      getTopPosts(prisma),
      getUserPostVotes(prisma),
      sendLocalsField('post')
    );
    app.get(
      '/language/:languageId/post/search/:string',
      optionalAccessToken(),
      parseParams(parseInt, {
        entity: 'language',
        param: 'languageId',
        as: 'id',
      }),
      parseParams(x => x, { entity: 'post', param: 'string' }),
      parseOpts(
        x => x == 'true',
        { opt: 'body', default: true },
        { opt: 'title', default: true },
        { opt: 'content', default: true }
      ),
      parseOpts(
        parseInt,
        { opt: 'skip', default: 0 },
        { opt: 'take', default: 10 },
        { opt: 'from', default: 0 },
        { opt: 'until', default: 0 }
      ),
      getLanguage(prisma),
      searchPosts(prisma),
      getPostVoteSums(prisma),
      getUserPostVotes(prisma),
      sendLocalsField('post')
    );

    // Post routes
    app.post(
      '/language/create',
      verifyAccessToken(),
      checkBody({ name: 'name', type: 'string' }),
      checkUnique<LanguageArg>(prisma, { entity: 'language', key: 'name' }),
      createLanguage(prisma),
      sendLocalsField('language')
    );
    app.post(
      '/language/:languageId/subscribe',
      verifyAccessToken(),
      checkBody({ name: 'value', type: 'boolean' }),
      parseParams(parseInt, {
        entity: 'language',
        param: 'languageId',
        as: 'id',
      }),
      getLanguage(prisma),
      handleSubscription(prisma)
    );
    app.post(
      '/language/:languageId/post/create',
      verifyAccessToken(),
      checkBody(
        { name: 'title', type: 'string' },
        { name: 'content', type: 'string' }
      ),
      parseParams(parseInt, {
        entity: 'language',
        param: 'languageId',
        as: 'id',
      }),
      getLanguage(prisma),
      createPost(prisma),
      sendLocalsField('post')
    );
  };
}
