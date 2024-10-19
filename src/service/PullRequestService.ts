import { Context } from "probot";
import { PRDetails, ReviewComment } from "../types/index.js";
import getPRDiff from "../utils/getPrDiff.js";
import parseDiff from "parse-diff";
import { createChat } from "../utils/createChat.js";
import { analyzeCode, getReviewBody } from "../utils/analyzeCode.js";
import { postReviewComments } from "../utils/postReviewComments.js";
import { shouldReturn } from "../utils/shouldReturnHandler.js";

export const reviewCodeAndPostComments = async ({
  context,
  readyForReview = false,
}: {
  context: Context<"pull_request">;
  readyForReview?: boolean;
}) => {
  const { owner, repo, pull_number } = context.pullRequest();
  context.log.info(
    `Received event "${context.payload.action}" for title: "${context.payload.pull_request.title}" - "${context.payload.pull_request.html_url}"`
  );

  const repoDetails = await context.octokit.repos.get({
    owner,
    repo,
  });

  const prDetails: PRDetails = {
    title: context.payload.pull_request.title,
    description: context.payload.pull_request.body || "",
    owner,
    repo,
    pull_number,
    commit_id: context.payload.pull_request.head.sha,
  };

  if (shouldReturn({ context, readyForReview, prDetails, repoDetails })) {
    return;
  }

  const diff: string = await getPRDiff(owner, repo, pull_number, context);
  const parsedDiff = parseDiff(diff);

  let reviewComments: ReviewComment[] = [];
  let reviewBody: string =
    "Great job on this pull request! The code looks solid, but make sure to cover all edge cases and potential bugs 🕵️‍♂️. One thing though—please ensure unit tests are included; there's no skipping this part! 🧪 It's essential for maintaining code quality. Keep up the awesome work! 🚀";

  if (diff) {
    try {
      const chatId = await createChat(context);
      context.log.info(
        `Using chatId: ${chatId} For - ${context.payload.pull_request.html_url}`
      );
      reviewComments = await analyzeCode({
        parsedDiff,
        prDetails,
        chatId,
        context,
      });
      reviewBody = await getReviewBody(chatId, context);
    } catch (error) {
      context.log.error("Error while analyzing code:", JSON.stringify(error));
    }

    try {
      await postReviewComments(context, prDetails, reviewBody, reviewComments);
    } catch (error) {
      context.log.error(
        "Error While Posting Review comments:",
        JSON.stringify(error)
      );
      await postReviewComments(context, prDetails, reviewBody, []);
    }
  }
};
