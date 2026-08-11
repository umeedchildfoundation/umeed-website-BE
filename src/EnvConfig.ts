import dotenv from "dotenv";

dotenv.config();

const ENV_CONFIG = {
  CONN_URL: process.env.DATABASE_URL || "",
};

if (!ENV_CONFIG.CONN_URL) {
  throw new Error("DATABASE_URL is missing. Add it to your .env file.");
}

export default ENV_CONFIG;
