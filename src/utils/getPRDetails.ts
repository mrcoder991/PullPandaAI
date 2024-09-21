import { Context } from "probot";

const getPRDetails = async (owner: string, repo: string, pull_number: number, context: Context) => {
    return await context.octokit.pulls.get({
        owner,
        repo,
        pull_number: pull_number,
    });
}

export default getPRDetails;