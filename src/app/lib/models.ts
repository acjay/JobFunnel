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
    rawData: PageObjectResponse;
  };