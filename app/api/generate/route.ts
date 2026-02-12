import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import dns from "dns";

// Force Node.js to use Google DNS for this process to bypass local router issues
try {
    dns.setServers(["8.8.8.8", "1.1.1.1"]);
    console.log("DNS servers set to 8.8.8.8, 1.1.1.1");
} catch (dnsError) {
    console.error("Failed to set DNS servers:", dnsError);
}

// This function handles the POST request
export async function POST(req: Request) {
    // Force Node.js to use Google DNS for this process to bypass local router issues
    try {
        dns.setServers(["8.8.8.8", "1.1.1.1"]);
        console.log("DNS servers set to 8.8.8.8, 1.1.1.1");
    } catch (dnsError) {
        console.error("Failed to set DNS servers:", dnsError);
    }

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
        const apiKey = process.env.GEMINI_API_KEY;
        console.log("API Key found:", !!apiKey, apiKey ? `(${apiKey.slice(0, 4)}...${apiKey.slice(-4)})` : "(NONE)");

        if (!apiKey) {
            return NextResponse.json({ error: "API Key missing in .env.local" }, { status: 500 });
        }

        const genAI = new GoogleGenerativeAI(apiKey);

        // Using gemini-2.0-flash which is the current recommended version
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const result = await model.generateContent([userPrompt, base64Image]);
        const response = await result.response;
        const text = response.text();

        // 4. Send the text back to the frontend
        return NextResponse.json({ result: text });

    } catch (error: any) {
        console.error("Server Error Full Details:", error);
        return NextResponse.json({
            error: "Failed to generate listing",
            details: error.message || "Unknown error"
        }, { status: 500 });
    }
}
