import { PRDetails, RepoDetails } from "../types/index.js";
import { Octokit } from "@octokit/rest";

export const getPullRequestContext = async ({
  owner,
  repo,
  pull_number,
  octokit,
}: {
  owner: string;
  repo: string;
  pull_number: number;
  octokit: Octokit;
}): Promise<{
  prDetails: PRDetails;
  repoDetails: RepoDetails;
}> => {
  const { data: repoData } = await octokit.repos.get({
    owner,
    repo,
  });

  const repoDetails: RepoDetails = {
    default_branch: repoData.default_branch,
  };

  const { data: prData } = await octokit.pulls.get({
    owner,
    repo,
    pull_number,
  });

  const prDetails: PRDetails = {
    title: prData.title,
    description: prData.body || "",
    owner,
    repo,
    pull_number,
    head_sha: prData.head.sha,
    base_sha: prData.base.sha,
    html_url: prData.html_url,
    baseref: prData.base.ref,
    isDraft: prData.draft,
  };

  return { prDetails, repoDetails };
};
