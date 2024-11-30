import { Octokit } from "@octokit/rest";
import { Logger } from "probot";

export const readRepoFileContents = async ({
  octokit,
  logger,
  owner,
  repo,
  defaultBranch,
  path,
}: {
  octokit: Octokit;
  logger: Logger;
  owner: string;
  repo: string;
  defaultBranch: string;
  path: string;
}): Promise<string> => {
  try {
    const { data } = await octokit.repos.getContent({
      owner,
      repo,
      path,
      ref: defaultBranch,
    });

    // @ts-expect-error
    const content = Buffer.from(data.content, "base64").toString("utf-8");
    return content;
  } catch (error: any) {
    logger.error(`Error reading the file: ${error.message}`);
    return "";
  }
};
