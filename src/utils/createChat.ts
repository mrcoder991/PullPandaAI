import axios from "axios";
import { HttpMethod } from "../types/index.js";
import { createConfig } from "./commonUtils.js";
import { aiId, baseUrl } from "./config.js";
import { Context } from "probot";

// returns chatId along with chat details
export const createChat = async (context: Context<"pull_request">) => {
  try {
    const response = await axios.request(
      createConfig({
        url: `${baseUrl}/ai/${aiId}/chats`,
      method: HttpMethod.POST,
      })
    );
    return response.data.id;
  } catch (error) {
    context.log.error(error, "Error while creating new chat: " );
  }
};
