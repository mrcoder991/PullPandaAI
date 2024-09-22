import { Context } from "probot";
import { PRDetails, ReviewComment } from "../types/index.js";
import getPRDiff from "../utils/getPrDiff.js";
import parseDiff from "parse-diff";
import { createChat } from "../utils/createChat.js";
import { analyzeCode, getReviewBody } from "../utils/analyzeCode.js";

export const reviewCodeAndPostComments = async (
  context: Context<"pull_request">
) => {
  const { owner, repo, pull_number } = context.pullRequest();

  const prDetails: PRDetails = {
    title: context.payload.pull_request.title,
    description: context.payload.pull_request.body || "",
    owner,
    repo,
    pull_number,
    commit_id: context.payload.pull_request.head.sha,
  };

  const diff: string = await getPRDiff(owner, repo, pull_number, context);
  const parsedDiff = parseDiff(diff);

  let reviewComments: ReviewComment[] = [];
  let reviewBody: string =
    "Great job on this pull request! The code looks solid, but make sure to cover all edge cases and potential bugs 🕵️‍♂️. One thing though—please ensure unit tests are included; there's no skipping this part! 🧪 It's essential for maintaining code quality. Keep up the awesome work! 🚀";

  if (diff) {
    try {
      const chatId = await createChat(context);
      reviewComments = await analyzeCode(
        parsedDiff,
        prDetails,
        chatId,
        context
      );
      reviewBody = await getReviewBody(chatId, context);
    } catch (error) {
      context.log.error("Error:", error);
    }

    await context.octokit.pulls.createReview({
      owner,
      repo,
      pull_number,
      body: reviewBody,
      event: "COMMENT",
      commit_id: context.payload.pull_request.head.sha,
      comments: reviewComments,
    });
  }
};
