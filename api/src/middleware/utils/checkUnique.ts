import type { Language, PrismaClient, User } from '@prisma/client';
import type { Request, Response, NextFunction } from 'express';

export interface UserArg {
  entity: 'user';
  key: keyof User;
}
export interface LanguageArg {
  entity: 'language';
  key: keyof Language;
}

// type Arg = UserArg | LanguageArg;

// interface UserFn {
//   (prisma: PrismaClient, ...args: UserArg[]): void;
// }
// interface LanguageFn {
//   (prisma: PrismaClient, ...args: UserArg[]): void;
// }

/**
 * Checks if any unique constraints are violated by the request
 * Calls the next middlewave if no violation
 * Calls the error handler otherwise
 */
export default function checkUnique<T>(
  prisma: PrismaClient,
  ...args: T extends UserArg ? UserArg[] : LanguageArg[]
) {
  return (req: Request, _res: Response, next: NextFunction) => {
    // const a: Arg = [{ entity: 'language', key: 'name' }];

    Promise.all(
      args.map(arg =>
        prisma[arg.entity]
          //@ts-ignore TODO: solve this shit
          .findFirst({
            where: {
              [arg.key]: {
                equals: req.body[arg.key],
                mode: 'insensitive',
              },
            },
          })
          //@ts-ignore TODO: solve this shit
          .then(e => {
            if (e !== null) {
              return next({
                message: `${arg.entity} with ${arg.key} '${
                  req.body[arg.key]
                }' already exists`,
                status: 400,
              });
            }
          })
      )
    )
      .then(() => next())
      .catch(err => {
        console.error(err);
        return next({
          message: 'database error',
          status: 500,
        });
      });
  };
}

// interface T {
//   language: {
//     findFirst: (arg: any) => Promise<Language | null>;
//   };
//   user: {
//     findFirst: (arg: any) => Promise<User | null>;
//   };
// }
//
// export function test(prisma: T, ...args: Arg[]) {
//   return (req: Request, _res: Response, next: NextFunction) => {
//     Promise.all(
//       args.map(arg =>
//         prisma[arg.entity]
//           .findFirst({
//             where: {
//               [arg.key]: req.body[arg.key],
//             },
//           })
//           .then(e => {
//             if (e !== null) {
//               return next({
//                 message: `${arg.entity} with ${arg.key} '${
//                   e[arg.key]
//                 }' already exists`,
//                 status: 400,
//               });
//             }
//           })
//       )
//     )
//       .then(() => next())
//       .catch(err => {
//         console.error(err);
//         return next({
//           message: 'database error',
//           status: 500,
//         });
//       });
//   };
// }

// type A = {
//   a: {
//     fn: () => void;
//   };
//   b: {
//     fn2: () => void;
//   };
// };
//
// export function fn(obj: A, param: keyof A) {
//   obj[param].fn();
// }
