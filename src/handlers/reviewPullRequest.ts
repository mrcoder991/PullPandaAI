import parseDiff from "parse-diff";
import getPRDiff from "../utils/getPrDiff.js";
import { CommandFlag, PRDetails, ReviewComment } from "../types/index.js";
import { createChat } from "../utils/createChat.js";
import { analyzeCode, getReviewBody } from "../utils/analyzeCode.js";
import {
  postComment,
  postReviewComments,
} from "../utils/postReviewComments.js";
import { Logger } from "probot";
import { Octokit } from "@octokit/rest";
import { getJiraId, prepareJiraDetails } from "../utils/jiraUtils.js";
import { codeReviewerAiId } from "../utils/config.js";
import { getResponseForPrompt } from "../utils/getResponseForPrompt.js";
import { createContextPrompt } from "../utils/commonUtils.js";

export const reviewPullRequest = async ({
  prDetails,
  flag,
  octokit,
  logger,
}: {
  prDetails: PRDetails;
  flag: CommandFlag;
  octokit: Octokit;
  logger: Logger;
}) => {
  if (flag === CommandFlag.ReviewSkipped) {
    postComment({
      octokit,
      prDetails,
      comment:
        "Hey! 🐼 I see you've chosen to skip the review. I'll step aside for this PR. Happy coding! 🚀",
    });
    return;
  }
  const diff: string = await getPRDiff({
    owner: prDetails.owner,
    repo: prDetails.repo,
    pull_number: prDetails.pull_number,
    octokit,
    logger,
  });
  const parsedDiff = parseDiff(diff);

  let reviewComments: ReviewComment[] = [];
  let reviewBody: string =
    "Great job on this pull request! The code looks solid, but make sure to cover all edge cases and potential bugs 🕵️‍♂️. One thing though—please ensure unit tests are included; there's no skipping this part! 🧪 It's essential for maintaining code quality. Keep up the awesome work! 🚀";

  if (diff) {
    try {
      let jiraDetails = "";
      const jiraId = getJiraId(prDetails);
      if (jiraId && jiraId.length > 0) {
        jiraDetails = await prepareJiraDetails({ jiraId: jiraId[0], logger });
      }
      const chatId = await createChat({ aiId: codeReviewerAiId, logger });
      logger.info(`Using chatId: ${chatId} For - ${prDetails.html_url}`);
      // Sending Jira and PR details to chat for context
      await getResponseForPrompt({
        prompt: createContextPrompt({ jiraDetails, prDetails }),
        chatId,
        logger,
      });

      reviewComments = await analyzeCode({
        parsedDiff,
        chatId,
        logger: logger,
      });
      reviewBody = await getReviewBody(chatId, logger, flag);
    } catch (error) {
      logger.error(error, "Error while analyzing code:");
    }

    try {
      switch (flag) {
        case CommandFlag.FullReviewEnabled:
          await postReviewComments({
            octokit,
            prDetails,
            reviewBody,
            reviewComments,
          });
          break;
        case CommandFlag.SoftReviewEnabled:
          await postReviewComments({
            octokit,
            prDetails,
            reviewBody,
            reviewComments: [],
          });
          break;
        default:
          break;
      }
    } catch (error) {
      logger.error(error, "Error While Posting Review comments:");
      await postReviewComments({
        octokit,
        prDetails,
        reviewBody,
        reviewComments: [],
      });
    }
  }
};
