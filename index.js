import dotenv from "dotenv";
import { generateObject, generateText } from "ai";
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
