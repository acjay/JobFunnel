import {
  BlockObjectResponse,
  ChildDatabaseBlockObjectResponse,
  PartialBlockObjectResponse,
  RichTextItemResponse,
} from "@notionhq/client/build/src/api-endpoints";
import { TimeZoneRequest } from "./lib/timeZoneRequest";

export function isChildDatabase(
  response: BlockObjectResponse | PartialBlockObjectResponse
): response is ChildDatabaseBlockObjectResponse {
  return (
    response.object === "block" &&
    "type" in response &&
    response.type === "child_database"
  );
}

export function richTextToString(
  richText: { plain_text: string }[],
  defaultValue: string | null = null
) {
  // console.log({richText});
  return richText.length > 0
    ? richText.map((text) => text.plain_text).join("")
    : defaultValue;
}

type SelectColor =
  | "default"
  | "gray"
  | "brown"
  | "orange"
  | "yellow"
  | "green"
  | "blue"
  | "purple"
  | "pink"
  | "red";
export type StatusProperty = {
  type: "status";
  status: {
    id: string;
    name: string;
    color: SelectColor;
  } | null;
  id: string;
};

export function asStatusProperty(property: any): StatusProperty {
  if (property.type === "status") {
    return property;
  }
  throw new Error(`Property is not a status property: ${property}`);
}

export type TitleProperty = {
  type: "title";
  title: Array<RichTextItemResponse>;
  id: string;
};

export function asTitleProperty(property: any): TitleProperty {
  if (property.type === "title") {
    return property;
  }
  throw new Error(
    `Property is not a title property: ${JSON.stringify(property)}`
  );
}

export type RichTextProperty = {
  type: "rich_text";
  rich_text: Array<RichTextItemResponse>;
  id: string;
};

export function asRichTextProperty(property: any): RichTextProperty {
  if (property.type === "rich_text") {
    return property;
  }
  throw new Error(
    `Property is not a rich text property: ${JSON.stringify(property)}`
  );
}

export type RelationProperty = {
  type: "relation";
  relation: Array<{ id: string }>;
  id: string;
};

export function asRelationProperty(property: any): RelationProperty {
  if (property.type === "relation") {
    return property;
  }
  throw new Error(
    `Property is not a relation property: ${JSON.stringify(property)}`
  );
}

export type NumberProperty = {
  type: "number";
  number: number;
  id: string;
};

export function asNumberProperty(property: any): NumberProperty {
  if (property.type === "number") {
    return property;
  }
  throw new Error(
    `Property is not a number property: ${JSON.stringify(property)}`
  );
}

export type SelectProperty = {
  type: "select";
  select: {
    id: string;
    name: string;
    color: SelectColor;
  } | null;
  id: string;
};

export function asSelectProperty(property: any): SelectProperty {
  if (property.type === "select") {
    return property;
  }
  throw new Error(
    `Property is not a select property: ${JSON.stringify(property)}`
  );
}

export type CreatedTimeProperty = {
  type: "created_time";
  created_time: string;
  id: string;
};

export function asCreatedTimeProperty(property: any): CreatedTimeProperty {
  if (property.type === "created_time") {
    return property;
  }
  throw new Error(
    `Property is not a created time property: ${JSON.stringify(property)}`
  );
}

export type DateProperty = {
  type: "date";
  date: {
    start: string;
    end: string | null;
    time_zone: TimeZoneRequest | null;
  };
  id: string;
};

export function asDateProperty(property: any): DateProperty {
  if (property.type === "date") {
    return property;
  }
  throw new Error(
    `Property is not a date property: ${JSON.stringify(property)}`
  );
}

export function logged<T>(value: T, message: string): T {
  console.log(message, value);
  return value;
}
