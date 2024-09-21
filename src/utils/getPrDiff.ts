import { Context } from "probot";

const getPRDiff = async (owner: string, repo: string, pull_number: number, context: Context ): Promise<string | undefined> => {
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
        console.error(`Error: ${error.status} - ${error.message}`);
        return;
    }  
}

export default getPRDiff