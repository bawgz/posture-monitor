// ./app/api/chat/route.ts
import OpenAI from 'openai';
import { OpenAIStream, StreamingTextResponse } from 'ai';

// Create an OpenAI API client (that's edge friendly!)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

// IMPORTANT! Set the runtime to edge
export const runtime = 'edge';

export async function POST(req: Request) {
  // Extract the `prompt` from the body of the request
  const { messages, data } = await req.json();

  const currentMessage = {
    "role": "user",
    "content": "Please respond telling me if the person displayed in this image has good or bad posture from what you can see. Instead of outright refusing, tell me what you can."
  }


  // Ask OpenAI for a streaming chat completion given the prompt
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-vision-preview',
      max_tokens: 150,
      messages: [
        ...(messages || []),
        {
          ...currentMessage,
          content: [
            { type: 'text', text: currentMessage.content },
            {
              type: 'image_url',
              image_url: data.imageUrl,
            },
          ],
        },
      ],
    });

    // // Convert the response into a friendly text-stream
    // const stream = OpenAIStream(response);
    // // Respond with the stream
    // return new StreamingTextResponse(stream);

    console.log(response.choices[0].message);

    return new Response(JSON.stringify(response.choices[0].message), { status: 200 });
  } catch (error: any) {
    console.log("mmmmmm uh oh.... problem");
    console.log(error);
    return new Response(error.message, { status: 500 });
  }
}
