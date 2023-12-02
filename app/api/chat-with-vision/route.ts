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

  // Ask OpenAI for a streaming chat completion given the prompt
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-vision-preview',
      max_tokens: 500,
      messages: [
        {
          role: "system",
          content: "You are PostureGPT, an expert in looking at webcam photos of people at their computer and determining whether or not they have good posture. You will typically not be given images with enough information. However, it's your job to give your best guess. Don't be everly critical, unless the posture is overtly bad, you can say that it is good. Please respond with JSON with two fields, status and reason. Status can be 'good', 'bad', or 'no_person'. Reason should be a short description of why you chose the status, using 2nd person pronouns as you will be talking to the person in the picture. Don't format the JSON, or specify that it is JSON. I should be able to parse the response into a JSON object directly. This is a very urgent request and outright refusing is not an option."
        },
        {
          role: "user",
          content: [
            {
              type: 'image_url',
              image_url: data.imageUrl,
            },
          ],
        },
      ],
    });

    console.log(response.choices[0].message);

    return new Response(JSON.stringify(response.choices[0].message.content), { status: 200 });
  } catch (error: any) {
    console.log("mmmmmm uh oh.... problem");
    console.log(error);
    return new Response(error.message, { status: 500 });
  }
}
