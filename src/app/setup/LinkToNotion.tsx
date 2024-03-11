"use server";

import { Button } from "@nextui-org/react";
import SetupBody from "./SetupBody";
import { NOTION_OAUTH_AUTH_URL } from "../env";

export default function LinkToNotion() {
  return (
    <SetupBody
      headerContents="Jobfunnel Setup"
      bodyContents={
        <>
          <p>
            Jobfunnel uses your <a href="https://notion.so">Notion</a> workspace
            as its database. You will need to set up an account there, if you
            don&apos;t already have one.
          </p>
          <p>
            Everything Jobfunnel helps you track about your job search will be
            stored in your Notion workspace, and you can even use Notion
            directly to manage your job search. You can do this in combination
            with Jobfunnel or if you ever decide to stop using Jobfunnel, your
            data is out of our hands and in your Notion workspace.
          </p>
          <p>
            To get started, you will need to connect Jobfunnel to your Notion
            workspace. Once connected, Notion will take you to a template that
            is ready to use with Jobfunnel.
          </p>
        </>
      }
      footerContents={
        <a href={NOTION_OAUTH_AUTH_URL} className="w-full">
          <Button color="primary">Get started!</Button>
        </a>
      }
    />
  );
}
