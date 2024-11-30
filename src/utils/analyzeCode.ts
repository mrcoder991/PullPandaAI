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
import { Logger } from "probot";

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
  logger,
}: {
  parsedDiff: File[];
  prDetails: PRDetails;
  chatId: string;
  logger: Logger;
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
      const aiResponse = await getResponseForPrompt(chatId, prompt, logger);
      // json gets parsed correctly that means the response is valid
      const parsedAiResponse: AiResponse = JSON.parse(
        stripMarkdownCodeBlock(aiResponse)
      );
      newComments = createComment(file, parsedAiResponse);
    } catch (error) {
      logger.error(error, "Error While Parsing AI response");
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
  logger: Logger,
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
  const aiResponse = await getResponseForPrompt(chatId, prompt, logger);

  const commandDocs = generateCommandDocs();

  const body = `
${aiResponse}



<details>
<summary> <b> 💬 Available Commands</b></summary>
You can use the following commands in the PR description to customize the review process:

use \`@PullPandaAi [command]\` or \`@PullPanda [command]\` (case insensitive).

${commandDocs}

> [!TIP]
> Some of the PR description commands can be used in form of PR comments as well. 

####  Got any questions / suggestions / issues? Fill out the [Feedback Form](https://docs.google.com/forms/d/e/1FAIpQLSfNlXZzo8MLf85FkeNpM1NNKdk-Gjvt5X0QV9OQBgad9pmvJA/viewform?usp=sf_link)

</details>
`;

  return body;
};
