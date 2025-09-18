// File: app/api/chat/route.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: NextRequest) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  try {
    const { message, carbon_data } = await req.json();

    //--fine tuning gemini responses
    const prompt = `
      You are 'Carbon Buddy', a friendly and expert AI assistant. Your goal is to give concise, data-driven, and highly relevant advice based on the user's specific emission data.

      **USER'S LATEST EMISSION DATA (in kg CO2e unless stated otherwise):**
      - **Total Emissions:** ${carbon_data.total?.toFixed(2)} kg
      
      - **Emission Breakdown:**
        - Transport: ${carbon_data.transport?.toFixed(2)} kg
        - Energy: ${carbon_data.energy?.toFixed(2)} kg
        - Food: ${carbon_data.food?.toFixed(2)} kg
        - Digital: ${carbon_data.digital?.toFixed(2)} kg

      - **Detailed Raw Inputs:**
        - Car Distance: ${carbon_data.carDistanceKms || 'N/A'} km
        - Car Type: ${carbon_data.carType || 'N/A'}
        - Flights: ${carbon_data.flightKms || 'N/A'} km
        - Electricity Bill: $${carbon_data.electricityBill || 'N/A'}
        - Diet Type: ${carbon_data.diet || 'N/A'}

      **YOUR TASK (Decision-Making Framework):**
      1.  **Analyze Intent:** First, determine the user's intent from their question.
      2.  **Provide a Response based on one of the three modes below:**

          * **Mode 1: Personalized Data Question.** If the user asks a specific question about THEIR data (e.g., "what's my biggest source?", "how can I reduce my travel emissions?"), answer ONLY that question directly, using their detailed raw inputs to be as specific as possible.

          * **Mode 2: Personalized Summary.** If the user asks for a general summary (e.g., "how am I doing?"), THEN provide the structured analysis of their data, including their total footprint, biggest source, and personalized tips.

          
          * **Mode 3: General Knowledge Question.** If the user asks a general question about carbon emissions, climate change, sustainability, or related facts (e.g., "what is a carbon footprint?", "give me a fact about plastic waste"), answer it factually and concisely. **In this mode, DO NOT mention the user's personal data.** Stick to the general topic.

      **User's Current Question:**
      "${message}"
    `;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    return NextResponse.json({ reply: text });

  } catch (error) {
    console.error("Error in chat API:", error);
    return NextResponse.json(
      { error: "Failed to get a response from the AI model." },
      { status: 500 }
    );
  }
}