import axios from "axios";
import { HttpMethod } from "../types/index.js";
import { convertAppdirectAiResponseBufferToJSON, createConfig } from "./commonUtils.js";
import { IncomingMessage } from "http";
import { baseUrl } from "./config.js";
import { Context } from "probot";

export const getResponseForPrompt = async (
  chatId: string,
  prompt: string,
  context: Context<"pull_request">
): Promise<string> => {
  const httpResponse = await axios.request(
    createConfig({
      url: `${baseUrl}/chats/${chatId}`,
      method: HttpMethod.POST,
      body: {
        date: Date.now(),
        prompt,
      },
      responseType: "stream",
    })
  );

  return new Promise<string>(
    (resolve: (t: string) => void, reject: (reason?: any) => void) => {
      const stream: IncomingMessage = httpResponse.data;

      let response: string = "";
      // listen for message.delta events
      const chunks: any = [];
      stream.on("data", (e: any) => {
        chunks.push(e);
      });

      stream.on("end", () => {
        let bufferToString = Buffer.concat(chunks).toString();
        const jsonData = convertAppdirectAiResponseBufferToJSON(bufferToString);
        response = jsonData.map((data: any) => data.content.text).join("");
      });

      // error callback
      stream.on("error", (e: any) => {
        context.log.error("Error:", e);
        reject(e);
      });

      // close callback
      stream.on("close", () => {
        // resolve promise
        resolve(response);
      });
    }
  );
};
