import {
  ApiResponse,
  GetUsers200ResponseOneOf,
  GetUsers200ResponseOneOfInner,
  ManagementClient,
} from "auth0";
import {
  Client,
  collectPaginatedAPI,
  isFullDatabase,
  isFullPage,
} from "@notionhq/client";
import { AUTH0_DOMAIN, AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET } from "./env";
import { Auth0AppMetadata } from "./lib/models";
import { getSession } from "@auth0/nextjs-auth0";

export type NotionConnection =
  | {
      integrationState: "not-connected";
    }
  | {
      integrationState: "root-page-not-selected";
      notionClient: Client;
    }
  | {
      integrationState: "databases-not-selected";
      notionClient: Client;
      rootPageId: string;
    }
  | {
      integrationState: "connected";
      notionClient: Client;
      rootPageId: string;
      opportunitiesDatabaseId: string;
      tasksDatabaseId: string;
      eventsDatabaseId: string;
    };

export async function getNotionConnection(
  userId?: string
): Promise<NotionConnection> {
  if (!userId) {
    const sesssion = await getSession();
    if (!sesssion) {
      throw new Error("User is not authenticated");
    }
    userId = sesssion.user.sub as string;
  }
  console.log({ userId });

  const userManagementClient = new ManagementClient({
    domain: AUTH0_DOMAIN,
    clientId: AUTH0_CLIENT_ID,
    clientSecret: AUTH0_CLIENT_SECRET,
  });

  let auth0User: ApiResponse<GetUsers200ResponseOneOfInner>;
  try {
    auth0User = await userManagementClient.users.get({ id: userId });
  } catch (error) {
    console.error("Error fetching user", error);
    throw error;
  }
  const appMetadata = auth0User.data
    .app_metadata as unknown as Auth0AppMetadata;

  if (!appMetadata.notionIntegration) {
    return {
      integrationState: "not-connected",
    };
  }

  const notionClient = new Client({
    auth: appMetadata.notionIntegration.access_token,
  });

  if (!appMetadata.rootPageId) {
    return {
      integrationState: "root-page-not-selected",
      notionClient,
    };
  } else if (
    !appMetadata.opportunityDatabaseId ||
    !appMetadata.taskDatabaseId ||
    !appMetadata.eventDatabaseId
  ) {
    return {
      integrationState: "databases-not-selected",
      notionClient,
      rootPageId: appMetadata.rootPageId,
    };
  }

  return {
    integrationState: "connected",
    notionClient,
    rootPageId: appMetadata.rootPageId,
    opportunitiesDatabaseId: appMetadata.opportunityDatabaseId,
    tasksDatabaseId: appMetadata.taskDatabaseId,
    eventsDatabaseId: appMetadata.eventDatabaseId,
  };
}
