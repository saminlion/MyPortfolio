import axios from "axios";

const apiKey = "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";
const apiUrl = "https://api.openai.com/v1/chat/completions";

/**
 * 
 * @param {string} text 
 * @param {string} targetLanguage 
 * @return {Promsise<string>} translated text
 */
export async function translateText(text, targetLanguage)
{
    const promt = `Translated this text into ${targetLanguage}: "${text}"`;

    try {
        const response = await axios.post(
            apiUrl,
            {
                model: "gpt-3.5-turbo",
                messages: [{role: "user", content: promt }]
            },
            {
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    "Content-Type": "application/json"
                }
            }
        );

        return response.data.choices[0].message.content;
    }

    catch (error) {
        console.error("Error during translation:", error);

        throw new Error("Translation Failed");
    }
}

export async function translateProject(json, targetLanguage) {
    const prompt = `Translate this JSON into ${targetLanguage}:\n\n${JSON.stringify(json, null, 2)}`;
  
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const response = await axios.post(
          apiUrl,
          {
            model: "gpt-3.5-turbo", // 올바른 모델 이름 사용
            messages: [{ role: "user", content: prompt }],
          },
          {
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
          }
        );
  
        return JSON.parse(response.data.choices[0].message.content);
      } catch (error) {
        if (error.response?.status === 429 && attempt < 2) {
          console.warn(`429 Too Many Requests. Retrying in ${attempt + 1} seconds...`);
          await new Promise((resolve) => setTimeout(resolve, (attempt + 1) * 1000));
        } else {
          console.error("Translation failed:", error.response?.data || error.message);
          throw error;
        }
      }
    }
  }