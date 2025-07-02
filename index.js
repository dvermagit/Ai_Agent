import dotenv from "dotenv";
import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import readlineSync from "readline-sync";
import { z } from "zod";

dotenv.config();
function getWeatherDetails(city = "  ") {
  if (city.toLowerCase() === "patiala") return "10 degree C";
  if (city.toLowerCase() === "delhi") return "40 degree C";
  if (city.toLowerCase() === "mumbai") return "20 degree C";
}

// export const answerMyQuestion = async (prompt = "") => {
//   const result = await generateText({
//     model: google("gemini-1.5-flash-latest"),
//     prompt,
//   });
//   return result;
// };

// const answer = await answerMyQuestion("what is the weather of patiala?");

// console.log(answer);

const tools = {
  getWeatherDetails: getWeatherDetails,
};

const SYSTEM_PROMPT = `
You are an AI assistant with START,PLAN,ACTION,Observation and Output State.
Wait for the user prompt and first PLAN sing available tools.
After Planning,Take the action with appropriate tools and wait for Observation based on Action.
Once you get the observations,Return the AI response based on START prompt nd observations

Strictly follow the JSON output format as in examples
Available Tools:
-function getWeatherDetails(city:string):string
getWeatherDetails is a function that accepts city name as string and returns the weather details

Example:
START
{"type" : "user", "user":"What is the sum of weather of patiala and mumbai?"}
{"type" : "plan", "plan":"I'll call the getWeatherDetailsfor patiala"}
{"type" : "action", "function":"getWeatherDetails","input":"patiala"}
{"type" : "observation", "observation":"10 degree C"}
{"type" : "plan", "plan":"I'll call the getWeatherDetailsfor mumbai"}
{"type" : "action", "function":"getWeatherDetails","input":"mumbai"}
{"type" : "observation", "observation":"20 degree C"}
{"type" : "output", "output":"the sum of weather of patiala and mumbai is 30 degree C"}
`;

// const user = "what is the weather of patiala?";
// export const answerMyQuestion = async () => {
//   const result = await generateText({
//     model: google("gemini-1.5-flash-latest"),
//     messages: [
//       { role: "system", content: SYSTEM_PROMPT },
//       { role: "user", content: user },
//     ],
//   });
//   console.log(result);
// };

// answerMyQuestion();

// const user = "what is the weather of patiala?";
// export const answerMyQuestion = async () => {
//   const result = await generateText({
//     model: google("models/gemini-2.0-flash-exp"),
//     messages: [
//       { role: "system", content: SYSTEM_PROMPT },
//       { role: "user", content: user },
//     ],
//   });
//   console.log(result.text);
// };

// answerMyQuestion();

const messages = [{ role: "system", content: SYSTEM_PROMPT }];

while (true) {
  const query = readlineSync.question(">> ");

  const q = {
    type: "user",
    user: query,
  };
  messages.push({ role: "user", content: JSON.stringify(q) });

  while (true) {
    console.log(messages);
    const chat = await generateObject({
      model: google("gemini-2.5-flash-preview-04-17"),
      messages: messages,
      schema: z.object({
        type: z.enum(["plan", "action", "observation", "output"]),
        plan: z.string().optional(),
        function: z.string().optional(),
        input: z.string().optional(),
        observation: z.string().optional(),
        output: z.string().optional(),
      }),
    });

    const result = chat.object;
    // console.log({ result });
    messages.push({ role: "assistant", content: JSON.stringify(result) });
    const call = result;

    if (call.type == "output") {
      console.log(`🤖:${call.output}`);
      break;
    } else if (call.type == "action") {
      const fn = tools[call.function];
      const observation = fn(call.input);
      const obs = {
        type: "observation",
        observation: observation,
      };
      messages.push({ role: "assistant", content: JSON.stringify(obs) });
    }
  }
}

// import dotenv from "dotenv";
// import { generateObject } from "ai";
// import { google } from "@ai-sdk/google";
// import { z } from "zod";

// dotenv.config();

// // Weather function
// function getWeatherDetails(city = "  ") {
//   if (city.toLowerCase() === "patiala") return "10 degree C";
//   if (city.toLowerCase() === "delhi") return "40 degree C";
//   if (city.toLowerCase() === "mumbai") return "20 degree C";
//   return "Weather data not available";
// }

// const tools = {
//   getWeatherDetails: getWeatherDetails,
// };

