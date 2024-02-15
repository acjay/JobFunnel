import {
  Client,
  collectPaginatedAPI,
  isFullDatabase,
  isFullPage,
} from "@notionhq/client";
import {
  BlockObjectResponse,
  PageObjectResponse,
  PartialBlockObjectResponse,
} from "@notionhq/client/build/src/api-endpoints";
import { ROOT_PAGE_ID, NOTION_TOKEN } from "./env";
import {
  asCreatedTimeProperty,
  asDateProperty,
  asNumberProperty,
  asRelationProperty,
  asRichTextProperty,
  asSelectProperty,
  asStatusProperty,
  asTitleProperty,
  isChildDatabase,
  logged,
  richTextToString,
} from "./helpers";
import { notion } from "./notion";
import { Opportunity, OpportunityEvent } from "./lib/models";
import { MainPanel } from "./components/mainPanel";

const MAIN_DATABASE_TITLE = "Job Tracker Main Database";
const TASKS_DATABASE_TITLE = "Job Tracker Tasks";
const EVENTS_DATABASE_TITLE = "Job Tracker Events";

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
      rawData: item,
    };
  } catch (e) {
    console.error(e);
    console.dir(item, { depth: null });
    throw e;
  }
}

type Task = {
  id: string;
  name: string;
  status: string;
  prioritizeBy: Date | null;
  rawData: PageObjectResponse;
};

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

async function getTrackerDatabase(
  rootPageBlocks: (BlockObjectResponse | PartialBlockObjectResponse)[],
  databaseTitle: string
) {
  // console.log(`Fetching ${databaseTitle}...`);
  const databaseId = rootPageBlocks.find(
    (block) =>
      isChildDatabase(block) && block?.child_database?.title === databaseTitle
  )?.id;
  if (!databaseId) {
    throw new Error(`Could not find database with title "${databaseTitle}"`);
  }
  // console.log({ databaseId });

  const databaseItems = (
    await collectPaginatedAPI(notion.databases.query, {
      database_id: databaseId,
    })
  ).filter(isFullPage);
  // console.dir(databaseItems, { depth: null });
  return {
    databaseTitle,
    databaseId,
    databaseItems,
  };
}

export type FetchedNotionData = {
  opportunityData: {
    opportunityDatabaseName: string;
    opportunityDatabaseId: string;
    opportunityDatabaseItems: PageObjectResponse[];
    opportunities: Opportunity[];
    opportunitiesByStatus: Record<string, Opportunity[]>;
  };
  tasksDatabase: {
    databaseTitle: string;
    databaseId: string;
    databaseItems: PageObjectResponse[];
  };
  eventsData: {
    eventsDatabaseName: string;
    eventsDatabaseId: string;
    eventsDatabaseItems: PageObjectResponse[];
    events: OpportunityEvent[];
    eventsByOpportunityId: Record<string, OpportunityEvent[]>;
  };
};
async function getData(): Promise<FetchedNotionData> {
  const response = await notion.pages.retrieve({ page_id: ROOT_PAGE_ID });
  if (isFullPage(response)) {
    // console.dir(response, { depth: null });

    // Get all of the child blocks in the page
    const blocksResponse = await collectPaginatedAPI(
      notion.blocks.children.list,
      {
        block_id: ROOT_PAGE_ID,
      }
    );
    // console.dir(blocksResponse, { depth: null });

    // Pull out the 3 core databases
    const mainDatabase = await getTrackerDatabase(
      blocksResponse,
      MAIN_DATABASE_TITLE
    );
    const opportunities = mainDatabase.databaseItems.map(
      databaseItemToOpporunity
    );
    const opportunityData = {
      opportunityDatabaseName: mainDatabase.databaseTitle,
      opportunityDatabaseId: mainDatabase.databaseId,
      opportunityDatabaseItems: mainDatabase.databaseItems,
      opportunities,
      opportunitiesByStatus: opportunities.reduce<
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
    const tasksDatabase = await getTrackerDatabase(
      blocksResponse,
      TASKS_DATABASE_TITLE
    );
    const tasksData = {
      tasksDatabaseName: tasksDatabase.databaseTitle,
      tasksDatabaseId: tasksDatabase.databaseId,
      tasksDatabaseItems: tasksDatabase.databaseItems,
      activeTasks: tasksDatabase.databaseItems.map(databaseItemToTask),
    };

    const eventsDatabase = await getTrackerDatabase(
      blocksResponse,
      EVENTS_DATABASE_TITLE
    );
    const events = eventsDatabase.databaseItems.map(databaseItemToEvent);
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
    const eventsData = {
      eventsDatabaseName: eventsDatabase.databaseTitle,
      eventsDatabaseId: eventsDatabase.databaseId,
      eventsDatabaseItems: eventsDatabase.databaseItems,
      events,
      eventsByOpportunityId,
    };

    return {
      opportunityData,
      tasksDatabase,
      eventsData,
    };
  }

  throw new Error("Could not retrieve data from Notion");
}

export default async function Home() {
  const data = await getData();
  return <MainPanel data={data} />;
}
