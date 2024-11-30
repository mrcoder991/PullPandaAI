import axios from "axios";
import { HttpMethod } from "../types/index.js";
import {
  convertAppdirectAiResponseBufferToJSON,
  createConfig,
} from "./commonUtils.js";
import { IncomingMessage } from "http";
import { appdirectAiBaseUrl } from "./config.js";
import { Logger } from "probot";

export const getResponseForPrompt = async (
  chatId: string,
  prompt: string,
  logger: Logger
): Promise<string> => {
  const httpResponse = await axios.request(
    createConfig({
      url: `${appdirectAiBaseUrl}/chats/${chatId}`,
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
        logger.error(e, "Error while streaming ai response");
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
