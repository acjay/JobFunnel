import { NOTION_TOKEN } from "./env";

import { Client } from "@notionhq/client";

// Initializing a client
export const notion = new Client({
  auth: NOTION_TOKEN,
});
