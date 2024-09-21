import axios from "axios";
import { aiId, baseUrl } from "../constants.js";
import { HttpMethod } from "../types/index.js";
import { createConfig } from "./commonUtils.js";

// returns chatId along with chat details
export const createChat = async () => {
  try {
    const response = await axios.request(
      createConfig({
        url: `${baseUrl}/ai/${aiId}/chats`,
        method: HttpMethod.POST,
      })
    );
    return response.data.id;
  } catch (error) {
    console.error("Error:", error);
  }
};
