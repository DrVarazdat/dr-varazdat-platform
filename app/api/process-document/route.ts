import { NextResponse } from "next/server";
import pdfParse from "pdf-parse";

export async function POST(req: Request) {
  try {
    const { fileUrl, fileName } = await req.json();

    if (!fileUrl) {
      return NextResponse.json({ error: "No file URL provided" }, { status: 400 });
    }

    // 1. Download the file from the Supabase public URL
    const response = await fetch(fileUrl);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let extractedText = "";

    // 2. Extract text if it's a PDF
    if (fileName.toLowerCase().endsWith(".pdf")) {
      const pdfData = await pdfParse(buffer);
      extractedText = pdfData.text;
    } else {
      // If it's a txt or other file, just convert buffer to string
      extractedText = buffer.toString("utf-8");
    }

    // 3. Send the extracted text to Botpress Knowledge Base
    // Note: You must add your Botpress keys to your .env.local file
    const BOTPRESS_WORKSPACE_ID = process.env.BOTPRESS_WORKSPACE_ID;
    const BOTPRESS_TOKEN = process.env.BOTPRESS_TOKEN;

    if (BOTPRESS_TOKEN && BOTPRESS_WORKSPACE_ID) {
        // This pushes the document directly to your Botpress Workspace Files
        await fetch(`https://api.botpress.cloud/v1/files`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${BOTPRESS_TOKEN}`,
                "x-workspace-id": BOTPRESS_WORKSPACE_ID,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: fileName,
                content: extractedText,
                tags: { source: "admin-auto-generator" }
            })
        });
    } else {
        console.warn("Botpress credentials missing in .env.local, skipping Botpress upload.");
    }

    // 4. Return success to the frontend
    return NextResponse.json({ 
        success: true, 
        message: "Document processed and sent to Botpress",
        extractedText: extractedText.substring(0, 500) // Return a snippet for the AI to generate course details later
    });

  } catch (error: any) {
    console.error("Error processing document:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
