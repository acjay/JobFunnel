import { Button } from "@nextui-org/react";
import SetupBody from "./SetupBody";

export default function SelectDatabases() {
  return (
    <SetupBody
      headerContents="Select Databases"
      bodyContents={
        <div>
          <p>
            JobFunnel needs to know which databases in Notion correspond to
            opportunities, tasks, and events. Please select the databases below.
          </p>
          <p>TODO: actually create database selection UI</p>
        </div>
      }
      footerContents={
        <Button
          onClick={() => {
            // Save the selected databases to the user's Auth0 app metadata
            // and redirect to the main JobFunnel page.
          }}
          color="primary"
        >
          Save and continue
        </Button>
      }
    />
  );
}
