import "tsconfig-paths/register";
import db from "db";

const globalSetup = async () => {
  console.debug(`
==================================================================================
=======================       The tests were started       =======================
==================================================================================
`);
  // console.info("DB connection is beeing initialized...");
  // await db.$connect();
  // console.info("DB connection initialized!");
};

export default globalSetup;
