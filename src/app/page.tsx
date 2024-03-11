import * as React from "react";
import { useEffect, useState } from "react";
import { useUser, withPageAuthRequired } from "@auth0/nextjs-auth0/client";
import { getNotionConnection } from "./notion";
import { FetchedNotionData, getData } from "./fetchers";
import { Tasks } from "./components/tasks";
import { Opportunities } from "./components/Opportunities";
import { redirect } from "next/navigation";
import NoUserSplash from "./components/NoUserSplash";
import { getSession } from "@auth0/nextjs-auth0";

export default async function Home() {
  // const [data, setData] = useState<FetchedNotionData>();
  // const { user, error, isLoading } = useUser();

  // useEffect(() => {
  //   async function fetchData() {
  //     const newData = await getData();
  //     setData(newData);
  //   }
  //   if (user) {
  //     fetchData();
  //   }
  // }, [user]);

  const session = await getSession();
  const user = session?.user;

  if (!user) {
    return <NoUserSplash />;
  }

  const notionConnection = await getNotionConnection(user.sub);
  if (notionConnection.integrationState !== "connected") {
    redirect("/setup");
  }

  const data = await getData(
    notionConnection.notionClient,
    notionConnection.opportunitiesDatabaseId,
    notionConnection.tasksDatabaseId,
    notionConnection.eventsDatabaseId
  );

  return (
    <main className="flex w-screen h-[calc(100vh-40px)] p-2 space-x-2">
      <Tasks tasks={data.taskData?.databaseItems} />
      <Opportunities
        initialOpportunitiesByStatus={
          data.opportunityData.opportunitiesByStatus
        }
        initialOpportunitiesOrdered={data.opportunityData.opportunitiesOrdered}
        eventsByOpportunityId={data.eventData.eventsByOpportunityId}
        tasksDatabaseId={data.taskData.databaseId}
        eventsDatabaseId={data.eventData.databaseId}
      />
    </main>
  );
}
