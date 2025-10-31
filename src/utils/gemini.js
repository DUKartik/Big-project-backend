import { GoogleGenAI } from "@google/genai";

const GEMINI_API_KEY =process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({apiKey:GEMINI_API_KEY});

const config={
                thinkingConfig: {
                    thinkingBudget: 0, // Disables thinking
                },
            }

const getResponse =async(content)=>{
    try {
        const response=await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: content,
            config,
        });
        return response;
    } catch (error) {
        console.log(error)
    }
} 


export {getResponse};