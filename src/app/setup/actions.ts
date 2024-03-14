"use server";

import { redirect } from "next/navigation";
import { ManagementClient } from "auth0";
import {
  AUTH0_ISSUER_BASE_URL,
  AUTH0_CLIENT_ID,
  AUTH0_CLIENT_SECRET,
} from "@/app/env";
import { getSession } from "@auth0/nextjs-auth0";

/**
 * Unlinking from Notion is done by setting notionSetupConfirmed to false in the
 * user's metadata. This will cause the Auth0 Redirect to Notion setup action to
 * clear out the Notion settings in the user's app metadata and redirect to the
 * /setup route to put the user back in the setup flow.
 * @param auth0UserId
 */
export async function unlinkFromNotion(): Promise<void> {
  const session = await getSession();
  if (!session) {
    throw new Error("User is not authenticated");
  }

  const userManagementClient = new ManagementClient({
    domain: AUTH0_ISSUER_BASE_URL,
    clientId: AUTH0_CLIENT_ID,
    clientSecret: AUTH0_CLIENT_SECRET,
  });

  const updateResult = await userManagementClient.users.update(
    { id: session.user.sub },
    { user_metadata: { notionSetupConfirmed: false } }
  );
  console.debug("Auth0 user update result", updateResult);

  // Redirect to login to restart the setup flow.
  redirect("/api/auth/login?returnTo=/setup");
}
