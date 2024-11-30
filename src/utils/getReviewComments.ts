import { PRDetails } from "../types/index.js";
import { Octokit } from "@octokit/rest";

export const getReviewComments = async ({
  octokit,
  prDetails,
}: {
  octokit: Octokit;
  prDetails: PRDetails;
}) => {
  const response = await octokit.rest.pulls.listReviewComments({
    owner: prDetails.owner,
    repo: prDetails.repo,
    pull_number: prDetails.pull_number,
  });
  return response.data;
};
