
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function GET() {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  try {
    const prompt = `
      Generate a single, interesting, and positive welcome message for a user of a carbon footprint tracking app named 'Carbon Buddy'.
      The message should be one of these two types:
      1. A surprising fact about carbon emissions, sustainability, or the environment.
      2. A piece of recent good news related to climate change or environmental protection.

      Keep the message concise (1-2 sentences).
      Conclude the message with a friendly, inviting question like "How can I help you today?" or "What's on your mind?".
    `;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    return NextResponse.json({ welcomeMessage: text });

  } catch (error) {
    console.error("Error in welcome-fact API:", error);
    return NextResponse.json(
      { error: "Failed to generate a welcome message." },
      { status: 500 }
    );
  }
}