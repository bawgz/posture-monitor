// ./app/api/chat/route.ts
import OpenAI from 'openai';
import { OpenAIStream, StreamingTextResponse } from 'ai';
import { encode } from 'base64-arraybuffer';

// Create an OpenAI API client (that's edge friendly!)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

// IMPORTANT! Set the runtime to edge
export const runtime = 'edge';

export async function POST(req: Request) {
  // Extract the `prompt` from the body of the request
  const { messages, data } = await req.json();

  const initialMessages = messages.slice(0, -1);
  const currentMessage = messages[messages.length - 1];

  console.log("fetching the image");
  const image = await fetch(data.imageUrl);
  console.log("got the image");
  const base64Image = encode(await image.arrayBuffer());

  console.log("transformed the image");
  console.log(JSON.stringify(base64Image));

  // const image = await axios.get(data.imageUrl, { responseType: 'arraybuffer' });
  // console.log("got the image");
  // const base64Image = Buffer.from(image.data).toString('base64');

  // Ask OpenAI for a streaming chat completion given the prompt
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-vision-preview',
      stream: true,
      max_tokens: 150,
      messages: [
        ...initialMessages,
        {
          ...currentMessage,
          content: [
            { type: 'text', text: currentMessage.content },
            {
              type: 'image_url',
              image_url: `data:image/jpg;base64,${base64Image}`,
            },
          ],
        },
      ],
    });

    // Convert the response into a friendly text-stream
    const stream = OpenAIStream(response);
    // Respond with the stream
    return new StreamingTextResponse(stream);
  } catch (error: any) {
    console.log("mmmmmm uh oh.... problem");
    console.log(error);
    return new Response(error.message, { status: 500 });
  }
}
