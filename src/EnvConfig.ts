import dotenv from "dotenv";

dotenv.config();

const ENV_CONFIG = {
  CONN_URL: process.env.DATABASE_URL || "",
};

export default ENV_CONFIG;
