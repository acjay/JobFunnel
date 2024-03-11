import auth0 from "auth0";
import { Client, collectPaginatedAPI, isFullPage } from "@notionhq/client";
import {
  BlockObjectResponse,
  OauthTokenResponse,
  PartialBlockObjectResponse,
} from "@notionhq/client/build/src/api-endpoints";
import {
  AUTH0_ISSUER_BASE_URL,
  AUTH0_CLIENT_ID,
  AUTH0_CLIENT_SECRET,
  NOTION_OAUTH_CLIENT_ID,
  NOTION_OAUTH_CLIENT_SECRET,
} from "../env";
import {
  Auth0AppMetadata,
  DEFAULT_EMAIL_DATABASE_TITLE,
  DEFAULT_EVENT_DATABASE_TITLE,
  DEFAULT_OPPORTUNITY_DATABASE_TITLE,
  DEFAULT_TASK_DATABASE_TITLE,
} from "@/app/lib/models";
import { isChildDatabase } from "@/app/helpers";

export type LinkOutcome =
  | "notion-token-exchange-failed"
  | "linked-without-databases"
  | "linked-with-databases";

export async function linkToNotion(
  auth0UserId: string,
  oauthCode: string
): Promise<LinkOutcome> {
  // Exchange the OAuth code for a long-lived access token.
  const notion = new Client();
  let notionIntegration: OauthTokenResponse;
  try {
    notionIntegration = await notion.oauth.token({
      grant_type: "authorization_code",
      client_id: NOTION_OAUTH_CLIENT_ID,
      client_secret: NOTION_OAUTH_CLIENT_SECRET,
      code: oauthCode,
      redirect_uri: process.env.NOTION_REDIRECT_URI,
    });
    console.debug("Notion OAuth token response", notionIntegration);
  } catch (e) {
    // Errors may be found https://datatracker.ietf.org/doc/html/rfc6749#section-5.2
    console.error("Error fetching Notion OAuth token", e);
    return "notion-token-exchange-failed";
  }

  // Prepare to store the access token and the key Notion objects in user's
  // Auth0 metadata.
  const userManagementClient = new auth0.ManagementClient({
    domain: AUTH0_ISSUER_BASE_URL,
    clientId: AUTH0_CLIENT_ID,
    clientSecret: AUTH0_CLIENT_SECRET,
  });

  // If a template was duplicated, try to find the databases.
  let opportunityDatabaseId: string | null = null;
  let taskDatabaseId: string | null = null;
  let eventDatabaseId: string | null = null;
  let emailDatabaseId: string | null = null;
  if (notionIntegration.duplicated_template_id) {
    const blocksResponse = await collectPaginatedAPI(
      notion.blocks.children.list,
      {
        block_id: notionIntegration.duplicated_template_id,
      }
    );

    // We'll use this several times in parallel.
    const findDatabase = async function getTrackerDatabase(
      rootPageBlocks: (BlockObjectResponse | PartialBlockObjectResponse)[],
      databaseTitle: string
    ) {
      console.time(`findDatabase: ${databaseTitle}`);
      // console.log(`Fetching ${databaseTitle}...`);
      const databaseId = rootPageBlocks.find(
        (block) =>
          isChildDatabase(block) &&
          block?.child_database?.title === databaseTitle
      )?.id;
      if (!databaseId) {
        console.log(`Could not find database with title "${databaseTitle}"`);
        return null;
      }

      console.timeEnd(`findDatabase: ${databaseTitle}`);

      return databaseId;
    };

    const opportunityDatabaseIdPromise = findDatabase(
      blocksResponse,
      DEFAULT_OPPORTUNITY_DATABASE_TITLE
    );
    const taskDatabaseIdPromise = findDatabase(
      blocksResponse,
      DEFAULT_TASK_DATABASE_TITLE
    );
    const eventDatabaseIdPromise = findDatabase(
      blocksResponse,
      DEFAULT_EVENT_DATABASE_TITLE
    );
    const emailDatabaseIdPromise = findDatabase(
      blocksResponse,
      DEFAULT_EMAIL_DATABASE_TITLE
    );
    [opportunityDatabaseId, taskDatabaseId, eventDatabaseId, emailDatabaseId] =
      await Promise.all([
        opportunityDatabaseIdPromise,
        taskDatabaseIdPromise,
        eventDatabaseIdPromise,
        emailDatabaseIdPromise,
      ]);

    // This is only successful if all 4 databases were found. Otherwise,
    // something is probably a little funky and the setup process will have the
    // user manually identify all 4.
    if (
      opportunityDatabaseId &&
      taskDatabaseId &&
      eventDatabaseId &&
      emailDatabaseId
    ) {
      const appMetadata: Auth0AppMetadata = {
        notionIntegration,
        rootPageId: notionIntegration.duplicated_template_id,
        opportunityDatabaseId,
        taskDatabaseId,
        eventDatabaseId,
        emailDatabaseId,
      };
      const updateResult = await userManagementClient.users.update(
        { id: auth0UserId },
        { app_metadata: appMetadata }
      );
      console.debug("Auth0 user update result", updateResult);
      return "linked-with-databases";
    }
  }

  const appMetadata: Auth0AppMetadata = {
    notionIntegration,
    rootPageId: notionIntegration.duplicated_template_id,
    opportunityDatabaseId: null,
    taskDatabaseId: null,
    eventDatabaseId: null,
    emailDatabaseId: null,
  };
  const updateResult = await userManagementClient.users.update(
    { id: auth0UserId },
    { app_metadata: appMetadata }
  );
  console.debug("Auth0 user update result", updateResult);
  return "linked-without-databases";
}

export async function unlinkFromNotion(auth0UserId: string): Promise<void> {
  const userManagementClient = new auth0.ManagementClient({
    domain: AUTH0_ISSUER_BASE_URL,
    clientId: AUTH0_CLIENT_ID,
    clientSecret: AUTH0_CLIENT_SECRET,
  });

  const updateResult = await userManagementClient.users.update(
    { id: auth0UserId },
    { app_metadata: null }
  );
  console.debug("Auth0 user update result", updateResult);
}
