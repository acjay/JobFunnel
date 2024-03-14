import { redirect } from "next/navigation";
import jwt from "jsonwebtoken";
import { AUTH0_NOTION_SETUP_REDIRECT_SECRET } from "@/app/env";
import { cookies } from "next/headers";

/**
 * This route receives the callback from Auth0's Redirect to Notion setup
 * Action, which happens if the user logs in but hasn't yet linked to
 * Notion. It stashes the state token in a cookie so that the Notion auth
 * callback can retrieve it, and redirects to the setup page so that the
 * user can approve the Notion link.
 *
 * Unfortunately, cookies cannot be set from a Server Component, so this
 * intermediate route is needed.
 */
export function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const state = searchParams.get("state");
  if (!state) {
    console.error("Parameter `state` is missing");
    redirect("/setup?connectSuccess=false");
  }

  const sessionToken = searchParams.get("session_token");
  if (!sessionToken) {
    console.error("Parameter `session_token` is missing");
    redirect("/setup?connectSuccess=false");
  }

  const auth0LoginClaims = jwt.verify(
    sessionToken,
    AUTH0_NOTION_SETUP_REDIRECT_SECRET
  );

  cookies().set(
    "auth0LoginState",
    JSON.stringify({ state, userId: auth0LoginClaims.sub })
  );

  redirect(`/setup?session_token=${sessionToken}`);
}
