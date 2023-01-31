/* istanbul ignore file -- @preserve */
import { paginate } from 'blitz';
import db, { FileType, Item } from 'db';
import { api } from 'src/blitz-server';

const search = async (expression: string, page: number): Promise<{ items: Item[]; count: number }> => {
  // return db.item.findMany({
  //   where: {
  //     OR: [
  //       {
  //         name: {
  //           contains: expression,
  //           mode: 'insensitive'
  //         }
  //       },
  //       {
  //         description: {
  //           contains: expression,
  //           mode: 'insensitive'
  //         }
  //       }
  //     ]
  //   },
  //   orderBy: { name: 'asc' },
  //   skip: 9 * page,
  //   take: 9,
  //   include: {
  //     files: {
  //       where: {
  //         artifactType: { equals: FileType.preview }
  //       },
  //       take: 1
  //     }
  //   }
  // });

  // const where = {
  //   OR: [
  //     {
  //       name: {
  //         contains: expression,
  //         mode: 'insensitive'
  //       }
  //     },
  //     {
  //       description: {
  //         contains: expression,
  //         mode: 'insensitive'
  //       }
  //     }
  //   ]
  // };

  const { items, count } = await paginate({
    skip: 9 * page,
    take: 9,
    count: () =>
      db.item.count({
        where: {
          OR: [
            {
              name: {
                contains: expression,
                mode: 'insensitive'
              }
            },
            {
              description: {
                contains: expression,
                mode: 'insensitive'
              }
            }
          ]
        }
      }),
    query: (_paginateArgs) =>
      db.item.findMany({
        // ...paginateArgs,
        where: {
          OR: [
            {
              name: {
                contains: expression,
                mode: 'insensitive'
              }
            },
            {
              description: {
                contains: expression,
                mode: 'insensitive'
              }
            }
          ]
        },
        orderBy: { name: 'asc' },
        include: {
          files: {
            where: {
              artifactType: { equals: FileType.preview }
            },
            take: 1
          }
        }
      })
  });

  return { items, count };
};

export default api(async (req, res, _ctx) => {
  if (req.method === 'POST') {
    const gRecaptchaSecret = process.env.NEXT_PUBLIC_RECAPTCHA_SECRET;
    if (!gRecaptchaSecret) {
      res.status(500).json({
        status: 'failure',
        message: 'Recaptcha params are not setted up'
      });
    }
    try {
      const reCaptchaRes = await fetch('https://www.google.com/recaptcha/api/siteverify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `secret=${gRecaptchaSecret}&response=${req.body.gRecaptchaToken}`
      });
      const captchaResultJson = await reCaptchaRes.json();
      if (captchaResultJson?.score > 0.5) {
        // TODO do the search
        const searchResult = await search(req.body.expression, req.body.page);
        // console.log(searchResult)
        res.status(200).json({
          status: 'success',
          data: searchResult
        });
      } else {
        res.status(200).json({
          status: 'failure',
          message: 'Google ReCaptcha Failure'
        });
      }
    } catch (err) {
      res.status(405).json({
        status: 'failure',
        message: 'Error submitting search'
      });
    }
  } else {
    res.status(405);
    res.end();
  }
});
