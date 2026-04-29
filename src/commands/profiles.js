import ora from "ora";
import chalk from "chalk";
import fs from "fs";
import api from "../utils/api.js";
import { renderTable } from "../ui/tables.js";

export const list = async (options) => {
  const spinner = ora("Fetching profiles...").start();
  try {
    const res = await api.get("/api/profiles", { params: options });
    spinner.stop();
    renderTable(res.data.data);
    console.log(chalk.gray(`Page: ${res.data.page} | Total: ${res.data.total}`));
  } catch (err) {
    spinner.fail(chalk.red(err.response?.data?.message || "Failed to fetch list"));
  }
};

export const search = async (query) => {
  const spinner = ora(`Searching for: "${query}"...`).start();
  try {
    const res = await api.get("/api/profiles/search", { params: { q: query } });
    spinner.stop();
    renderTable(res.data.data);
  } catch (err) {
    spinner.fail(chalk.red(err.response?.data?.message || "Search failed"));
  }
};

export const create = async (options) => {
  const spinner = ora(`Creating profile for ${options.name}...`).start();
  try {
    const res = await api.post("/api/profiles", { name: options.name });
    spinner.succeed(chalk.green(`Profile created: ${res.data.data.id}`));
  } catch (err) {
    spinner.fail(chalk.red(err.response?.data?.message || "Creation failed"));
  }
};

export const exportData = async (options) => {
  const spinner = ora("Exporting CSV...").start();
  try {
    const res = await api.get("/api/profiles/export", { 
      params: { format: "csv" },
      responseType: "arraybuffer" 
    });
    const filename = `profiles_${Date.now()}.csv`;
    fs.writeFileSync(filename, res.data);
    spinner.succeed(chalk.green(`Exported successfully to: ${filename}`));
  } catch (err) {
    spinner.fail(chalk.red("Export failed"));
  }
};