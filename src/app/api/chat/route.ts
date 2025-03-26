import { google } from "@ai-sdk/google";
import { defaultSettingsMiddleware, generateText, wrapLanguageModel } from "ai";

// Initialize the Google Generative AI model
const model = wrapLanguageModel({
  model: google("gemini-2.0-flash"),
  middleware: defaultSettingsMiddleware({
    settings: { providerMetadata: {} }, // customize as needed
  }),
});

export async function POST(req: Request) {
  try {
    // Parse the request body
    const { messages } = await req.json();
    // console.log('Full messages being sent to model:', messages);

    // Format messages for the AI SDK
    const formattedMessages = [
      {
        role: "system",
        content:
          "You are a legal assistant your answers should be based primarily on the origin country (INDIA), and you solve queries related to the country's laws, regulations, and procedures.",
      },
      ...messages.map((message: any) => ({
        role: message.role === "user" ? "user" : "assistant",
        content: message.content,
      })),
    ];
    // console.log('Formatted messages:', formattedMessages);

    // Generate the response
    const result = await generateText({
      model,
      messages: formattedMessages,
      providerOptions: {
        google: {
          temperature: 0.7,
          maxOutputTokens: 1000,
        },
      },
    });

    // Extract the text from the result
    const { text } = result;

    // Return the text as a JSON response
    return new Response(JSON.stringify({ text }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process your request" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
