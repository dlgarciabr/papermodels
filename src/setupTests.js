// import '../jest.config.js';
// import db from "db";

// import { cleanup } from 'utils/test-utils';
// import { mswServer } from './__mocks__/msw-server';
// import { store } from './redux/reduxStore';
// import { volunteerHubApi } from './services/volunteerHubApi';

beforeEach(() => {
  // console.info(location.href);
  // window.history.pushState({}, "", "http://localhost:3000/");
  // console.info(location.href);
  // cleanup();
});

beforeAll(() => {
  // console.debug('==========================================================================================');
  // console.debug('Initiating tests...');
  console.log("1 - beforeAll");
  // void db.$connect();
  // mswServer.listen({
  //   onUnhandledRequest: 'error',
  //   // onUnhandledRequest: 'bypass',
  // })
});

afterEach(() => {
  // mswServer.resetHandlers();
  // store.dispatch(volunteerHubApi.util.resetApiState());
  // window.sessionStorage.clear();
});

afterAll(() => {
  // mswServer.close();
  console.log("1 - afterAll");
  console.debug(
    "=========================================================================================="
  );
});
