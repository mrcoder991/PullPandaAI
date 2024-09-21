import axios from "axios";
import { baseUrl } from "../constants.js";
import { HttpMethod } from "../types/index.js";
import { createConfig } from "./commonUtils.js";
import { IncomingMessage } from "http";
import EventSourceStream from "@server-sent-stream/node";

// // returns text output
// export const createChatSession = async (
//   chatId: string,
//   title: string,
//   description: string,
//   diff: string
// ) => {
//   const prompt = `
//     Title: ${title} \n
//     Description: ${description} \n
//     (diff starts - patch format) \n
//     ${diff} \n
//     (diff ends) \n
//     `;
//   try {
//     const response = await axios.request(
//       createConfig({
//         url: `${baseUrl}/chats/${chatId}`,
//         method: HttpMethod.POST,
//         body: {
//           date: Date.now(),
//           prompt,
//         },
//       })
//     );
//     return response.data;
//   } catch (error) {
//     console.error("Error:", error);
//   }
// };

export const getResponseForPrompt = async (
  chatId: string,
  title: string,
  description: string,
  diff: string
): Promise<{ data: string }> => {
  const prompt = `
    Title: ${title} \n
    Description: ${description} \n
    (diff starts - patch format) \n
    ${diff} \n
    (diff ends) \n
    `;
  const httpResponse = await axios.request(
    createConfig({
      url: `${baseUrl}/chats/${chatId}`,
      method: HttpMethod.POST,
      body: {
        date: Date.now(),
        prompt,
      },
      responseType: 'stream'
    })
  );

  return new Promise<{ data: string }>((resolve: (t: { data: string }) => void, reject: (reason?: any) => void) => {
    const stream: IncomingMessage = httpResponse.data;
    // convert response stream to EventSourceStream
    // @ts-ignore
    const eventStream = stream.pipe(new EventSourceStream());

    let response: string = "";
    // listen for message.delta events
    eventStream.on('data', (e: MessageEvent) => {
      if (e.type !== "message.delta") {
        return;
      }
      // parse event
      const event = JSON.parse(e.data);
      const text = (event.content).text;
      // accumulate
      response += text;
    });

    // error callback
    eventStream.on('error', (e: any) => {
      console.error("error: ", e);
      reject(e);
    });

    // close callback
    eventStream.on('close', () => {
      // resolve promise
      resolve({data: response});
    });
  });
};
