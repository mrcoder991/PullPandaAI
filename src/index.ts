import { Probot } from "probot";
// import getPRDiff from "./utils/getPrDiff.js";
// import { createChat } from "./utils/createChat.js";
// import getPRDetails from "./utils/getPRDetails.js";
// import { getResponseForPrompt } from "./utils/createChatSession.js";

export default (app: Probot) => {
  app.on("issues.opened", async (context) => {
    const issueComment = context.issue({
      body: "Thanks for opening this issue!",
    });
    await context.octokit.issues.createComment(issueComment);
  });

  app.on("pull_request", async (context) => {
    const { owner, repo, pull_number } = context.pullRequest();

    // const prDetails = await getPRDetails(owner, repo, pull_number, context);

    // const diff = await getPRDiff(owner, repo, pull_number, context);

    // const reviewComments: { path: string; position: number; body: string }[] =
    //   [];
    // let reviewBody: string = "Added comments";

    // if (diff) {
    //   try {
    //     const chatId = await createChat();
    //     const aiResponse: any = await getResponseForPrompt(
    //       chatId,
    //       prDetails.data.title,
    //       prDetails.data.body || "",
    //       diff
    //     );
    //     console.log("AI Response:", aiResponse);
    //     if (aiResponse && aiResponse?.comments.length) {
    //       aiResponse.comments.forEach((response: any) => {
    //         const { path, position, body } = response;
    //         reviewComments.push({
    //           path,
    //           position,
    //           body,
    //         });
    //       });
    //       reviewBody = aiResponse?.reviewBody || reviewBody;
    //     }
    //   } catch (error) {
    //     console.error("Error:", error);
    //   }

      // if (reviewComments && reviewComments.length) {
        await context.octokit.pulls.createReview({
          owner,
          repo,
          pull_number,
          body: "fix your code shitehead",
          event: "COMMENT",
          commit_id: context.payload.pull_request.head.sha,
          comments: [
            {
              "path": "README.md",
              "line": 78,
              "body": "Consider adding more descriptive comments for each style class. This will help other developers understand the purpose of each style and make future maintenance easier."
            },
            {
              "path": "README.md",
              "line": 64,
              "body": "The `teamData` array could be moved to a separate JSON file and imported. This will make the `Team.jsx` file cleaner and separate the data from the component logic."
            },
            {
              "path": "README.md",
              "line": 80,
              "body": "It is better to use semantic HTML elements. Replace the `<div>` used for the overlays with `<section>` or `<aside>` to improve accessibility and readability."
            },
          ],
        });
      // }
    // }

    // Post comments on PR
    // for (const comment of analysis.comments) {
      // await context.octokit.pulls.createReviewComment({
      //   owner,
      //   repo,
      //   pull_number,
      //   body: "This is test a comment",
      //   path: "README.md",
      //   commit_id: context.payload.pull_request.head.sha,
      //   line: 78,
      // });
      // await context.octokit.pulls.createReviewComment({
      //   owner,
      //   repo,
      //   pull_number,
      //   body: "This is test a comment 2",
      //   path: "README.md",
      //   commit_id: context.payload.pull_request.head.sha,
      //   line: 64,
      // });
      // await context.octokit.pulls.createReviewComment({
      //   owner,
      //   repo,
      //   pull_number,
      //   body: "This is test a comment 5 fk you",
      //   path: "README.md",
      //   commit_id: context.payload.pull_request.head.sha,
      //   line: 80,
      // });
    // }
  });
};
