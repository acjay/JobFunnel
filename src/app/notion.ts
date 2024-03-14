import { Client } from "@notionhq/client";
import { Session, getSession } from "@auth0/nextjs-auth0";

export type NotionConnection =
  | {
      integrationState: "not-connected";
    }
  | {
      integrationState: "databases-not-selected";
      notionClient: Client;
      rootPageId: string | null;
    }
  | {
      integrationState: "connected";
      notionClient: Client;
      opportunityDatabaseId: string;
      taskDatabaseId: string;
      eventDatabaseId: string;
    };

export async function getNotionConnection(
  session?: Session | null
): Promise<NotionConnection> {
  if (!session) {
    session = await getSession();
    if (!session) {
      throw new Error("No session found");
    }
  }

  // Pull the Notion connection data from the Auth0 claims.
  const {
    notionIntegration,
    rootPageId,
    opportunityDatabaseId,
    taskDatabaseId,
    eventDatabaseId,
    emailDatabaseId,
  } = session!.user;

  const notionAccessToken = notionIntegration?.access_token;
  if (!notionAccessToken) {
    return {
      integrationState: "not-connected",
    };
  }

  const notionClient = new Client({
    auth: notionAccessToken,
  });

  if (
    !opportunityDatabaseId ||
    !taskDatabaseId ||
    !eventDatabaseId ||
    !emailDatabaseId
  ) {
    return {
      integrationState: "databases-not-selected",
      notionClient,
      rootPageId,
    };
  }

  return {
    integrationState: "connected",
    notionClient,
    opportunityDatabaseId,
    taskDatabaseId,
    eventDatabaseId,
  };
}
