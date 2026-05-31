import Anthropic from "@anthropic-ai/sdk";
import dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.join(__dirname, "..", ".env") });

export const claude = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});
