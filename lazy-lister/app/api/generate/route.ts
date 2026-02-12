import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// This function handles the POST request
export async function POST(req: Request) {
    try {
        // 1. Grab the form data (Image + Prompt)
        const formData = await req.formData();
        const file = formData.get("image") as File;
        const userPrompt = formData.get("prompt") as string;

        if (!file) {
            return NextResponse.json({ error: "No image found" }, { status: 400 });
        }

        // 2. Prepare the image for Gemini (Buffer -> Base64)
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64Image = {
            inlineData: {
                data: buffer.toString("base64"),
                mimeType: file.type,
            },
        };

        // 3. Call the Gemini API
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const result = await model.generateContent([userPrompt, base64Image]);
        const response = await result.response;
        const text = response.text();

        // 4. Send the text back to the frontend
        return NextResponse.json({ result: text });

    } catch (error) {
        console.error("Server Error:", error);
        return NextResponse.json({ error: "Failed to generate listing" }, { status: 500 });
    }
}
