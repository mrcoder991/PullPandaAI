import { Octokit } from "@octokit/rest";
import { Logger } from "probot";

export const readRepoFileContents = async ({
  octokit,
  logger,
  repository,
  path,
}: {
  octokit: Octokit;
  logger: Logger;
  repository: any;
  path: string;
}): Promise<string> => {
  try {
    const { data } = await octokit.repos.getContent({
      owner: repository.owner.login,
      repo: repository.name,
      ref: repository.default_branch,
      path,
    });

    // @ts-expect-error
    const content = Buffer.from(data.content, "base64").toString("utf-8");
    return content;
  } catch (error: any) {
    logger.error(`Error reading the file: ${error.message}`);
    return "";
  }
};
