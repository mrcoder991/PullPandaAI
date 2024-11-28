import { Context } from "probot";
import { PRDetails } from "../types/index.js";

const getPRDiff = async (
  owner: string,
  repo: string,
  pull_number: number,
  context: Context<"pull_request">
): Promise<string> => {
  try {
    const { data } = await context.octokit.pulls.get({
      owner,
      repo,
      pull_number,
      headers: {
        accept: "application/vnd.github.diff",
      },
    });
    return String(data);
  } catch (error: any) {
    context.log.error(error, "Error while fetching PR diff: ");
    return "";
  }
};

export const getCompareCommits = async ({
  context,
  prDetails,
}: {
  context: Context<"pull_request">;
  prDetails: PRDetails;
}) => {
  const result = await context.octokit.repos.compareCommits({
    owner: prDetails.owner,
    repo: prDetails.repo,
    head: prDetails.head_sha,
    base: prDetails.base_sha,
    mediaType: {
      format: "diff",
    },
  });
  console.log("Compare Commits: ", result);
};

export default getPRDiff;
