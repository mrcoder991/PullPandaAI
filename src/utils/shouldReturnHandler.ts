import { Context } from "probot";
import { postComment } from "./postReviewComments.js";
import { PRDetails } from "../types/index.js";

export const shouldReturn = ({
  context,
  readyForReview,
  prDetails,
  repoDetails,
}: {
  context: Context<"pull_request">;
  readyForReview: boolean;
  prDetails: PRDetails;
  repoDetails: any;
}): boolean => {
  if (readyForReview) {
    postComment(context, prDetails, "🐼 Continuing With the review");
    return false;
  }

  // Skip review if PR is Draft
  if (context.payload.pull_request.draft) {
    context.log.info("PR is Draft. Skipping review.");
    postComment(
      context,
      prDetails,
      "🐼 Reviews for draft PRs and PRs not against default branch are skipped."
    );
    return true;
  }

  // Skip review if PR is not against default branch
  if (
    context.payload.pull_request.base.ref !== repoDetails.data.default_branch
  ) {
    context.log.info(
      "PR is not against default branch. Skipping review."
    );
    postComment(
      context,
      prDetails,
      "🐼 Reviews for draft PRs and PRs not against default branch are skipped."
    );
    return true;
  }
  return false;
};
