import { Button } from "@nextui-org/react";
import SetupBody from "./SetupBody";
import { redirect } from "next/navigation";

export default function SuccessfullConnected({
  resetNotionConnection,
}: {
  resetNotionConnection: () => Promise<void>;
}) {
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
                await resetNotionConnection();
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
