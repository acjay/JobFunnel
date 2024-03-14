"use server";

import React from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSession } from "@auth0/nextjs-auth0";
import jwt from "jsonwebtoken";
import { AUTH0_NOTION_SETUP_REDIRECT_SECRET } from "@/app/env";
import LinkToNotion from "./LinkToNotion";
import SelectDatabases from "./SelectDatabases";
import SuccessfullyConnected from "./SuccessfullyConnected";

type Auth0NotionSetupToken = {
  /** The Auth0 user ID stored in the standard JWT sub claim */
  iat: number;
  iss: string;
  sub: string;
  exp: number;
  missingMetadata: string[];
  redirect_url: string;
};

/**
 * Getting set up with Notion is a multi-step process, with an OAuth flow
 * coordinated between JobFunnel, Auth0 and Notion. Auth0 handles the workflow
 * as part of its login process. Before login is complete, an Auth0 Action
 * (hosted as custom code in Auth0) runs and determines with the user has all
 * of its Notion configuration data points. If not, the Action redirects the
 * user to this page to complete the setup.
 *
 * Here is the sign up / login flow in detail
 * 1. User signs up with an identity managed by Auth0.
 * 2. Auth0's login flow runs, collecting the user login credentials.
 * 3. Auth0's Action system runs the "Redirect to Notion setup" Login /
 *    Post-login action.
 * 4. a. If the user has all of the Notion configuration data points, login
 *       completes and the user is redirected back to the `/` route, and the
 *       app will be able to access Notion data.
 *    b. If not, the user is redirected to /setup/auth0-redirect-callback using
 *       the redirect functionality (https://bit.ly/3vhcWtX), which suspends
 *       the login flow until the user completes the setup.
 * 5. That route stashes the CSRF state token Auth0 provided us in a temporary
 *    cookie, so that it can be passed back to Auth0 when the Notion setup is
 *    complete, and then redirects to this page, passing along the session
 *    JWT.
 * 6. User clicks the "Get started!" button, which takes the browser to Notion
 *    to the first step of its OAuth flow
 *    (https://developers.notion.com/docs/authorization).
 * 7. Notion presents the dialog asking for permission, whether to duplicate
 *    the JobFunnel template, and which pages to provide access to.
 * 8. If successful, the browser is redirected to /api/connectToNotion, with
 *    an OAuth code.
 * 9. The /setup/callback handler calls the Notion API to exchange the OAuth code
 *    for a permanent access token.
 * 10. The user is redirected back to this page.
 * 11. Ideally, the user has duplicated a template and the databases are
 *     immediately identified. If not, this page allows for the selection.
 * 12. With all Notion data collected, The user is redirected back to Auth0 to
 *     resume the Redirect Action (the state token for the redirect is retrieved
 *     from the temp cookie). The action stores the Notion information in
 *     the user's metadata and sets it in the custom claims of the ID and access
 *     tokens returned to Jobfunnel.
 * 13. The login process completes and the user is redirected to the `/` route.
 */
export default async function SetupNotionConnection({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  console.debug("/setup", { searchParams });

  // Check if we're in the middle of the Auth0 login flow. In this case, the
  // user is technically unauthenticated, even though they have logged in. So
  // all of the information we have on hand comes from the redirect from Auth0.
  if (searchParams.session_token) {
    const sessionToken =
      searchParams.session_token instanceof Array
        ? searchParams.session_token[0]
        : searchParams.session_token;
    const auth0LoginClaims = jwt.verify(
      sessionToken,
      AUTH0_NOTION_SETUP_REDIRECT_SECRET,
      { complete: true }
    ).payload as Auth0NotionSetupToken;

    console.debug("Auth0 Action redirect data", {
      state: searchParams.state,
      sessionToken,
      auth0LoginClaims,
    });

    const missingMetadata = new Set(auth0LoginClaims.missingMetadata);
    if (missingMetadata.has("notionIntegration")) {
      // This is the first stage of setup, where we need the user to authorize
      // the Notion integration. This may or may not leave us with all of the
      // databases in a single step.
      return <LinkToNotion />;
    } else if (
      // If the user didn't duplicate the template, the databases still need
      // to be identified before login can be completed.
      missingMetadata.has("opportunityDatabaseId") ||
      missingMetadata.has("taskDatabaseId") ||
      missingMetadata.has("eventDatabaseId") ||
      missingMetadata.has("emailDatabaseId")
    ) {
      return <SelectDatabases />;
    }

    console.error(
      "Unexpected login state. Auth0 login should not be redirecting with a " +
        "`state` parameter unless notionIntegration and/or the database IDs " +
        "are missing.",
      { notionConnectionData: auth0LoginClaims }
    );
    throw new Error("Unexpected login state");
  }

  // If we're not in the middle of the Auth0 login flow, and the user isn't
  // logged in redirect to the login route, as if this were protected by
  // withPageAuthRequired (see https://bit.ly/4ceVB5y for the actual
  // implementation of that decorator).
  const session = await getSession();
  if (!session) {
    redirect("/api/auth/login?returnTo=/setup");
  }

  // Show the settings and give the user the option to unlink.
  return <SuccessfullyConnected />;
}

// Cookies can only be set in a Server Action
async function storeLoginContinueCookie(state: string, userId: string) {
  "use server";
  cookies().set("auth0LoginState", JSON.stringify({ state, userId }));
}
