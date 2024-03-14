"use client";

import { Button } from "@nextui-org/react";
import SetupBody from "./SetupBody";
import { redirect } from "next/navigation";
import { unlinkFromNotion } from "./actions";

export default function SuccessfullConnected() {
  // TODO: show links to the databases and root page in Notion.
  return (
    <SetupBody
      headerContents="Setup is complete"
      bodyContents={
        <div>
          <p>JobFunnel is now connected to your Notion workspace.</p>
        </div>
      }
      footerContents={
        <>
          <a href="/">
            <Button color="primary">Back to Jobfunnel</Button>
          </a>
          <Button
            onClick={async () => {
              if (
                confirm("Are you sure you want to reset the Notion connection?")
              ) {
                await unlinkFromNotion();
                redirect("/setup?unlinked=true");
              }
            }}
          >
            Reset Notion connection
          </Button>
        </>
      }
    />
  );
}
