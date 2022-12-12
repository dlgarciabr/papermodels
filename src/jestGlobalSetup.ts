import "tsconfig-paths/register";
import db from "db";

const globalSetup = async () => {
  console.debug(`
==================================================================================
=======================       The tests were started       =======================
==================================================================================
`);
  void db.$connect();
  await new Promise((res) => setTimeout(() => res(""), 5000));
  console.info("DB connection started...");
};

export default globalSetup;
