import { Context } from "probot";
import { PRDetails } from "../types/index.js";

export const getReviewComments = async ({
  context,
  prDetails,
}: {
  context: Context<"pull_request">;
  prDetails: PRDetails;
}) => {
  const response = await context.octokit.rest.pulls.listReviewComments({
    owner: prDetails.owner,
    repo: prDetails.repo,
    pull_number: prDetails.pull_number,
  });
  return response.data;
};
