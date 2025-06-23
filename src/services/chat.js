import { GoogleGenAI } from "@google/genai";
import chalk from 'chalk';
import { smartFormat } from '../utils/markdown.js';

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
          temperature: 0.7
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
          temperature: 0.7
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
      // 마크다운을 터미널 친화적으로 렌더링
      return smartFormat(response);
    } catch (formatError) {
      // 포맷팅 실패 시 원본 텍스트 반환
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