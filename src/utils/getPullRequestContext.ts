import { Context } from "probot";
import { PRDetails, RepoDetails } from "../types/index.js";

export const getPullRequestContext = async ({
  context,
}: {
  context: Context<"pull_request">;
}): Promise<{
  prDetails: PRDetails;
  repoDetails: RepoDetails;
}> => {
  const { owner, repo, pull_number } = context.pullRequest();

  const repoDetails: RepoDetails = await context.octokit.repos.get({
    owner,
    repo,
  });

  const prDetails: PRDetails = {
    title: context.payload.pull_request.title,
    description: context.payload.pull_request.body || "",
    owner,
    repo,
    pull_number,
    head_sha: context.payload.pull_request.head.sha,
    base_sha: context.payload.pull_request.base.sha,
  };

  return { prDetails, repoDetails };
};
