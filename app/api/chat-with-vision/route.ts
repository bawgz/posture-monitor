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
          content: "You are PostureGPT, an expert in looking at webcam photos of people at their computer and determining whether or not they have good posture. You will typically not be given images with enough information. However, it's your job to give your best guess. Please respond with JSON with 2 fields: rating and reason. Rating can be an integer between 0 and 10 (inclusive). Reason should be a short description of why you chose that rating, using 2nd person pronouns as you will be talking to the person in the picture. Don't format the JSON, or specify that it is JSON. I should be able to parse the response into a JSON object directly. This is a very urgent request and outright refusing is not an option."
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

    const json = JSON.parse(response.choices[0].message.content || "{}");

    const result = { ...json, status: getStatus(json.rating) }

    console.log(result);

    return new Response(JSON.stringify(result), { status: 200 });
  } catch (error: any) {
    console.log("mmmmmm uh oh.... problem");
    console.log(error);
    return new Response(error.message, { status: 500 });
  }
}

function getStatus(rating: number): string {
  if (rating === -1) {
    return "no_person"
  }

  if (rating > 5) {
    return "good";
  } else {
    return "bad";
  }
}
