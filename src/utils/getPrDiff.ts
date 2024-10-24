import { Context } from "probot";

const getPRDiff = async (owner: string, repo: string, pull_number: number, context: Context<"pull_request"> ): Promise<string> => {
    try {
        const { data } = await context.octokit.pulls.get({
          owner,
          repo,
          pull_number,
          headers: {
            accept: 'application/vnd.github.patch',
          },
        });
        return String(data);
      } catch (error: any) {
        context.log.error(error, "Error while fetching PR diff: ");
        return "";
    }  
}

export default getPRDiff