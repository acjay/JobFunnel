if (process.env.AUTH0_ISSUER_BASE_URL === undefined) {
  throw new Error("AUTH0_ISSUER_BASE_URL is not defined");
}
export const AUTH0_ISSUER_BASE_URL: string = process.env.AUTH0_ISSUER_BASE_URL;

if (process.env.AUTH0_DOMAIN === undefined) {
  throw new Error("AUTH0_DOMAIN is not defined");
}
export const AUTH0_DOMAIN: string = process.env.AUTH0_DOMAIN;

if (process.env.AUTH0_CLIENT_ID === undefined) {
  throw new Error("AUTH0_CLIENT_ID is not defined");
}
export const AUTH0_CLIENT_ID: string = process.env.AUTH0_CLIENT_ID;

if (process.env.AUTH0_CLIENT_SECRET === undefined) {
  throw new Error("AUTH0_CLIENT_SECRET is not defined");
}
export const AUTH0_CLIENT_SECRET: string = process.env.AUTH0_CLIENT_SECRET;

if (process.env.NOTION_OAUTH_CLIENT_ID === undefined) {
  throw new Error("NOTION_OAUTH_CLIENT_ID is not defined");
}
export const NOTION_OAUTH_CLIENT_ID: string =
  process.env.NOTION_OAUTH_CLIENT_ID;

if (process.env.NOTION_OAUTH_CLIENT_SECRET === undefined) {
  throw new Error("NOTION_OAUTH_CLIENT_SECRET is not defined");
}
export const NOTION_OAUTH_CLIENT_SECRET: string =
  process.env.NOTION_OAUTH_CLIENT_SECRET;

if (process.env.NOTION_OAUTH_AUTH_URL === undefined) {
  throw new Error("NOTION_OAUTH_AUTH_URL is not defined");
}
export const NOTION_OAUTH_AUTH_URL: string = process.env.NOTION_OAUTH_AUTH_URL;

if (process.env.BASE_URL === undefined) {
  throw new Error("BASE_URL is not defined");
}
export const BASE_URL: string = process.env.BASE_URL;
