"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useUser } from "@auth0/nextjs-auth0/client";
import { NextUIProvider } from "@nextui-org/system";
import { FetchedNotionData, getData } from "./actions";
import { Tasks } from "./components/tasks";
import { Opportunities } from "./components/opportunities";

export default function Home() {
  const [data, setData] = useState<FetchedNotionData>();
  const { user, error, isLoading } = useUser();

  useEffect(() => {
    async function fetchData() {
      const newData = await getData();
      setData(newData);
    }
    fetchData();
  }, []);

  async function moveCard(
    sourceStatus: string,
    sourceIndex: number,
    destinationStatus: string,
    destinationIndex: number,
    opportunityId: string
  ) {
    if (!data) {
      console.error("No data to move");
      return;
    }

    const opportunitiesOrdered = data.opportunityData.opportunitiesOrdered;
    const opportunitiesByStatus = data.opportunityData.opportunitiesByStatus;

    const opportunity = opportunitiesOrdered.find(
      (o) => o.id === opportunityId
    );

    if (!opportunity) {
      console.error(
        `Could not find opportunity with id ${opportunityId} in the ordered opportunities`
      );
      return;
    }

    if (
      sourceStatus === destinationStatus &&
      sourceIndex === destinationIndex
    ) {
      console.log("No change");
      return;
    }

    // if (result.source.index === result.destination.index) {
    //   return;
    // }

    // We want to calculate an ordering key that puts the moved opportunity
    // between the adjacent opportunities in the destination status. But,
    // this could collide with an ordering key outside the destination status,
    // if these opportunities are not adjacent in the global ordering.
    // So, we'll place it halfway between the previous opportunity and the next
    // opportunity in the global ordering, which will have an ordering key
    // less than or equal to that of the next opportunity in the destination
    // status.

    const prevOpportunityInStatus =
      opportunitiesByStatus[destinationStatus]?.[destinationIndex - 1];
    const nextOpportunityInStatus =
      opportunitiesByStatus[destinationStatus]?.[destinationIndex];
    const prevOpportunity =
      prevOpportunityInStatus ??
      opportunitiesOrdered[
        opportunitiesOrdered.findIndex(
          (o) => o.id === nextOpportunityInStatus.id
        ) - 1
      ];
    const prevOpportunityIndex = opportunitiesOrdered.findIndex(
      (o) => o.id === prevOpportunity?.id
    );
    const nextOpportunity = opportunitiesOrdered[prevOpportunityIndex + 1];

    const prevOrderingKey =
      prevOpportunity?.orderingKey ?? opportunitiesOrdered[0].orderingKey - 1;

    const nextOrderingKey =
      nextOpportunity?.orderingKey ??
      opportunitiesOrdered[opportunitiesOrdered.length - 1].orderingKey + 1;
    const newOrderingKey = (prevOrderingKey + nextOrderingKey) / 2;

    console.log({
      opportunity,
      destinationStatus,
      prevOpportunity,
      prevOpportunityInStatus,
      nextOpportunity,
      nextOpportunityInStatus,
      prevOrderingKey,
      nextOrderingKey,
      newOrderingKey,
    });

    // Move the opportunity to its new spot in the in-memory state
    opportunitiesByStatus[sourceStatus] = opportunitiesByStatus[
      sourceStatus
    ].toSpliced(sourceIndex, 1);
    opportunitiesByStatus[destinationStatus] = opportunitiesByStatus[
      destinationStatus
    ].toSpliced(destinationIndex, 0, opportunity);

    // Set the new ordering key and reorder the opportunities
    const newOpportunitiesOrdered = [
      ...opportunitiesOrdered.filter((o) => o.id !== opportunityId),
      { ...opportunity, orderingKey: newOrderingKey },
    ].sort((a, b) => a.orderingKey - b.orderingKey);

    setData({
      ...data,
      opportunityData: {
        ...data.opportunityData,
        opportunitiesOrdered: newOpportunitiesOrdered,
        opportunitiesByStatus,
      },
    });
  }

  return (
    <NextUIProvider>
      <menu className="flex items-center bg-white">
        <Image src="/logo.webp" alt="logo" width={40} height={40} />
        <h1 className="text-2xl font-bold italic px-2">jobfunnel</h1>
        <div className="grow px-2 text-right">
          {user ? (
            <span>
              Hi, {user.name} (<a href="/api/auth/logout">Logout</a>)
            </span>
          ) : (
            <a href="/api/auth/login">Login</a>
          )}
        </div>
      </menu>

      {data && user && (
        <main className="flex w-screen h-[calc(100vh-40px)] p-2 space-x-2">
          <Tasks tasks={data.tasksDatabase?.databaseItems} />
          <Opportunities
            opportunitiesByStatus={data.opportunityData.opportunitiesByStatus}
            opportunitiesOrdered={data.opportunityData.opportunitiesOrdered}
            eventsByOpportunityId={data.eventsData.eventsByOpportunityId}
            tasksDatabaseId={data.tasksDatabase.databaseId}
            eventsDatabaseId={data.eventsData.eventsDatabaseId}
            moveCard={moveCard}
          />
        </main>
      )}
    </NextUIProvider>
  );
}
