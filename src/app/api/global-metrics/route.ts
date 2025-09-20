import { NextResponse } from "next/server";
import { startGlobalMetricsJob } from "@/jobs/globalMetricsJob";
import db from '@/lib/db'

// Start the job once per server instance
startGlobalMetricsJob();

// Helper: format relative time
function format_time_ago(dateStr?: string) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export async function GET() {
  const row = db.prepare(`SELECT * FROM global_metrics ORDER BY id DESC LIMIT 1`).get();
  if (!row) return NextResponse.json({ error: "No global metrics available" }, { status: 404 });

  // Add formatted "time ago" field
  const formattedRow = {
    ...row,
    last_updated_formatted: format_time_ago(row.last_updated)
  };

  return NextResponse.json({ metrics: formattedRow });
}
