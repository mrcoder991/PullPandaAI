import { defaultPullPandaConfig, PULLPANDA_CONFIG_FILE } from "../constants.js";
import { PullPandaConfig } from "../types/index.js";

export const loadConfig = async (context: any): Promise<PullPandaConfig> => {
  const config = await context.config(
    PULLPANDA_CONFIG_FILE,
    defaultPullPandaConfig
  );

  if (config?.enabled === false) {
    context.log.info("PullPanda is disabled for this repository");
    return config;
  }

  return config;
};
