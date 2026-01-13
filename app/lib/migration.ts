import type { InterruptionLog, SessionEntry } from "./models";

const MIGRATION_KEY = "lf_interruptions_migrated_v2";

/**
 * A one-time migration script to associate old interruptions with sessions.
 * Pre-v2 interruptions were missing a `sessionId`. This script attempts to
 * backfill it by matching the interruption's creation time and task ID
 * with existing session data.
 */
export function migrateInterruptions() {
  try {
    const migrationStatus = window.localStorage.getItem(MIGRATION_KEY);
    if (migrationStatus === "true") {
      return; // Migration already completed
    }

    const interruptionsStr = window.localStorage.getItem("lf_interruptions");
    const sessionsStr = window.localStorage.getItem("lf_sessions");

    if (!interruptionsStr || !sessionsStr) {
      // Nothing to migrate
      window.localStorage.setItem(MIGRATION_KEY, "true");
      return;
    }

    const interruptions: InterruptionLog[] = JSON.parse(interruptionsStr);
    const sessions: SessionEntry[] = JSON.parse(sessionsStr);
    let updated = false;

    for (const interruption of interruptions) {
      if (interruption.sessionId) {
        continue; // Already has a session ID, skip.
      }

      const interruptionTime = new Date(interruption.createdAt).getTime();

      // Find a session that contains this interruption
      const matchingSession = sessions.find((session) => {
        if (session.taskId !== interruption.taskId) {
          return false;
        }
        const sessionStart = new Date(session.startedAt).getTime();
        const sessionEnd = new Date(session.endedAt).getTime();
        return (
          interruptionTime >= sessionStart && interruptionTime <= sessionEnd
        );
      });

      if (matchingSession) {
        interruption.sessionId = matchingSession.id;
        updated = true;
      }
    }

    if (updated) {
      window.localStorage.setItem(
        "lf_interruptions",
        JSON.stringify(interruptions)
      );
    }

    window.localStorage.setItem(MIGRATION_KEY, "true");
    console.log("Interruption migration completed.");
  } catch (error) {
    console.error("Error during interruption data migration:", error);
    // Still set the key to avoid re-running a failed migration
    window.localStorage.setItem(MIGRATION_KEY, "true");
  }
}
