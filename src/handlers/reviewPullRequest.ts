import parseDiff from "parse-diff";
import getPRDiff from "../utils/getPrDiff.js";
import { CommandFlag, PRDetails, ReviewComment } from "../types/index.js";
import { createChat } from "../utils/createChat.js";
import { analyzeCode, getReviewBody } from "../utils/analyzeCode.js";
import {
  postComment,
  postReviewComments,
} from "../utils/postReviewComments.js";
import { Context } from "probot";

export const reviewPullRequest = async ({
  context,
  prDetails,
  flag,
}: {
  context: Context<"pull_request">;
  prDetails: PRDetails;
  flag: CommandFlag;
}) => {
  if (flag === CommandFlag.ReviewSkipped) {
    postComment(
      context,
      prDetails,
      "Hey! 🐼 I see you've chosen to skip the review by adding the command in the description. I'll step aside for this PR. Happy coding! 🚀"
    );
    return;
  }
  const diff: string = await getPRDiff(
    prDetails.owner,
    prDetails.repo,
    prDetails.pull_number,
    context
  );
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
      reviewBody = await getReviewBody(chatId, context, flag);
    } catch (error) {
      context.log.error(error, "Error while analyzing code:");
    }

    try {
      switch (flag) {
        case CommandFlag.FullReviewEnabled:
          await postReviewComments(
            context,
            prDetails,
            reviewBody,
            reviewComments
          );
          break;
        case CommandFlag.SoftReviewEnabled:
          await postReviewComments(context, prDetails, reviewBody, []);
          break;
        default:
          break;
      }
    } catch (error) {
      context.log.error(error, "Error While Posting Review comments:");
      await postReviewComments(context, prDetails, reviewBody, []);
    }
  }
};
