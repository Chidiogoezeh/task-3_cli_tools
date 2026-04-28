import Table from "cli-table3";
import chalk from "chalk";

export const renderTable = (data) => {
  if (!data || data.length === 0) {
    console.log(chalk.yellow("No records found."));
    return;
  }

  const table = new Table({
    head: [
      chalk.cyan("ID"), 
      chalk.cyan("Name"), 
      chalk.cyan("Gender"), 
      chalk.cyan("Age"), 
      chalk.cyan("Country")
    ],
    colWidths: [15, 20, 10, 8, 10]
  });

  data.forEach(p => {
    table.push([
      p.id.split("-")[0] + "...", // Shorten UUID
      p.name,
      p.gender || "N/A",
      p.age || "N/A",
      p.country_id || "N/A"
    ]);
  });

  console.log(table.toString());
};