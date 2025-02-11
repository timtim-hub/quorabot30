import { z } from "zod";
import dotenv from "dotenv";
dotenv.config();

const StagehandConfig = {
  env: "LOCAL",
  headless: process.env.HEADLESS === "true",
  debugDom: true,
  domSettleTimeoutMs: 30000,
  enableCaching: true,
  modelName: "gpt-4o",
  llmApiKey: process.env.OPENAI_API_KEY,
  verbose: 1,
};

export default StagehandConfig;
