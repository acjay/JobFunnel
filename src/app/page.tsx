import { Client, isFullPage } from "@notionhq/client";
import styles from "./page.module.css";


// Initializing a client
const notion = new Client({
	auth: process.env.NOTION_TOKEN,
})

async function getPageTitle() {
  const pageId = process.env.NOTION_PAGE_ID;
  const response = await notion.pages.retrieve({ page_id: pageId ?? "" });
  if (isFullPage(response)) {
    console.dir(response, { depth: null });
    return response.properties.title.title[0].plain_text;
  }
  return "No title found";
}

export default async function Home() {
  const title = await getPageTitle();
  return (
    <main className={styles.main}>
      <h1 className={styles.title}>{title}</h1>
    </main>
  );
}
