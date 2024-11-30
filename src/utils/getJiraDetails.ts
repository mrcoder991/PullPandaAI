import axios from "axios";
import { jiraBaseUrl } from "./config.js";
import { Logger } from "probot";

export const getJiraDetails = async ({
  logger,
  jiraId,
}: {
  logger: Logger;
  jiraId: string;
}) => {
  try {
    const response = await axios.get(`${jiraBaseUrl}/issue/${jiraId}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${process.env.JIRA_AUTH_TOKEN}`,
      },
    });
    return response.data;
  } catch (error) {
    logger.error(error, "Error while fetching Jira details: ");
  }
};
