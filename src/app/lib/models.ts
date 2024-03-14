import {
  OauthTokenResponse,
  PageObjectResponse,
} from "@notionhq/client/build/src/api-endpoints";

/**
 * The data about the user's authorized Notion integration, so that the app can
 * access the Notion database that serves as the source of truth.
 */
export type Auth0AppMetadata = {
  notionIntegration: OauthTokenResponse;
  rootPageId: string | null;
  opportunityDatabaseId: string | null;
  taskDatabaseId: string | null;
  eventDatabaseId: string | null;
  emailDatabaseId: string | null;
};

export const DEFAULT_ROOT_PAGE_TITLE = "Jobfunnel Tracker";
export const DEFAULT_OPPORTUNITY_DATABASE_TITLE = "Jobfunnel Opportunities";
export const DEFAULT_TASK_DATABASE_TITLE = "Jobfunnel Tasks";
export const DEFAULT_EVENT_DATABASE_TITLE = "Job Tracker Events";
export const DEFAULT_EMAIL_DATABASE_TITLE = "Jobfunnel Emails";

export type Opportunity = {
  id: string;
  name: string;
  title: string | null;
  status: string;
  type: string | null;
  connection: string | null;
  listedRangeTop: number | null;
  listedRangeBottom: number | null;
  logoDomain: string | null;
  orderingKey: number;
  rawData: PageObjectResponse;
};

export type OpportunityEvent = {
  id: string;
  description: string;
  opportunityId: string | null;
  timestamp: Date;
  rawData: PageObjectResponse;
};

export type Task = {
  id: string;
  name: string;
  status: string;
  prioritizeBy: Date | null;
  rawData: PageObjectResponse;
};
