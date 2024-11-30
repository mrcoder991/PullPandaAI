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
  const repoDetails: RepoDetails = await octokit.repos.get({
    owner,
    repo,
  });

  const { data } = await octokit.pulls.get({
    owner,
    repo,
    pull_number,
  });

  const prDetails: PRDetails = {
    title: data.title,
    description: data.body || "",
    owner,
    repo,
    pull_number,
    head_sha: data.head.sha,
    base_sha: data.base.sha,
    html_url: data.html_url,
    baseref: data.base.ref,
    isDraft: data.draft,
  };

  return { prDetails, repoDetails };
};
