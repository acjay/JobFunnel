import { Client, collectPaginatedAPI, isFullPage } from "@notionhq/client";
import { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import {
  asCreatedTimeProperty,
  asDateProperty,
  asNumberProperty,
  asRelationProperty,
  asRichTextProperty,
  asSelectProperty,
  asStatusProperty,
  asTitleProperty,
  richTextToString,
} from "./helpers";
import { Opportunity, OpportunityEvent, Task } from "./lib/models";

function databaseItemToOpporunity(item: PageObjectResponse): Opportunity {
  // console.dir(item, { depth: null });
  // console.log("Line 29", item.properties.Connection);
  // console.log("Line 30", asRichTextProperty(item.properties.Connection));
  // console.log(
  //   "Line 31",
  //   richTextToString(asRichTextProperty(item.properties.Connection).rich_text)
  // );
  const name =
    richTextToString(asTitleProperty(item.properties.Name).title) ?? "";
  const title = richTextToString(
    asRichTextProperty(item.properties.Title).rich_text
  );
  const status =
    asStatusProperty(item.properties.Status).status?.name ?? "Not started";
  const type = asSelectProperty(item.properties.Type).select?.name ?? null;
  const connection = richTextToString(
    asRichTextProperty(item.properties.Connection).rich_text
  );
  const listedRangeTop = asNumberProperty(
    item.properties["Listed range top"]
  )?.number;
  const listedRangeBottom = asNumberProperty(
    item.properties["Listed range bottom"]
  )?.number;
  const logoDomain = richTextToString(
    asRichTextProperty(item.properties["Logo domain"]).rich_text
  );
  const orderingKey =
    asNumberProperty(item.properties["Ordering key"])?.number ?? 0;
  try {
    return {
      id: item.id,
      name,
      title,
      status,
      type,
      connection,
      listedRangeTop,
      listedRangeBottom,
      logoDomain,
      orderingKey,
      rawData: item,
    };
  } catch (e) {
    console.error(e);
    console.dir(item, { depth: null });
    throw e;
  }
}

function databaseItemToTask(item: PageObjectResponse): Task {
  const name = richTextToString(asTitleProperty(item.properties.Name).title);
  const status = asStatusProperty(item.properties.Status).status?.name;
  const prioritizeBy = new Date(
    asDateProperty(item.properties["Prioritize by"])?.date?.start
  );
  return {
    id: item.id,
    name: name ?? "",
    status: status ?? "Not started",
    prioritizeBy,
    rawData: item,
  };
}

function databaseItemToEvent(item: PageObjectResponse): OpportunityEvent {
  const description = richTextToString(
    asTitleProperty(item.properties.Name).title
  );
  const opportunityId = asRelationProperty(item.properties["Company Name"])
    .relation?.[0]?.id;
  const timestamp = new Date(
    asDateProperty(item.properties["Event Time"]).date?.start ??
      asCreatedTimeProperty(item.properties["Created time"]).created_time
  );
  return {
    id: item.id,
    description: description ?? "",
    opportunityId,
    timestamp,
    rawData: item,
  };
}

async function getDatabaseItems(
  notion: Client,
  databaseId: string,
  databaseType: string
) {
  console.time(`getTrackerDatabase: ${databaseType} (${databaseId})`);
  // console.log(`Fetching ${databaseTitle}...`);
  // const databaseId = rootPageBlocks.find(
  //   (block) =>
  //     isChildDatabase(block) && block?.child_database?.title === databaseTitle
  // )?.id;
  // if (!databaseId) {
  //   throw new Error(`Could not find database with title "${databaseTitle}"`);
  // }
  // console.log({ databaseId });

  const databaseItems = (
    await collectPaginatedAPI(notion.databases.query, {
      database_id: databaseId,
    })
  ).filter(isFullPage);
  // console.dir(databaseItems, { depth: null });

  console.timeEnd(`getTrackerDatabase: ${databaseType} (${databaseId})`);

  return databaseItems;
}

export type FetchedNotionData = {
  opportunityData: {
    databaseId: string;
    databaseItems: PageObjectResponse[];
    opportunitiesOrdered: Opportunity[];
    opportunitiesByStatus: Record<string, Opportunity[]>;
  };
  taskData: {
    databaseId: string;
    databaseItems: PageObjectResponse[];
  };
  eventData: {
    databaseId: string;
    databaseItems: PageObjectResponse[];
    events: OpportunityEvent[];
    eventsByOpportunityId: Record<string, OpportunityEvent[]>;
  };
};
export async function getData(
  notion: Client,
  opportunityDatabaseId: string,
  taskDatabaseId: string,
  eventDatabaseId: string
): Promise<FetchedNotionData> {
  console.time("getData");

  const opportunityDatabasePromise = getDatabaseItems(
    notion,
    opportunityDatabaseId,
    "opportunity"
  );
  const tasksDatabasePromise = getDatabaseItems(notion, taskDatabaseId, "task");
  const eventsDatabasePromise = getDatabaseItems(
    notion,
    eventDatabaseId,
    "event"
  );
  const [opportunityItems, taskItems, eventItems] = await Promise.all([
    opportunityDatabasePromise,
    tasksDatabasePromise,
    eventsDatabasePromise,
  ]);

  const opportunitiesOrdered = opportunityItems.map(databaseItemToOpporunity);
  opportunitiesOrdered.sort((a, b) => a.orderingKey - b.orderingKey);
  const opportunityData = {
    databaseId: opportunityDatabaseId,
    databaseItems: opportunityItems,
    opportunitiesOrdered,
    opportunitiesByStatus: opportunitiesOrdered.reduce<
      Record<string, Opportunity[]>
    >((acc, item) => {
      const status = item.status;
      if (!acc[status]) {
        acc[status] = [];
      }
      acc[status].push(item);
      return acc;
    }, {}),
  };

  const taskData = {
    databaseId: taskDatabaseId,
    databaseItems: taskItems,
  };

  const events = eventItems.map(databaseItemToEvent);
  const eventsByOpportunityId = events.reduce<
    Record<string, OpportunityEvent[]>
  >((acc, item) => {
    const opportunityId = item.opportunityId ?? "";
    if (!acc[opportunityId]) {
      acc[opportunityId] = [];
    }
    acc[opportunityId].push(item);
    return acc;
  }, {});
  for (const opportunityId of Object.keys(eventsByOpportunityId)) {
    const events = eventsByOpportunityId[opportunityId];
    events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }
  const eventData = {
    databaseId: eventDatabaseId,
    databaseItems: eventItems,
    events,
    eventsByOpportunityId,
  };

  console.timeEnd("getData");

  return {
    opportunityData,
    taskData,
    eventData,
  };
}
