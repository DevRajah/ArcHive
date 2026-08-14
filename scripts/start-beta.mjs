import {
  spawn,
} from "node:child_process";

/**
 * ArcHive closed-beta process launcher.
 *
 * Future me:
 * This exists only because the free Render plan gives us one web process.
 *
 * ArcHive still has two applications:
 *
 *   apps/api
 *   apps/worker
 *
 * We start both as independent child processes rather than importing worker
 * source code into the API and breaking the monorepo application boundary.
 */

const processes = [];

/**
 * Start one npm workspace command and inherit stdout/stderr so Render logs
 * continue showing output from both the API and worker.
 */
const startProcess = (
  name,
  workspace,
) => {
  console.log(
    `[beta] Starting ${name}...`,
  );

  const child =
    spawn(
      "npm",
      [
        "run",
        "start",
        "-w",
        workspace,
      ],
      {
        stdio:
          "inherit",

        shell:
          process.platform ===
          "win32",
      },
    );

  child.on(
    "exit",
    (
      code,
      signal,
    ) => {
      console.error(
        `[beta] ${name} exited. code=${code} signal=${signal}`,
      );

      /**
       * If either critical process dies, stop the whole container.
       *
       * Render can then restart the service rather than leaving us with:
       *
       * API alive + worker dead
       *
       * or:
       *
       * worker alive + API dead
       */
      shutdown(
        code ?? 1,
      );
    },
  );

  processes.push(
    child,
  );

  return child;
};

/**
 * Gracefully shut both child processes down when Render stops/restarts the
 * container.
 */
let shuttingDown =
  false;

const shutdown = (
  exitCode = 0,
) => {
  if (shuttingDown) {
    return;
  }

  shuttingDown =
    true;

  console.log(
    "[beta] Shutting down ArcHive processes...",
  );

  for (
    const child of processes
  ) {
    if (
      !child.killed
    ) {
      child.kill(
        "SIGTERM",
      );
    }
  }

  /**
   * Give the child processes a little time to exit before terminating the
   * launcher itself.
   */
  setTimeout(
    () => {
      process.exit(
        exitCode,
      );
    },
    3000,
  ).unref();
};

process.on(
  "SIGTERM",
  () =>
    shutdown(0),
);

process.on(
  "SIGINT",
  () =>
    shutdown(0),
);

startProcess(
  "ArcHive API",
  "apps/api",
);

startProcess(
  "ArcHive Worker",
  "apps/worker",
);

console.log(
  "[beta] ArcHive API + Worker launcher started.",
);