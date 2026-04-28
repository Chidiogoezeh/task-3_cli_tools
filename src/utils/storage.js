import fs from "fs";
import path from "path";
import os from "os";

const CONFIG_DIR = path.join(os.homedir(), ".insighta");
const CONFIG_FILE = path.join(CONFIG_DIR, "credentials.json");

export const saveCredentials = (data) => {
  if (!fs.existsSync(CONFIG_DIR)) fs.mkdirSync(CONFIG_DIR);
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(data, null, 2));
};

export const getCredentials = () => {
  if (!fs.existsSync(CONFIG_FILE)) return null;
  return JSON.parse(fs.readFileSync(CONFIG_FILE, "utf-8"));
};

export const clearCredentials = () => {
  if (fs.existsSync(CONFIG_FILE)) fs.unlinkSync(CONFIG_FILE);
};