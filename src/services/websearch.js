import { GoogleGenAI } from '@google/genai';
import chalk from 'chalk';

export class WebSearchService {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.genAI = new GoogleGenAI({ apiKey });
  }

  async search(query, options = {}) {
    const { maxSearchLoops = 1, initialQueryCount = 2 } = options;

    console.log(chalk.blue(`🔍 검색 중...`));

    try {
      // Step 1: Generate initial search queries (reduced count)
      const searchQueries = await this.generateSearchQueries(query, initialQueryCount);

      // Step 2: Perform initial web searches
      let allResults = [];
      let sources = [];

      for (const searchQuery of searchQueries) {
        const result = await this.performWebSearch(searchQuery);
        if (result) {
          allResults.push(result.content);
          sources.push(...result.sources);
        }
      }

      // Step 3: Reflection and follow-up searches
      let loopCount = 0;
      while (loopCount < maxSearchLoops) {
        const reflection = await this.reflectOnResults(query, allResults);

        if (reflection.isSufficient || !reflection.followUpQueries.length) {
          console.log(chalk.green('✅ 충분한 정보가 수집되었습니다.'));
          break;
        }

        console.log(chalk.yellow(`🔄 보완 검색 중...`));

        for (const followUpQuery of reflection.followUpQueries) {
          const result = await this.performWebSearch(followUpQuery);
          if (result) {
            allResults.push(result.content);
            sources.push(...result.sources);
          }
        }

        loopCount++;
      }

      // Step 4: Generate final answer
      const finalAnswer = await this.generateFinalAnswer(query, allResults);

      return {
        answer: finalAnswer,
        sources: this.deduplicateSources(sources),
        searchQueries: searchQueries,
      };
    } catch (error) {
      console.error(chalk.red(`웹 검색 중 오류 발생: ${error.message}`));
      throw error;
    }
  }

  async generateSearchQueries(query, count) {
    const prompt = `Generate ${count} diverse search queries for: "${query}"
Date: ${new Date().toISOString().split('T')[0]}

Requirements:
- Different perspectives/aspects
- Search-optimized terms
- Mix Korean/English as needed`;

    try {
      const chat = this.genAI.chats.create({
        model: 'gemini-2.0-flash',
        config: {
          temperature: 1.0,
          responseMimeType: 'application/json',
          responseSchema: {
            type: 'OBJECT',
            properties: {
              queries: {
                type: 'ARRAY',
                items: { type: 'STRING' },
              },
              rationale: { type: 'STRING' },
            },
            required: ['queries', 'rationale'],
          },
        },
      });

      const result = await chat.sendMessage({ message: prompt });
      const response = JSON.parse(result.candidates[0].content.parts[0].text);
      return response.queries || [query];
    } catch (error) {
      console.warn(chalk.yellow('검색 쿼리 생성 실패, 기본 쿼리 사용'));
      return [query];
    }
  }

  async performWebSearch(searchQuery) {
    const prompt = `Search and summarize current info about: ${searchQuery}
Date: ${new Date().toISOString().split('T')[0]}

Focus on: reliable sources, facts, data, clear attribution.`;

    try {
      const chat = this.genAI.chats.create({
        model: 'gemini-2.0-flash',
        config: {
          temperature: 0,
          tools: [{ googleSearch: {} }],
        },
      });

      const result = await chat.sendMessage({ message: prompt });
      const response = result.candidates[0];

      // Extract sources from grounding metadata if available
      const sources = this.extractSourcesFromResponse(response);

      return {
        content: response.content.parts[0].text,
        sources: sources,
        query: searchQuery,
      };
    } catch (error) {
      console.warn(chalk.yellow(`검색 실패: ${searchQuery} - ${error.message}`));
      return null;
    }
  }

  async reflectOnResults(originalQuery, results) {
    // 간단한 반성 로직: 결과가 너무 짧거나 없으면 추가 검색
    const totalLength = results.join('').length;
    if (totalLength < 500) {
      return {
        isSufficient: false,
        knowledgeGap: 'Insufficient detail',
        followUpQueries: [`${originalQuery} details`, `${originalQuery} guide`]
      };
    }
    
    return {
      isSufficient: true,
      knowledgeGap: '',
      followUpQueries: []
    };
  }

  async generateFinalAnswer(originalQuery, results) {
    const prompt = `Answer: ${originalQuery}

Info collected:
${results.join('\n---\n')}

Format: Clear, structured Korean response with key info bolded.`;

    try {
      const chat = this.genAI.chats.create({
        model: 'gemini-2.0-flash',
        config: {
          temperature: 0,
        },
      });

      const result = await chat.sendMessage({ message: prompt });
      return result.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error(chalk.red(`최종 답변 생성 실패: ${error.message}`));
      return results.join('\n\n---\n\n');
    }
  }

  extractSourcesFromResponse(response) {
    const sources = [];

    // Extract from grounding metadata if available
    if (response.groundingMetadata?.groundingChunks) {
      for (const chunk of response.groundingMetadata.groundingChunks) {
        if (chunk.web?.uri) {
          sources.push({
            url: chunk.web.uri,
            title: chunk.web.title || 'Unknown Title',
          });
        }
      }
    }

    return sources;
  }

  extractJsonFromResponse(text) {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    return jsonMatch ? jsonMatch[0] : '{}';
  }

  deduplicateSources(sources) {
    const unique = new Map();

    for (const source of sources) {
      if (source.url && !unique.has(source.url)) {
        unique.set(source.url, source);
      }
    }

    return Array.from(unique.values());
  }
}
