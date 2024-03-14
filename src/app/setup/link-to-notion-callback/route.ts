import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { Client, collectPaginatedAPI } from "@notionhq/client";
import { OauthTokenResponse } from "@notionhq/client/build/src/api-endpoints";
import {
  DEFAULT_EMAIL_DATABASE_TITLE,
  DEFAULT_EVENT_DATABASE_TITLE,
  DEFAULT_OPPORTUNITY_DATABASE_TITLE,
  DEFAULT_TASK_DATABASE_TITLE,
} from "@/app/lib/models";
import {
  AUTH0_DOMAIN,
  AUTH0_LOGIN_STATE_COOKIE,
  AUTH0_NOTION_SETUP_REDIRECT_SECRET,
  BASE_URL,
  NOTION_OAUTH_CLIENT_ID,
  NOTION_OAUTH_CLIENT_SECRET,
} from "@/app/env";
import { redirect } from "next/navigation";

/**
 * This route receives the callback from Notion's OAuth flow. It exchanges the
 * temporary code for a long-lived access token, and then redirects back to the
 * Auth0 login flow to complete the login.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const error = searchParams.get("error");
  if (error) {
    // Errors may be found https://datatracker.ietf.org/doc/html/rfc6749#section-5.2
    console.error("Error from Notion OAuth", error);
    redirect("/setup?connectSuccess=false");
  }

  // Notion sends us a short-lived code to be exchanged for a long-lived access
  // token.
  const code = searchParams.get("code");
  if (!code) {
    return Response.json({ error: "No code provided" });
  }

  // Exchange the OAuth code for a long-lived access token.
  const tempNotion = new Client();
  let notionIntegration: OauthTokenResponse;
  try {
    notionIntegration = await tempNotion.oauth.token({
      grant_type: "authorization_code",
      client_id: NOTION_OAUTH_CLIENT_ID,
      client_secret: NOTION_OAUTH_CLIENT_SECRET,
      code,
      redirect_uri: `${BASE_URL}/setup/link-to-notion-callback`,
    });
    console.debug("Notion OAuth token response", notionIntegration);
  } catch (e) {
    // Errors may be found https://datatracker.ietf.org/doc/html/rfc6749#section-5.2
    console.error("Error fetching Notion OAuth token", e);
    redirect(`/setup?connectSuccess=false`);
  }

  // If a template was duplicated, try to find the databases.
  const notion = new Client({
    auth: notionIntegration.access_token,
  });
  const rootPageId = notionIntegration.duplicated_template_id;
  let opportunityDatabaseId: string | null = null;
  let taskDatabaseId: string | null = null;
  let eventDatabaseId: string | null = null;
  let emailDatabaseId: string | null = null;
  if (rootPageId) {
    // We'll use this several times in parallel.
    const findDatabase = async function findDatabase(databaseTitle: string) {
      console.log(`Searching for database named "${databaseTitle}"...`);
      console.time(`findDatabase: ${databaseTitle}`);
      const searchResults = await notion.search({
        query: databaseTitle,
        filter: {
          property: "object",
          value: "database",
        },
      });

      const databaseId = searchResults.results?.[0].id ?? null;
      if (databaseId) {
        console.log(
          `Found database with title "${databaseTitle}. Id: ${databaseId}"`
        );
      } else {
        console.log(`Could not find database with title "${databaseTitle}"`);
      }

      console.timeEnd(`findDatabase: ${databaseTitle}`);

      return databaseId;
    };

    [opportunityDatabaseId, taskDatabaseId, eventDatabaseId, emailDatabaseId] =
      await Promise.all([
        findDatabase(DEFAULT_OPPORTUNITY_DATABASE_TITLE),
        findDatabase(DEFAULT_TASK_DATABASE_TITLE),
        findDatabase(DEFAULT_EVENT_DATABASE_TITLE),
        findDatabase(DEFAULT_EMAIL_DATABASE_TITLE),
      ]);
  }

  // Redirect back to Auth0 to complete the login. The state token for resuming
  // the login process is stored in a cookie. Retrieve it and delete the
  // cookie.
  const { state, userId } = JSON.parse(
    cookies().get(AUTH0_LOGIN_STATE_COOKIE)!.value
  ) as { state: string; userId: string };
  cookies().delete(AUTH0_LOGIN_STATE_COOKIE);

  const payload = {
    sub: userId,
    iss: "jobfunnnel.acjay.com",
    state,
    notionIntegration,
    rootPageId,
    opportunityDatabaseId,
    taskDatabaseId,
    eventDatabaseId,
    emailDatabaseId,
  };
  const token = jwt.sign(payload, AUTH0_NOTION_SETUP_REDIRECT_SECRET, {
    expiresIn: "60s",
  });
  redirect(
    `https://${AUTH0_DOMAIN}/continue?state=${state}&session_token=${token}`
  );
}
