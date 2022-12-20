import { graphql } from "msw";

// const baseUrl = process.env.REACT_APP_API_URL;

// const successLoginHandler = rest.post(`${baseUrl}/user/signin`, (req, res, ctx) => {
//   // const msg = `[successLoginHandler] MSW mocked POST called with params: ${JSON.stringify(req.body)}`;
//   // console.info(msg);
//   return res(
//     ctx.json({
//       id: 76,
//       token: '1567854363452345'
//     }),
//     ctx.status(200)
//   );
// });

// export const deniedLoginHandler = rest.post(`${baseUrl}/user/signin`, (req, res, ctx) => {
//   // const msg = `[JEST] POST MSW mocked called with params: ${JSON.stringify(req.body)}`;
//   // console.info(msg);
//   return res(ctx.status(401));
// });

// const successValidateTokenHandler = rest.get(`${baseUrl}/user/validateToken`, (req, res, ctx) => {
//   // const msg = `[successValidateTokenHandler] MSW mocked GET called with params: ${Array.from(req.url.searchParams.entries()).map(value => (value))}`;
//   // console.info(msg);
//   return res(
//     ctx.json({
//       valid: true
//     }),
//     ctx.status(200)
//   );
// });

// export const failValidateTokenHandler = rest.get(`${baseUrl}/user/validateToken`, (req, res, ctx) => {
//   // const msg = `[failValidateTokenHandler] MSW mocked GET called with params: ${Array.from(req.url.searchParams.entries()).map(value => (value))}`;
//   // console.info(msg);
//   return res(
//     ctx.json({
//       valid: false
//     }),
//     ctx.status(200)
//   );
// });

// const successSignUpHandler = rest.post(`${baseUrl}/user/signup`, (req, res, ctx) => {
//   // const msg = `[successValidateTokenHandler] MSW mocked GET called with params: ${Array.from(req.url.searchParams.entries()).map(value => (value))}`;
//   // console.info(msg);
//   return res(
//     ctx.json({
//       id: "134546"
//     }),
//     ctx.status(200)
//   );
// });

// export const createSuccessGetUserHandler = (responseObject: any) => (
//   rest.get(`${baseUrl}/user/:id`, (req, res, ctx) => {
//     // const msg = `[successGetUserHandlerWithParams] MSW mocked GET called with url: ${req.url}`;
//     // console.info(msg);
//     return res(
//       ctx.json(responseObject),
//       ctx.status(200)
//     );
//   })
// );

// export const createSuccessGetVolunteerHandler = (responseObject: any) => (
//   rest.get(`${baseUrl}/volunteer/:id`, (req, res, ctx) => {
//     // const msg = `[createSuccessGetVolunteerHandler] MSW mocked GET called with url: ${req.url}`;
//     // console.info(msg);
//     return res(
//       ctx.json(responseObject),
//       ctx.status(200)
//     );
//   })
// );

// const defaultSuccessGetUserHandler = createSuccessGetUserHandler({ userId: '76' });

// export const successHandlers = [
// successLoginHandler,
// successValidateTokenHandler,
// successSignUpHandler,
// defaultSuccessGetUserHandler
// ];

export const handlers = [
  // Handles a "Login" mutation
  // graphql.mutation('Login', null),
  // Handles a "GetUserInfo" query
  graphql.query("getCategories", (req, res, ctx) => {
    const msg = `[getCategories] MSW mocked GET called with url: ${req.url}`;
    console.info(msg);
    // const authenticatedUser = sessionStorage.getItem('is-authenticated')
    // if (!authenticatedUser) {
    //   // When not authenticated, respond with an error
    //   return res(
    //     ctx.errors([
    //       {
    //         message: 'Not authenticated',
    //         errorType: 'AuthenticationError',
    //       },
    //     ]),
    //   )
    // }
    // When authenticated, respond with a query payload
    return res(
      ctx.data({
        categories: [],
        nextPage: 1,
        hasMore: true,
        count: 10,
      })
    );
  }),
];
