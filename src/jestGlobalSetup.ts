import "tsconfig-paths/register";
import db from "db";

const globalSetup = async () => {
  console.debug(`
==================================================================================
=======================       The tests were started       =======================
==================================================================================
`);
  try {
    await db.$connect();
    console.info("DB connection started...");
  } catch (error) {
    console.error(error);
  }
};

export default globalSetup;
