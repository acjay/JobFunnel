"use client";
import * as React from "react";
import { NextUIProvider } from "@nextui-org/system";
import { Tasks } from "./tasks";
import { Opportunities } from "./opportunities";
import styles from "../page.module.css";

export function MainPanel({ data }) {
  return (
    <NextUIProvider>
      <main className={styles.main}>
        <Tasks tasks={data?.tasksDatabase.databaseItems} />
        <Opportunities
          opportunitiesByStatus={data.opportunityData.opportunitiesByStatus}
        />
      </main>
    </NextUIProvider>
  );
}
