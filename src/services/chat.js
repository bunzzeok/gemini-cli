import { GoogleGenAI } from "@google/genai";
import chalk from 'chalk';

/**
 * 채팅 서비스
 */
export class ChatService {
  constructor(apiKey, prompts) {
    this.genAI = new GoogleGenAI({ apiKey });
    this.prompts = prompts;
    this.chat = null;
  }

  /**
   * 채팅 세션 초기화
   */
  initChat() {
    if (!this.chat) {
      this.chat = this.genAI.chats.create({
        model: "gemini-2.0-flash",
        config: {
          systemInstruction: this.prompts.chat,
          temperature: 0.7,
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              action: { type: "STRING" },
              text: { type: "STRING" },
            },
            required: ["action", "text"],
            propertyOrdering: ["action", "text"],
          },
        },
      });
    }
    return this.chat;
  }

  /**
   * 단일 메시지 처리
   * @param {string} message - 사용자 메시지
   * @returns {string} - AI 응답
   */
  async sendSingleMessage(message) {
    try {
      const singleChat = this.genAI.chats.create({
        model: "gemini-2.0-flash",
        config: {
          systemInstruction: this.prompts.chat,
          temperature: 0.7,
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              action: { type: "STRING" },
              text: { type: "STRING" },
            },
            required: ["action", "text"],
            propertyOrdering: ["action", "text"],
          },
        },
      });

      const result = await singleChat.sendMessage({ message });
      return this.parseResponse(result.candidates[0].content.parts[0].text);
    } catch (error) {
      throw new Error(`단일 메시지 처리 실패: ${error.message}`);
    }
  }

  /**
   * 대화형 메시지 처리
   * @param {string} message - 사용자 메시지
   * @returns {string} - AI 응답
   */
  async sendMessage(message) {
    try {
      const chat = this.initChat();
      const result = await chat.sendMessage({ message });
      return this.parseResponse(result.candidates[0].content.parts[0].text);
    } catch (error) {
      throw new Error(`메시지 처리 실패: ${error.message}`);
    }
  }

  /**
   * 응답 파싱
   * @param {string} response - AI 원본 응답
   * @returns {string} - 파싱된 응답
   */
  parseResponse(response) {
    try {
      const parsedResponse = JSON.parse(response);
      if (parsedResponse && parsedResponse.text) {
        return parsedResponse.text;
      }
      return response;
    } catch (parseError) {
      return response;
    }
  }

  /**
   * 채팅 세션 초기화
   */
  resetChat() {
    this.chat = null;
  }
}