import { Logger } from "probot";
import { jiraBaseUrl, jsonToMarkdownAiId } from "./config.js";
import { createChat } from "./createChat.js";
import { getResponseForPrompt } from "./getResponseForPrompt.js";
import axios from "axios";
import { PRDetails } from "../types/index.js";

export const getJiraId = (prDetails: PRDetails) => {
  return (
    prDetails.description.match(/(?<=browse\/)[A-Z]+-\d+/g) ||
    prDetails.description.match(/[A-Z]+-\d+/g) ||
    prDetails.title.match(/[A-Z]+-\d+/g)
  );
};

export const prepareJiraDetails = async ({
  jiraId,
  logger,
}: {
  jiraId: string;
  logger: Logger;
}) => {
  let jiraDetailsText = "";
  const jiraDetailsJson = await getJiraDetails({ jiraId, logger });
  jiraDetailsText = await getJiraDetailsText({ jiraDetailsJson, logger });
  return jiraDetailsText;
};

const getJiraDetailsText = async ({
  jiraDetailsJson,
  logger,
}: {
  jiraDetailsJson: any;
  logger: Logger;
}) => {
  try {
    if (!jiraDetailsJson) {
      return "";
    }
    const chatId = await createChat({ aiId: jsonToMarkdownAiId, logger });
    const markdownText = await getResponseForPrompt({
      prompt: JSON.stringify(jiraDetailsJson),
      logger,
      chatId,
    });
    return markdownText;
  } catch (error) {
    logger.error(error, "Error while converting Jira details into text: ");
    return "";
  }
};

const getJiraDetails = async ({
  logger,
  jiraId,
}: {
  logger: Logger;
  jiraId: string;
}) => {
  try {
    const response = await axios.get(
      `${jiraBaseUrl}/issue/${jiraId}?fields=key,summary,description,status,creator,assignee,created,comment`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${process.env.JIRA_AUTH_TOKEN}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    logger.error(error, "Error while fetching Jira details: ");
  }
};
