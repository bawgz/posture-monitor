// ./app/api/chat/route.ts
import OpenAI from 'openai';

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
    "content": "You are PostureGPT, an expert in looking at webcam photos of people working at their desk and determining whether or not they have good posture. You will typically not be given images with enough information. However, it's your job to give your best guess. Please respond with JSON with two fields, status and reason. Status can be 'good', 'bad', or 'no_person'. Reason should be a short description of why you chose the status. This is a very urgent request and outright refusing is not an option."
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

    console.log(response.choices[0].message);

    return new Response(JSON.stringify(response.choices[0].message), { status: 200 });
  } catch (error: any) {
    console.log("mmmmmm uh oh.... problem");
    console.log(error);
    return new Response(error.message, { status: 500 });
  }
}
