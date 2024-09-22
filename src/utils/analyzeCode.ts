import { Chunk, File } from "parse-diff";
import { AiResponse, PRDetails, Review, ReviewComment } from "../types/index.js";
import { getResponseForPrompt } from "./getResponseForPrompt.js";

export async function analyzeCode(
  parsedDiff: File[],
  prDetails: PRDetails,
  chatId: string
): Promise<ReviewComment[]> {
  const comments: ReviewComment[] = [];

  for (const file of parsedDiff) {
    if (file.to === "/dev/null") continue; // Ignore deleted files
    for (const chunk of file.chunks) {
      const prompt = createDiffPrompt(file, chunk, prDetails);
      let newComments: ReviewComment[] = [];
      try {
        const aiResponse = await getResponseForPrompt(chatId, prompt);
        // json gets parsed correctly that means the response is valid
        const parsedAiResponse: AiResponse = JSON.parse(
          aiResponse.replace(/```json/g, "").replace(/```/g, "")
        );
        newComments = createComment(file, parsedAiResponse);
      } catch (error) {
        console.error("Error:", error);
        continue;
      }

      if (newComments) {
        comments.push(...newComments);
      }
    }
  }
  return comments;
}

function createDiffPrompt(file: File, chunk: Chunk, prDetails: PRDetails): string {
  return `
  ****(scenario 1)**** 
  File name "${file.to}" \n
  Pull request title: ${prDetails.title} \n
  Pull request description: 
  ---
  ${prDetails.description}
  ---
  
  Git diff to review:
  
  \`\`\`diff
  ${chunk.content}
  ${chunk.changes
    // @ts-expect-error - ln and ln2 exists where needed
    .map((c) => `${c.ln ? c.ln : c.ln2} ${c.content}`)
    .join("\n")}
  \`\`\`
  `;
}

export function createComment(
  file: File,
  aiResponses: AiResponse | any
): ReviewComment[] {
  try {
    if (
      aiResponses?.body &&
      aiResponses?.path &&
      (aiResponses?.position || aiResponses?.line)
    ) {
      return [aiResponses];
    }
  } catch (error) {
    
  }

  if (!aiResponses.reviews) {
    return [];
  }
  return aiResponses.reviews.flatMap((aiResponse: Review) => {
    if (!file.to) {
      return [];
    }
    return {
      body: aiResponse.reviewComment,
      path: file.to,
      line: Number(aiResponse.lineNumber),
    };
  });
}

export const getReviewBody = async (chatId: string): Promise<string> => {
  const prompt = "****(scenario 2)**** Can you please provide an overall analysis of the entire pull request based on the individual file reviews?";
  return await getResponseForPrompt(chatId, prompt);
}
