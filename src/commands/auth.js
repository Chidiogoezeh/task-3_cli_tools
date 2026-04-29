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

  try {
    await api.post("/auth/pkce-init", { state, code_challenge });
    
    // The redirect_uri in GitHub is now ALWAYS the backend
    const authUrl = `${process.env.BACKEND_URL}/auth/github?state=${state}`;
    await open(authUrl);

    // This now resolves with the TOKENS directly
    const tokens = await startCallbackServer(4856); 
    
    spinner.text = "Finalizing session...";
    
    // Save tokens received from the callback server
    saveCredentials({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken
    });

    const userRes = await api.get("/auth/whoami");
    saveCredentials({ ...tokens, user: userRes.data.user });

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