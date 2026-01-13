"use client";

import { useEffect } from "react";
import { migrateInterruptions } from "../lib/migration";

/**
 * This is a global provider that handles application-wide logic,
 * such as running one-time data migrations on startup.
 */
export default function AppProvider({
  children
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Run any one-time startup scripts here.
    migrateInterruptions();
  }, []); // The empty dependency array ensures this runs only once on mount.

  return <>{children}</>;
}
