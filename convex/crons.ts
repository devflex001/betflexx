import { cronJobs } from "convex/server";

const crons = cronJobs();

// Cron jobs disabled - scraper now runs on-demand via button click

export default crons;
