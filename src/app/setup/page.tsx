"use server";

import React from "react";
import { getNotionConnection } from "../actions";
import { getSession, withPageAuthRequired } from "@auth0/nextjs-auth0";
import LinkToNotion from "./LinkToNotion";
import SelectDatabases from "./SelectDatabases";
import SuccessfullyConnected from "./SuccessfullyConnected";
import { unlinkFromNotion } from "./actions";

/**
 * Getting set up with Notion is a multi-step process, with an OAuth flow
 * coordinated between JobFunnel and Notion, and then the selection of the
 * Noton page to be used as the JobFunnel databse.
 *
 * 1. User clicks the "Get started!" button, which takes the browser to Notion
 *    to the first step of its OAuth flow
 *    (https://developers.notion.com/docs/authorization).
 * 2. Notion presents the dialog asking for permission, whether to duplicate
 *    the JobFunnel template, and which pages to provide access to.
 * 3. If successful, the browser is redirected to /api/connectToNotion, with
 *    an OAuth code.
 * 4. The /setup/callback handler calls the Notion API to exchange the OAuth code
 *    for a permanent access token.
 * 5. The access token and other integration data are stored in the user's
 *    Auth0 app metadata.
 * 6. The user is redirected back to this page.
 * 7. Ideally, the user has duplicated a template and the
 * 8. The individual databases are identified and stored to the user's Auth0
 *    app metadata.
 * 9. The user is redirected to the main JobFunnel page.
 */
export default withPageAuthRequired(
  async function SetupNotionConnection() {
    const session = await getSession();
    const user = session!.user;
    const notionConnection = await getNotionConnection(user.sub);

    async function resetNotionConnection() {
      await unlinkFromNotion(user.sub);
    }

    if (notionConnection.integrationState === "not-connected") {
      return <LinkToNotion />;
    } else if (
      notionConnection.integrationState === "root-page-not-selected" ||
      notionConnection.integrationState === "databases-not-selected"
    ) {
      // TODO: we're probably going to want to do some logic to search the
      // pages the user has granted access to for the right databases to
      // prime the SelectDatabases component.
      //
      // Retrieve the list of pages in the user's Notion workspace
      // and display them as options for the user to select as the
      // root page for the JobFunnel database.
      // const defaultPageResponse = await notionConnection.notionClient.search({
      //   query: DEFAULT_ROOT_PAGE_TITLE,
      //   filter: {
      //     property: "object",
      //     value: "page",
      //   },
      // });

      return <SelectDatabases />;
    }

    return (
      <SuccessfullyConnected resetNotionConnection={resetNotionConnection} />
    );
  },
  { returnTo: "/setup" }
);
