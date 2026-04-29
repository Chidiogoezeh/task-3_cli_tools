import crypto from "crypto";
import open from "open";
import ora from "ora";
import chalk from "chalk";
import { startCallbackServer } from "../utils/auth-server.js";
import { saveCredentials, clearCredentials, getCredentials } from "../utils/storage.js";
import api from "../utils/api.js";

export const login = async () => {
  const spinner = ora("Initializing GitHub OAuth with PKCE...").start();
  
  const code_verifier = crypto.randomBytes(32).toString("hex");
  const code_challenge = crypto.createHash("sha256").update(code_verifier).digest("base64url");
  const state = crypto.randomBytes(16).toString("hex");

  // CRITICAL: We must "prime" the backend with the challenge so it can verify it later
  try {
    await api.post("/auth/pkce-init", { state, code_challenge });
  } catch (err) {
    spinner.fail(chalk.red("Failed to initialize PKCE session with backend."));
    return;
  }

  // Point to your deployed backend URL
  const authUrl = `${process.env.BACKEND_URL}/auth/github?state=${state}`;

  try {
    await open(authUrl);
    // TRD Requirement: Use port 4856
    const callbackData = await startCallbackServer(4856); 
    
    spinner.text = "Exchanging code for tokens...";
    const res = await api.get("/auth/github/callback", {
      params: { 
        code: callbackData.code, 
        state: callbackData.state, 
        code_verifier 
      }
    });

    saveCredentials(res.data); 
    const userRes = await api.get("/auth/whoami");
    const credentialsWithUser = { ...res.data, user: userRes.data.user };
    saveCredentials(credentialsWithUser);

    spinner.succeed(chalk.green(`Logged in successfully as @${userRes.data.user.username}`));
  } catch (err) {
    spinner.fail(chalk.red(`Login failed: ${err.message}`));
  }
};

export const logout = () => {
  clearCredentials();
  console.log(chalk.yellow("Logged out and credentials cleared."));
};

export const whoami = () => {
  const creds = getCredentials();
  if (creds?.user) {
    console.log(chalk.cyan(`Current User: @${creds.user.username} [${creds.user.role}]`));
  } else {
    console.log(chalk.red("Not logged in."));
  }
};