import { File } from "parse-diff";
import {
  AiResponse,
  CommandFlag,
  PRDetails,
  ReviewComment,
} from "../types/index.js";
import { getResponseForPrompt } from "./getResponseForPrompt.js";
import {
  createComment,
  createDiffPrompt,
  generateCommandDocs,
  processChunk,
  shouldIgnoreFile,
} from "./commonUtils.js";
import { Context } from "probot";

const stripMarkdownCodeBlock = (markdownString: string) => {
  const codeBlockRegex = /```json\n([\s\S]*?)\n```/g;

  const strippedString = markdownString.replace(codeBlockRegex, (codeBlock) => {
    return codeBlock.trim();
  });

  return strippedString;
};

export const analyzeCode = async ({
  parsedDiff,
  prDetails,
  chatId,
  context,
}: {
  parsedDiff: File[];
  prDetails: PRDetails;
  chatId: string;
  context: Context<"pull_request">;
}): Promise<ReviewComment[]> => {
  const comments: ReviewComment[] = [];

  for (const file of parsedDiff) {
    let fileDiff = "";

    if (file.to === "/dev/null" || shouldIgnoreFile(file.to)) continue; // Ignore deleted files and files in the ignore list

    for (const chunk of file.chunks) {
      const processedChunkString = processChunk(chunk);
      fileDiff += ".\n.\n.\n" + processedChunkString;
    }

    const prompt = createDiffPrompt(file, fileDiff, prDetails);
    let newComments: ReviewComment[] = [];
    try {
      const aiResponse = await getResponseForPrompt(chatId, prompt, context);
      // json gets parsed correctly that means the response is valid
      const parsedAiResponse: AiResponse = JSON.parse(
        stripMarkdownCodeBlock(aiResponse)
      );
      newComments = createComment(file, parsedAiResponse);
    } catch (error) {
      context.log.error(error, "Error While Parsing AI response");
      continue;
    }

    if (newComments) {
      comments.push(...newComments);
    }
  }
  return comments;
};

export const getReviewBody = async (
  chatId: string,
  context: Context<"pull_request">,
  flag: CommandFlag
): Promise<string> => {
  let prompt = "";

  switch (flag) {
    case CommandFlag.FullReviewEnabled:
      prompt = "****(scenario 2)****"; 
      break
    case CommandFlag.SoftReviewEnabled:
      prompt = "****(scenario 3)****";
      break;
    default:
      prompt = "****(scenario 2)****";
  }
  const aiResponse = await getResponseForPrompt(chatId, prompt, context);

  const commandDocs = generateCommandDocs();

  const body = `
${aiResponse}



<details>
<summary> <b> 💬 Available Commands</b></summary>

Commands can be used to customize the review process. You can use the following commands in the PR description to customize the review process:

use \`@PullPandaAi [command]\` or \`@PullPanda [command]\` (case insensitive).

${commandDocs}

####  Got any questions / suggestions / issues? Fill out the [Feedback Form](https://docs.google.com/forms/d/e/1FAIpQLSfNlXZzo8MLf85FkeNpM1NNKdk-Gjvt5X0QV9OQBgad9pmvJA/viewform?usp=sf_link)

</details>
`;

  return body;
};
