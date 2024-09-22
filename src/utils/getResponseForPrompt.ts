import axios from "axios";
import { HttpMethod } from "../types/index.js";
import { createConfig } from "./commonUtils.js";
import { IncomingMessage } from "http";
import EventSourceStream from "@server-sent-stream/node";
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
      // convert response stream to EventSourceStream
      // @ts-expect-error EventSourceStream's has a constructor
      const eventStream = stream.pipe(new EventSourceStream());

      let response: string = "";
      // listen for message.delta events
      eventStream.on("data", (e: MessageEvent) => {
        if (e.type !== "message.delta") {
          return;
        }
        // parse event
        const event = JSON.parse(e.data);
        const text = event.content.text;
        // accumulate
        response += text;
      });

      // error callback
      eventStream.on("error", (e: any) => {
        context.log.error("Error:", e);
        reject(e);
      });

      // close callback
      eventStream.on("close", () => {
        // resolve promise
        resolve(response);
      });
    }
  );
};
