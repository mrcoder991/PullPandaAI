import { Context } from "probot";
import { PRDetails, ReviewComment } from "../types/index.js";

export const postReviewComments = async (
  context: Context<"pull_request">,
  prDetails: PRDetails,
  reviewBody: string,
  reviewComments: ReviewComment[]
) => {
  await context.octokit.pulls.createReview({
    owner: prDetails.owner,
    repo: prDetails.repo,
    pull_number: prDetails.pull_number,
    body: reviewBody,
    event: "COMMENT",
    commit_id: context.payload.pull_request.head.sha,
    comments: reviewComments,
  });
};
