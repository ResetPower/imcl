import got from "got";
import { logger } from "../renderer/global";

export interface Hitokoto {
  content: string;
  from: string;
}

export async function fetchHitokoto(): Promise<Hitokoto | null> {
  logger.info("Fetching hitokoto ...");
  try {
    const resp = await got("https://epherome.com/api/hitokoto");
    const parsed = JSON.parse(resp.body);
    logger.info("Fetched hitokoto");
    return {
      content: parsed.content,
      from: `——${parsed.from}`,
    };
  } catch (e) {
    logger.warn("Unable to fetch hitokoto");
    return null;
  }
}
