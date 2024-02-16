import { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";

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
