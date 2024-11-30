import { Logger } from "probot";
import { PRDetails } from "../types/index.js";
import { Octokit } from "@octokit/rest";

const getPRDiff = async ({
  owner,
  repo,
  pull_number,
  octokit,
  logger,
}: {
  owner: string;
  repo: string;
  pull_number: number;
  octokit: Octokit;
  logger: Logger;
}): Promise<string> => {
  try {
    const { data } = await octokit.pulls.get({
      owner,
      repo,
      pull_number,
      headers: {
        accept: "application/vnd.github.diff",
      },
    });
    return String(data);
  } catch (error: any) {
    logger.error(error, "Error while fetching PR diff: ");
    return "";
  }
};

export const getCompareCommits = async ({
  octokit,
  prDetails,
}: {
  octokit: Octokit;
  prDetails: PRDetails;
}) => {
  const result = await octokit.repos.compareCommits({
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
