"use client";
import * as React from "react";
import { NextUIProvider } from "@nextui-org/system";
import { Tasks } from "./tasks";
import { Opportunities } from "./opportunities";
import { FetchedNotionData } from "../page";
import { useState } from "react";

export function MainPanel({
  data,
  setData,
}: {
  data: FetchedNotionData;
  setData: (data: FetchedNotionData) => void;
}) {
  return (
    <NextUIProvider>
      <main className="flex w-screen h-screen p-1">
        <Tasks tasks={data.tasksDatabase?.databaseItems} />
        <Opportunities
          opportunitiesByStatus={data.opportunityData.opportunitiesByStatus}
          opportunitiesOrdered={data.opportunityData.opportunitiesOrdered}
          eventsByOpportunityId={data.eventsData.eventsByOpportunityId}
          tasksDatabaseId={data.tasksDatabase.databaseId}
          eventsDatabaseId={data.eventsData.eventsDatabaseId}
          setData={setData}
        />
      </main>
    </NextUIProvider>
  );
}
