"use server";

import { Opportunity } from "./lib/models";
import { getNotionConnection } from "./notion";

export async function addEvent(
  eventsDatabaseId: string,
  opportunity: Opportunity,
  description: string,
  date: Date
) {
  const notionConnecton = await getNotionConnection();
  if (notionConnecton.integrationState !== "connected") {
    throw new Error("Notion connecton is not fully set up for this user");
  }

  return await notionConnecton.notionClient.pages.create({
    parent: {
      type: "database_id",
      database_id: eventsDatabaseId,
    },
    properties: {
      Name: {
        title: [
          {
            type: "text",
            text: {
              content: description,
            },
          },
        ],
      },
      "Company Name": {
        relation: [{ id: opportunity.id }],
      },
      "Event Time": {
        date: {
          start: date.toISOString().split("T")[0],
        },
      },
    },
  });
}
