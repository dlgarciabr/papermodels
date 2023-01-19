// import { Ctx } from "blitz"

// const pingDB = async () =>
//   new Promise<void>((resolve) => {
//     https
//       .get('https://webhook.site/1167836f-8474-4b11-9604-add5273e67a1', (_res) => {
//         resolve();
//       })
//       .on('error', (_err) => {
//         resolve();
//       });
//   });

// export default async function handler(request: NextApiRequest, response: NextApiResponse) {
//   await pingDB();
//   response.status(200).json({
//     body: request.body,
//     query: request.query,
//     cookies: request.cookies
//   });
// }
import { api } from 'src/blitz-server';

export default api(async (_req, res, _ctx) => {
  // ctx.session.$authorize()
  // const publicData = ctx.session.$publicData

  res.status(200).json({
    // userId: ctx.session.userId,
    // publicData: { ...publicData },
  });
});