// // System prompt for both AIs
// const SYSTEM_PROMPT = `
// You are an AI assistant with START,PLAN,ACTION,Observation and Output State.
// Wait for the user prompt and first PLAN using available tools.
// After Planning,Take the action with appropriate tools and wait for Observation based on Action.
// Once you get the observations,Return the AI response based on START prompt and observations.

// Strictly follow the JSON output format as in examples.
// Available Tools:
// - function getWeatherDetails(city:string):string
//   getWeatherDetails is a function that accepts city name as string and returns the weather details.

// Example:
// START
// {"type" : "user", "user":"What is the sum of weather of patiala and mumbai?"}
// {"type" : "plan", "plan":"I'll call the getWeatherDetails for patiala"}
// {"type" : "action", "function":"getWeatherDetails","input":"patiala"}
// {"type" : "observation", "observation":"10 degree C"}
// {"type" : "plan", "plan":"I'll call the getWeatherDetails for mumbai"}
// {"type" : "action", "function":"getWeatherDetails","input":"mumbai"}
// {"type" : "observation", "observation":"20 degree C"}
// {"type" : "output", "output":"the sum of weather of patiala and mumbai is 30 degree C"}
// `;

// // Function to handle a single AI response
// async function getAIResponse(messages, model) {
//   while (true) {
//     const chat = await generateObject({
//       model: google(model),
//       messages: messages,
//       schema: z.object({
//         type: z.enum(["plan", "action", "observation", "output"]),
//         plan: z.string().optional(),
//         function: z.string().optional(),
//         input: z.string().optional(),
//         observation: z.string().optional(),
//         output: z.string().optional(),
//       }),
//     });

//     const result = chat.object;
//     messages.push({ role: "assistant", content: JSON.stringify(result) });

//     if (result.type === "output") {
//       return { response: result.output, messages };
//     } else if (result.type === "action") {
//       const fn = tools[result.function];
//       const observation = fn(result.input);
//       const obs = {
//         type: "observation",
//         observation: observation,
//       };
//       messages.push({ role: "assistant", content: JSON.stringify(obs) });
//     }
//   }
// }

// // Main conversation function
// async function runAIConversation() {
//   // Initialize two AI agents with their own message histories
//   const ai1Messages = [{ role: "system", content: SYSTEM_PROMPT }];
//   const ai2Messages = [{ role: "system", content: SYSTEM_PROMPT }];

//   // Starting prompt
//   const initialPrompt =
//     "Hello fellow AI! Can you tell me all the weather you have?";
//   console.log(`AI 1: ${initialPrompt}`);

//   // First AI's turn
//   ai1Messages.push({
//     role: "user",
//     content: JSON.stringify({ type: "user", user: initialPrompt }),
//   });
//   let { response: ai1Response, messages: updatedAi1Messages } =
//     await getAIResponse(ai1Messages, "gemini-2.5-flash-preview-04-17");
//   console.log(`AI 2: ${ai1Response}`);

//   // Second AI's turn (responding to the first AI)
//   ai2Messages.push({
//     role: "user",
//     content: JSON.stringify({ type: "user", user: ai1Response }),
//   });
//   let { response: ai2Response, messages: updatedAi2Messages } =
//     await getAIResponse(ai2Messages, "gemini-2.5-flash-preview-04-17");
//   console.log(`AI 1: ${ai2Response}`);

//   // Continue the conversation for a few more turns
//   for (let i = 0; i < 20; i++) {
//     updatedAi1Messages.push({
//       role: "user",
//       content: JSON.stringify({ type: "user", user: ai2Response }),
//     });
//     const result1 = await getAIResponse(
//       updatedAi1Messages,
//       "gemini-1.5-flash-latest"
//     );
//     ai1Response = result1.response;
//     updatedAi1Messages = result1.messages;
//     console.log(`AI 2: ${ai1Response}`);

//     updatedAi2Messages.push({
//       role: "user",
//       content: JSON.stringify({ type: "user", user: ai1Response }),
//     });
//     const result2 = await getAIResponse(
//       updatedAi2Messages,
//       "gemini-1.5-flash-latest"
//     );
//     ai2Response = result2.response;
//     updatedAi2Messages = result2.messages;
//     console.log(`AI 1: ${ai2Response}`);
//   }
// }

// // Start the conversation
// runAIConversation().catch(console.error);
