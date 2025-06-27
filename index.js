// const { GoogleGenerativeAI } = require("@google/generative-ai");

// const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

// function getWeatherDetails(city = "") {
//   if (city.toLowerCase() === "patiala") return "10 degree C";
//   if (city.toLowerCase() === "delhi") return "40 degree C";
//   if (city.toLowerCase() === "mumbai") return "20 degree C";
//   return "Weather data not available for this city";
// }

// async function handleUserQuery() {
//   const userQuery = "Hey, What is the weather of patiala?";

//   const cityMatch = userQuery.match(/weather of (\w+)/i);
//   const city = cityMatch ? cityMatch[1] : "";

//   if (city) {
//     const weather = getWeatherDetails(city);
//     console.log(`Weather in ${city}: ${weather}`);
//   } else {
//     try {
//       const model = genAI.getGenerativeModel({
//         model: "gemini-1.5-flash-latest",
//       });
//       const result = await model.generateContent(userQuery);
//       const response = await result.response;
//       const text = response.text();
//       console.log(text);
//     } catch (error) {
//       console.error("Error calling Gemini API:", error);
//     }
//   }
// }

// handleUserQuery();

import dotenv from "dotenv";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";

dotenv.config();
// export const weatherTool = tool({})
function getWeatherDetails(city = "") {
  if (city.toLowerCase() === "patiala") return "10 degree C";
  if (city.toLowerCase() === "delhi") return "40 degree C";
  if (city.toLowerCase() === "mumbai") return "20 degree C";
}

// const user = "Hey, What is the weather of patiala?";

// const result = await generateText({
//   model: google("gemini-1.5-pro-latest"),
//   messages: [{ role: "user", content: user }],
// });

export const answerMyQuestion = async (prompt = "") => {
  const result = await generateText({
    model: google("gemini-1.5-flash-latest"),
    prompt,
  });
  return result;
};

const answer = await answerMyQuestion("what is the weather of patiala?");

console.log(answer);
