#!/usr/bin/env node
import { Command } from "commander";
import * as authCmds from "../src/commands/auth.js";
import * as profileCmds from "../src/commands/profiles.js";

import "dotenv/config";

console.log("DEBUG: Client ID is:", process.env.GITHUB_CLIENT_ID);

const program = new Command();

program
  .name("insighta")
  .description("Insighta Labs+ Intelligence CLI")
  .version("1.0.0");

// Auth Commands
program.command("login").description("Login via GitHub OAuth").action(authCmds.login);
program.command("logout").description("Logout and clear credentials").action(authCmds.logout);
program.command("whoami").description("Show current user session").action(authCmds.whoami);

// Profile Commands
const profiles = program.command("profiles").description("Manage demographic profiles");

profiles.command("list")
  .description("List all profiles with filters")
  .option("-g, --gender <gender>", "Filter by gender")
  .option("-c, --country <id>", "Filter by country ID (ISO)")
  .option("-ag, --age-group <group>", "Filter by age group")
  .option("--min-age <age>", "Minimum age")
  .option("--max-age <age>", "Maximum age")
  .option("--sort-by <field>", "age | created_at | gender_probability")
  .option("--order <order>", "asc | desc")
  .option("--page <number>", "Page number", "1")
  .option("--limit <number>", "Limit per page", "10")
  .action(profileCmds.list);

profiles.command("get <id>").description("Get specific profile by UUID").action(profileCmds.get);
profiles.command("search <query>").description("Natural language search").action(profileCmds.search);
profiles.command("create").requiredOption("-n, --name <name>", "Full name").action(profileCmds.create);
profiles.command("export").option("-f, --format <format>", "Export format (csv)", "csv").action(profileCmds.exportData);

program.parse();