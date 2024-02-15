"use server";

import { notion } from "./notion";
import { Opportunity } from "./lib/models";

export async function addEvent(
  eventsDatabaseId: string,
  opportunity: Opportunity,
  description: string,
  date: Date
) {
  return await notion.pages.create({
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
