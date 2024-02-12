if (process.env.NOTION_PAGE_ID === undefined) {
    throw new Error("NOTION_PAGE_ID is not defined");
}
export const ROOT_PAGE_ID: string = process.env.NOTION_PAGE_ID

if (process.env.NOTION_TOKEN === undefined) {
    throw new Error("NOTION_TOKEN is not defined");
}
export const NOTION_TOKEN: string = process.env.NOTION_TOKEN