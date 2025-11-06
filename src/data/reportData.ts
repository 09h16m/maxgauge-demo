export interface ReportData {
  id: string;
  server: string;
  time: string;
  metric: string;
  badge?: string | null;
}

export const mockReports: ReportData[] = [
  { id: "DB-SERVER-01", server: "DB-SERVER-01", time: "2025-11-06 12:39", metric: "SQL Elapsed Time", badge: "+3" },
  { id: "PRODRAC1P", server: "PRODRAC1P", time: "2025-11-05 10:15", metric: "Active Session", badge: "+2" },
  { id: "PRODRAC2P", server: "PRODRAC2P", time: "2025-11-04 14:22", metric: "Buffer Busy Wait" },
  { id: "APP-SERVER-01", server: "APP-SERVER-01", time: "2025-11-04 08:30", metric: "CPU Usage" },
  { id: "DB-SERVER-03", server: "DB-SERVER-03", time: "2025-11-03 17:18", metric: "Log File Sync", badge: "+1" },
  { id: "WEB-SERVER-02", server: "WEB-SERVER-02", time: "2025-11-02 11:05", metric: "Response Time" },
  { id: "PRODRAC3P", server: "PRODRAC3P", time: "2025-11-01 19:42", metric: "SQL Elapsed Time", badge: "+1" },
  { id: "APP-SERVER-04", server: "APP-SERVER-04", time: "2025-11-01 07:58", metric: "Active Session" },
  { id: "DB-SERVER-04", server: "DB-SERVER-04", time: "2025-10-31 15:27", metric: "Total Wait Time" },
  { id: "PRODRAC4P", server: "PRODRAC4P", time: "2025-10-29 09:51", metric: "DB CPU" },
  { id: "PRODRAC5P", server: "PRODRAC5P", time: "2025-10-27 13:06", metric: "Active Session" },
  { id: "APP-SERVER-02", server: "APP-SERVER-02", time: "2025-10-26 16:40", metric: "CPU Usage" },
  { id: "DB-SERVER-02", server: "DB-SERVER-02", time: "2025-10-24 18:21", metric: "Total Wait Time", badge: "+1" },
  { id: "WEB-SERVER-01", server: "WEB-SERVER-01", time: "2025-10-23 10:33", metric: "Error Rate" },
  { id: "APP-SERVER-05", server: "APP-SERVER-05", time: "2025-10-21 07:44", metric: "Memory Usage" },
  { id: "PRODRAC6P", server: "PRODRAC6P", time: "2025-10-19 22:17", metric: "Buffer Busy Wait" },
  { id: "DB-SERVER-05", server: "DB-SERVER-05", time: "2025-10-17 06:59", metric: "SQL Parse Time" },
  { id: "APP-SERVER-06", server: "APP-SERVER-06", time: "2025-10-15 12:05", metric: "Active Session" },
  { id: "PRODRAC7P", server: "PRODRAC7P", time: "2025-10-12 21:36", metric: "DB CPU" },
  { id: "ANALYTICS-01", server: "ANALYTICS-01", time: "2025-10-08 09:12", metric: "Query Throughput" },
];

