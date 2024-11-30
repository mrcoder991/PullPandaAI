import axios from "axios";
import { HttpMethod } from "../types/index.js";
import { createConfig } from "./commonUtils.js";
import { aiId, appdirectAiBaseUrl } from "./config.js";
import { Logger } from "probot";

// returns chatId along with chat details
export const createChat = async (logger: Logger) => {
  try {
    const response = await axios.request(
      createConfig({
        url: `${appdirectAiBaseUrl}/ai/${aiId}/chats`,
        method: HttpMethod.POST,
      })
    );
    return response.data.id;
  } catch (error) {
    logger.error(error, "Error while creating new chat: ");
  }
};
