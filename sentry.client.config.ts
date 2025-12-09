import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://0619c7c9960c214c0844dc68724477d8@04510502685179904.ingest.us.sentry.io/4510503026819072",
  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
  integrations: [Sentry.browserTracingIntegration()],
  // Define trace propagation targets to resolve potential Browser CORS issues
  tracePropagationTargets: [
    "localhost",
    /^https:\/\/api\./,
    // Add your API server URL here, for example:
    // /^https:\/\/yourserver\.io\/api/
  ],
});

