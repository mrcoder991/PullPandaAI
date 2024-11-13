import { Context } from "probot";
import { ReviewComment } from "../types/index.js";
import getPRDiff from "../utils/getPrDiff.js";
import parseDiff from "parse-diff";
import { createChat } from "../utils/createChat.js";
import { analyzeCode, getReviewBody } from "../utils/analyzeCode.js";
import { postReviewComments } from "../utils/postReviewComments.js";
import { shouldReturn } from "../utils/shouldReturnHandler.js";
import { getPullRequestContext } from "../utils/getPullRequestContext.js";

export const reviewCodeAndPostComments = async ({
  context,
  readyForReview = false,
}: {
  context: Context<"pull_request">;
  readyForReview?: boolean;
}) => {
  const { repoDetails, prDetails } = await getPullRequestContext({ context });

  context.log.info(
    `Received event "${context.payload.action}" for title: "${context.payload.pull_request.title}" - ${context.payload.pull_request.html_url}`
  );
  
  if (shouldReturn({ context, readyForReview, prDetails, repoDetails })) {
    return;
  }

  const diff: string = await getPRDiff(prDetails.owner, prDetails.repo, prDetails.pull_number, context);
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
      context.log.error(error, "Error while analyzing code:");
    }

    try {
      await postReviewComments(context, prDetails, reviewBody, reviewComments);
    } catch (error) {
      context.log.error(error, "Error While Posting Review comments:");
      await postReviewComments(context, prDetails, reviewBody, []);
    }
  }
};
