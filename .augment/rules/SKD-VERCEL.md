---
description: 
globs: 
alwaysApply: false
---
TITLE: Streaming Array Elements with Schema
DESCRIPTION: Shows how to stream an array of structured objects using streamObject with element-wise streaming for RPG hero descriptions.
SOURCE: https://github.com/vercel/ai/blob/main/content/docs/07-reference/01-ai-sdk-core/04-stream-object.mdx#2025-04-23_snippet_1

LANGUAGE: typescript
CODE:
```
import { openai } from '@ai-sdk/openai';
import { streamObject } from 'ai';
import { z } from 'zod';

const { elementStream } = streamObject({
  model: openai('gpt-4-turbo'),
  output: 'array',
  schema: z.object({
    name: z.string(),
    class: z
      .string()
      .describe('Character class, e.g. warrior, mage, or thief.'),
    description: z.string(),
  }),
  prompt: 'Generate 3 hero descriptions for a fantasy role playing game.',
});

for await (const hero of elementStream) {
  console.log(hero);
}
```

----------------------------------------

TITLE: Streaming Text with AI SDK using Stream Reader
DESCRIPTION: This snippet shows an alternative approach to stream text using the reader interface from the AI SDK. It creates a stream reader from the text stream and manually processes chunks of text using a while loop with the reader's read() method, continuing until the stream is complete.
SOURCE: https://github.com/vercel/ai/blob/main/content/cookbook/05-node/20-stream-text.mdx#2025-04-23_snippet_1

LANGUAGE: typescript
CODE:
```
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';

const result = streamText({
  model: openai('gpt-3.5-turbo'),
  maxTokens: 512,
  temperature: 0.3,
  maxRetries: 5,
  prompt: 'Invent a new holiday and describe its traditions.'
});

const reader = result.textStream.getReader();

while (true) {
  const { done, value } = await reader.read();
  if (done) {
    break;
  }
  console.log(value);
}
```

----------------------------------------

TITLE: Implementing Text Streaming with OpenAI GPT-4 using AI SDK
DESCRIPTION: This snippet demonstrates how to stream text generation from OpenAI's gpt-4-turbo model using the AI SDK's streamText function. It initializes the stream with a model and prompt, then iterates through the text stream parts as they become available, logging each part to the console.
SOURCE: https://github.com/vercel/ai/blob/main/content/docs/02-foundations/05-streaming.mdx#2025-04-23_snippet_0

LANGUAGE: typescript
CODE:
```
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

const { textStream } = streamText({
  model: openai('gpt-4-turbo'),
  prompt: 'Write a poem about embedding models.',
});

for await (const textPart of textStream) {
  console.log(textPart);
}
```

----------------------------------------

TITLE: Using Streaming Middleware with Language Model
DESCRIPTION: Complete example showing how to integrate the streaming middleware with a non-streaming language model to enable streaming functionality. Demonstrates wrapping the model and processing the stream chunks.
SOURCE: https://github.com/vercel/ai/blob/main/content/docs/07-reference/01-ai-sdk-core/67-simulate-streaming-middleware.mdx#2025-04-23_snippet_1

LANGUAGE: typescript
CODE:
```
import { streamText } from 'ai';
import { wrapLanguageModel } from 'ai';
import { simulateStreamingMiddleware } from 'ai';

// Example with a non-streaming model
const result = streamText({
  model: wrapLanguageModel({
    model: nonStreamingModel,
    middleware: simulateStreamingMiddleware(),
  }),
  prompt: 'Your prompt here',
});

// Now you can use the streaming interface
for await (const chunk of result.fullStream) {
  // Process streaming chunks
}
```

----------------------------------------

TITLE: Handling Streaming Errors in Simple Streams (TypeScript)
DESCRIPTION: This code snippet shows how to handle streaming errors in simple streams that don't support error chunks. It uses a try/catch block to catch errors that may occur during the text streaming process using the streamText function.
SOURCE: https://github.com/vercel/ai/blob/main/content/docs/03-ai-sdk-core/50-error-handling.mdx#2025-04-23_snippet_1

LANGUAGE: typescript
CODE:
```
import { generateText } from 'ai';

try {
  const { textStream } = streamText({
    model: yourModel,
    prompt: 'Write a vegetarian lasagna recipe for 4 people.',
  });

  for await (const textPart of textStream) {
    process.stdout.write(textPart);
  }
} catch (error) {
  // handle error
}
```

----------------------------------------

TITLE: Streaming Object with Promise Handling in TypeScript
DESCRIPTION: Shows how to use the object Promise to handle the final streamed object. Includes error handling for type validation failures and demonstrates consuming the partial object stream.
SOURCE: https://github.com/vercel/ai/blob/main/content/cookbook/05-node/46-stream-object-record-final-object.mdx#2025-04-23_snippet_1

LANGUAGE: typescript
CODE:
```
import { openai } from '@ai-sdk/openai';
import { streamObject } from 'ai';
import { z } from 'zod';

const result = streamObject({
  model: openai('gpt-4-turbo'),
  schema: z.object({
    recipe: z.object({
      name: z.string(),
      ingredients: z.array(z.string()),
      steps: z.array(z.string()),
    }),
  }),
  prompt: 'Generate a lasagna recipe.',
});

result.object
  .then(({ recipe }) => {
    // do something with the fully typed, final object:
    console.log('Recipe:', JSON.stringify(recipe, null, 2));
  })
  .catch(error => {
    // handle type validation failure
    // (when the object does not match the schema):
    console.error(error);
  });

// note: the stream needs to be consumed because of backpressure
for await (const partialObject of result.partialObjectStream) {
}
```

----------------------------------------

TITLE: Fixing Usage Reporting in Streaming Mode
DESCRIPTION: This patch addresses an issue where the XAI provider was returning NaN for usage when streaming. The fix ensures that the actual usage is returned during streaming operations.
SOURCE: https://github.com/vercel/ai/blob/main/packages/xai/CHANGELOG.md#_snippet_0

LANGUAGE: none
CODE:
```
13492fe: fix(providers/xai): return actual usage when streaming instead of NaN
```

----------------------------------------

TITLE: Streaming JSON Without Schema
DESCRIPTION: Demonstrates schema-less JSON streaming using streamObject for unstructured data generation.
SOURCE: https://github.com/vercel/ai/blob/main/content/docs/07-reference/01-ai-sdk-core/04-stream-object.mdx#2025-04-23_snippet_2

LANGUAGE: typescript
CODE:
```
import { openai } from '@ai-sdk/openai';
import { streamObject } from 'ai';

const { partialObjectStream } = streamObject({
  model: openai('gpt-4-turbo'),
  output: 'no-schema',
  prompt: 'Generate a lasagna recipe.',
});

for await (const partialObject of partialObjectStream) {
  console.clear();
  console.log(partialObject);
}
```

----------------------------------------

TITLE: Streaming Text with Image Prompt API Route in Next.js
DESCRIPTION: This server-side code handles the API request for streaming text with an image prompt. It processes the user's message and image URL, sends them to the GPT-4 model, and returns a streamed response.
SOURCE: https://github.com/vercel/ai/blob/main/content/cookbook/01-next/22-stream-text-with-image-prompt.mdx#2025-04-23_snippet_0

LANGUAGE: tsx
CODE:
```
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

export const maxDuration = 60;

export async function POST(req: Request) {
  // 'data' contains the additional data that you have sent:
  const { messages, data } = await req.json();

  const initialMessages = messages.slice(0, -1);
  const currentMessage = messages[messages.length - 1];

  // Call the language model
  const result = streamText({
    model: openai('gpt-4-turbo'),
    messages: [
      ...initialMessages,
      {
        role: 'user',
        content: [
          { type: 'text', text: currentMessage.content },
          { type: 'image', image: new URL(data.imageUrl) },
        ],
      },
    ],
  });

  // Respond with the stream
  return result.toDataStreamResponse();
}
```

----------------------------------------

TITLE: Streaming Text and Accessing Headers with Bedrock (TypeScript)
DESCRIPTION: Illustrates how to use the @ai-sdk/amazon-bedrock provider with streamText to stream text output and then access the response.headers property of the awaited result object after the stream has finished processing. Requires @ai-sdk/amazon-bedrock and ai.
SOURCE: https://github.com/vercel/ai/blob/main/content/providers/01-ai-sdk-providers/08-amazon-bedrock.mdx#_snippet_27

LANGUAGE: TypeScript
CODE:
```
import { bedrock } from '@ai-sdk/amazon-bedrock';
import { streamText } from 'ai';

const result = streamText({
  model: bedrock('meta.llama3-70b-instruct-v1:0'),
  prompt: 'Write a vegetarian lasagna recipe for 4 people.',
});
for await (const textPart of result.textStream) {
  process.stdout.write(textPart);
}
console.log('Response headers:', (await result.response).headers);
```

----------------------------------------

TITLE: Implementing Data Stream API Route in Next.js
DESCRIPTION: Server-side API route handler that processes completion requests and returns streamed responses. Uses OpenAI's GPT-4 model and implements a 30-second timeout for streaming responses.
SOURCE: https://github.com/vercel/ai/blob/main/content/docs/04-ai-sdk-ui/50-stream-protocol.mdx#2025-04-23_snippet_3

LANGUAGE: typescript
CODE:
```
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { prompt }: { prompt: string } = await req.json();

  const result = streamText({
    model: openai('gpt-4o'),
    prompt,
  });

  return result.toDataStreamResponse();
}
```

----------------------------------------

TITLE: Creating Server Action for Streaming AI Responses with OpenAI
DESCRIPTION: A server-side function that processes the conversation history, creates a streamable value, and uses the AI SDK to stream text responses from OpenAI. It returns both the conversation history and the new streamed message to the client.
SOURCE: https://github.com/vercel/ai/blob/main/content/cookbook/20-rsc/21-stream-text-with-chat-prompt.mdx#2025-04-23_snippet_1

LANGUAGE: typescript
CODE:
```
'use server';

import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { createStreamableValue } from 'ai/rsc';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export async function continueConversation(history: Message[]) {
  'use server';

  const stream = createStreamableValue();

  (async () => {
    const { textStream } = streamText({
      model: openai('gpt-3.5-turbo'),
      system:
        "You are a dude that doesn't drop character until the DVD commentary.",
      messages: history,
    });

    for await (const text of textStream) {
      stream.update(text);
    }

    stream.done();
  })();

  return {
    messages: history,
    newMessage: stream.value,
  };
}
```

----------------------------------------

TITLE: Streaming Structured Objects with Schema
DESCRIPTION: Demonstrates using streamObject with Zod schema to generate and stream a structured recipe object from a language model.
SOURCE: https://github.com/vercel/ai/blob/main/content/docs/07-reference/01-ai-sdk-core/04-stream-object.mdx#2025-04-23_snippet_0

LANGUAGE: typescript
CODE:
```
import { openai } from '@ai-sdk/openai';
import { streamObject } from 'ai';
import { z } from 'zod';

const { partialObjectStream } = streamObject({
  model: openai('gpt-4-turbo'),
  schema: z.object({
    recipe: z.object({
      name: z.string(),
      ingredients: z.array(z.string()),
      steps: z.array(z.string()),
    }),
  }),
  prompt: 'Generate a lasagna recipe.',
});

for await (const partialObject of partialObjectStream) {
  console.clear();
  console.log(partialObject);
}
```

----------------------------------------

TITLE: Implementing Text Streaming with OpenAI Chat in TypeScript
DESCRIPTION: Demonstrates how to set up and use text streaming with the AI SDK for chat completions. The code initializes a chat context with system and user messages, configures the GPT-3.5-turbo model, and streams the response using async iteration.
SOURCE: https://github.com/vercel/ai/blob/main/content/cookbook/05-node/21-stream-text-with-chat-prompt.mdx#2025-04-23_snippet_0

LANGUAGE: typescript
CODE:
```
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';

const result = streamText({
  model: openai('gpt-3.5-turbo'),
  maxTokens: 1024,
  system: 'You are a helpful chatbot.',
  messages: [
    {
      role: 'user',
      content: 'Hello!',
    },
    {
      role: 'assistant',
      content: 'Hello! How can I help you today?',
    },
    {
      role: 'user',
      content: 'I need help with my computer.',
    },
  ],
});

for await (const textPart of result.textStream) {
  console.log(textPart);
}
```

----------------------------------------

TITLE: Implementing Server-Side Object Streaming with OpenAI
DESCRIPTION: This server-side route uses the streamObject function to generate and stream objects. It uses OpenAI's GPT-4 model to generate notifications based on a given context.
SOURCE: https://github.com/vercel/ai/blob/main/content/cookbook/01-next/40-stream-object.mdx#2025-04-23_snippet_2

LANGUAGE: typescript
CODE:
```
import { openai } from '@ai-sdk/openai';
import { streamObject } from 'ai';
import { notificationSchema } from './schema';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const context = await req.json();

  const result = streamObject({
    model: openai('gpt-4-turbo'),
    schema: notificationSchema,
    prompt:
      `Generate 3 notifications for a messages app in this context:` + context,
  });

  return result.toTextStreamResponse();
}
```

----------------------------------------

TITLE: Implementing Client-Side Array Streaming in React
DESCRIPTION: This React component demonstrates how to use the useObject hook for streaming an array of objects. It wraps the schema in z.array() to generate an array of notifications.
SOURCE: https://github.com/vercel/ai/blob/main/content/cookbook/01-next/40-stream-object.mdx#2025-04-23_snippet_5

LANGUAGE: tsx
CODE:
```
'use client';

import { experimental_useObject as useObject } from '@ai-sdk/react';
import { notificationSchema } from './api/use-object/schema';

export default function Page() {
  const { object, submit, isLoading, stop } = useObject({
    api: '/api/use-object',
    schema: z.array(notificationSchema),
  });

  return (
    <div>
      <button
        onClick={() => submit('Messages during finals week.')}
        disabled={isLoading}
      >
        Generate notifications
      </button>

      {isLoading && (
        <div>
          <div>Loading...</div>
          <button type="button" onClick={() => stop()}>
            Stop
          </button>
        </div>
      )}

      {object?.map((notification, index) => (
        <div key={index}>
          <p>{notification.name}</p>
          <p>{notification.message}</p>
        </div>
      ))}
    </div>
  );
}
```

----------------------------------------

TITLE: Adding Headers to Data Stream Response in TypeScript/TSX
DESCRIPTION: This snippet demonstrates how to configure the response headers when using the `toDataStreamResponse` method from the Vercel AI SDK. Specifically, it adds the 'Transfer-Encoding': 'chunked' and 'Connection': 'keep-alive' headers. This is suggested as a potential fix for issues where streaming does not work correctly in certain deployment environments, ensuring the server correctly signals chunked transfer and maintains the connection for streaming.
SOURCE: https://github.com/vercel/ai/blob/main/content/docs/09-troubleshooting/06-streaming-not-working-when-deployed.mdx#2025-04-23_snippet_0

LANGUAGE: tsx
CODE:
```
return result.toDataStreamResponse({
  headers: {
    'Transfer-Encoding': 'chunked',
    Connection: 'keep-alive',
  },
});
```

----------------------------------------

TITLE: Implementing Multi-Step Text Streaming on Server-Side with AI SDK
DESCRIPTION: This code snippet demonstrates how to create a multi-step text streaming process using the AI SDK on the server-side. It uses OpenAI models, tool calls, and data stream manipulation to create a workflow with different steps and settings.
SOURCE: https://github.com/vercel/ai/blob/main/content/cookbook/01-next/24-stream-text-multistep.mdx#2025-04-23_snippet_0

LANGUAGE: typescript
CODE:
```
import { openai } from '@ai-sdk/openai';
import { createDataStreamResponse, streamText, tool } from 'ai';
import { z } from 'zod';

export async function POST(req: Request) {
  const { messages } = await req.json();

  return createDataStreamResponse({
    execute: async dataStream => {
      // step 1 example: forced tool call
      const result1 = streamText({
        model: openai('gpt-4o-mini', { structuredOutputs: true }),
        system: 'Extract the user goal from the conversation.',
        messages,
        toolChoice: 'required', // force the model to call a tool
        tools: {
          extractGoal: tool({
            parameters: z.object({ goal: z.string() }),
            execute: async ({ goal }) => goal, // no-op extract tool
          }),
        },
      });

      // forward the initial result to the client without the finish event:
      result1.mergeIntoDataStream(dataStream, {
        experimental_sendFinish: false, // omit the finish event
      });

      // note: you can use any programming construct here, e.g. if-else, loops, etc.
      // workflow programming is normal programming with this approach.

      // example: continue stream with forced tool call from previous step
      const result2 = streamText({
        // different system prompt, different model, no tools:
        model: openai('gpt-4o'),
        system:
          'You are a helpful assistant with a different system prompt. Repeat the extract user goal in your answer.',
        // continue the workflow stream with the messages from the previous step:
        messages: [
          ...convertToCoreMessages(messages),
          ...(await result1.response).messages,
        ],
      });

      // forward the 2nd result to the client (incl. the finish event):
      result2.mergeIntoDataStream(dataStream, {
        experimental_sendStart: false, // omit the start event
      });
    },
  });
}
```

----------------------------------------

TITLE: Streaming Text Responses with File Prompts using Anthropic's Claude Model
DESCRIPTION: This code demonstrates how to stream text responses from Anthropic's Claude 3.5 Sonnet model when providing a PDF file as part of the prompt. It reads a file from disk, includes it in the message content along with a text query, and then streams the model's response to standard output.
SOURCE: https://github.com/vercel/ai/blob/main/content/cookbook/05-node/23-stream-text-with-file-prompt.mdx#2025-04-23_snippet_0

LANGUAGE: typescript
CODE:
```
import { anthropic } from '@ai-sdk/anthropic';
import { streamText } from 'ai';
import 'dotenv/config';
import fs from 'node:fs';

async function main() {
  const result = streamText({
    model: anthropic('claude-3-5-sonnet-20241022'),
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'What is an embedding model according to this document?',
          },
          {
            type: 'file',
            data: fs.readFileSync('./data/ai.pdf'),
            mimeType: 'application/pdf',
          },
        ],
      },
    ],
  });

  for await (const textPart of result.textStream) {
    process.stdout.write(textPart);
  }
}

main().catch(console.error);
```

----------------------------------------

TITLE: Implementing Client-Side Chat Interface with Streaming in React
DESCRIPTION: A React client component that manages a conversation state, handles user input, and streams model responses in real-time. It uses readStreamableValue to process the streamed response and updates the UI as new content arrives.
SOURCE: https://github.com/vercel/ai/blob/main/content/cookbook/20-rsc/21-stream-text-with-chat-prompt.mdx#2025-04-23_snippet_0

LANGUAGE: tsx
CODE:
```
'use client';

import { useState } from 'react';
import { Message, continueConversation } from './actions';
import { readStreamableValue } from 'ai/rsc';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export default function Home() {
  const [conversation, setConversation] = useState<Message[]>([]);
  const [input, setInput] = useState<string>('');

  return (
    <div>
      <div>
        {conversation.map((message, index) => (
          <div key={index}>
            {message.role}: {message.content}
          </div>
        ))}
      </div>

      <div>
        <input
          type="text"
          value={input}
          onChange={event => {
            setInput(event.target.value);
          }}
        />
        <button
          onClick={async () => {
            const { messages, newMessage } = await continueConversation([
              ...conversation,
              { role: 'user', content: input },
            ]);

            let textContent = '';

            for await (const delta of readStreamableValue(newMessage)) {
              textContent = `${textContent}${delta}`;

              setConversation([
                ...messages,
                { role: 'assistant', content: textContent },
              ]);
            }
          }}
        >
          Send Message
        </button>
      </div>
    </div>
  );
}
```

----------------------------------------

TITLE: Returning Data Stream Response Using AI SDK with Uncompressed Header in TypeScript
DESCRIPTION: This snippet demonstrates how to invoke the AI SDK's response streaming functionality by using the toDataStreamResponse method and setting the 'Content-Encoding' header to 'none'. This header modification disables response compression imposed by intermediaries, allowing streaming to function correctly through proxy middleware. To use, ensure your result object provides the toDataStreamResponse method, and apply the custom headers as shown; the returned response will stream data incrementally to the client instead of buffering the entire payload.
SOURCE: https://github.com/vercel/ai/blob/main/content/docs/09-troubleshooting/06-streaming-not-working-when-proxied.mdx#2025-04-23_snippet_0

LANGUAGE: TSX
CODE:
```
return result.toDataStreamResponse({
  headers: {
    'Content-Encoding': 'none',
  },
});
```

----------------------------------------

TITLE: Streaming Text with AI SDK using For-Await Loop
DESCRIPTION: This snippet demonstrates how to stream text from an OpenAI model using the AI SDK with a for-await loop. It configures parameters including the model, maximum tokens, temperature, and retry settings, then iterates through the text stream to display content as it's generated.
SOURCE: https://github.com/vercel/ai/blob/main/content/cookbook/05-node/20-stream-text.mdx#2025-04-23_snippet_0

LANGUAGE: typescript
CODE:
```
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';

const result = streamText({
  model: openai('gpt-3.5-turbo'),
  maxTokens: 512,
  temperature: 0.3,
  maxRetries: 5,
  prompt: 'Invent a new holiday and describe its traditions.'
});

for await (const textPart of result.textStream) {
  console.log(textPart);
}
```

----------------------------------------

TITLE: Implementing Client-Side Object Streaming in React
DESCRIPTION: This React component uses the useObject hook to stream object generation. It renders a button to trigger generation and displays the notifications as they are received.
SOURCE: https://github.com/vercel/ai/blob/main/content/cookbook/01-next/40-stream-object.mdx#2025-04-23_snippet_1

LANGUAGE: tsx
CODE:
```
'use client';

import { experimental_useObject as useObject } from '@ai-sdk/react';
import { notificationSchema } from './api/use-object/schema';

export default function Page() {
  const { object, submit } = useObject({
    api: '/api/use-object',
    schema: notificationSchema,
  });

  return (
    <div>
      <button onClick={() => submit('Messages during finals week.')}>
        Generate notifications
      </button>

      {object?.notifications?.map((notification, index) => (
        <div key={index}>
          <p>{notification?.name}</p>
          <p>{notification?.message}</p>
        </div>
      ))}
    </div>
  );
}
```

----------------------------------------

TITLE: Processing Streamed Text Chunks with AI SDK in TypeScript
DESCRIPTION: Shows how to use the onChunk callback to process individual chunks of the streamed text. This example logs text delta chunks to the console.
SOURCE: https://github.com/vercel/ai/blob/main/content/docs/03-ai-sdk-core/05-generating-text.mdx#2025-04-23_snippet_5

LANGUAGE: tsx
CODE:
```
import { streamText } from 'ai';

const result = streamText({
  model: yourModel,
  prompt: 'Invent a new holiday and describe its traditions.',
  onChunk({ chunk }) {
    // implement your own logic here, e.g.:
    if (chunk.type === 'text-delta') {
      console.log(chunk.text);
    }
  },
});
```

----------------------------------------

TITLE: Streaming Text with Portkey and Vercel AI SDK - JavaScript
DESCRIPTION: This JavaScript snippet illustrates how to use the streamText function together with Portkey's completion model to asynchronously stream generated text chunks. The code sets up a Portkey provider and calls streamText with a prompt, then iterates over the streamed result. Useful for progressively rendering output. Dependencies: @portkey-ai/vercel-provider, ai. The provider must be properly configured.
SOURCE: https://github.com/vercel/ai/blob/main/content/providers/03-community-providers/10-portkey.mdx#2025-04-23_snippet_4

LANGUAGE: javascript
CODE:
```
import { createPortkey } from '@portkey-ai/vercel-provider';
import { streamText } from 'ai';

const portkey = createPortkey({
  apiKey: 'YOUR_PORTKEY_API_KEY',
  config: portkeyConfig,
});

const result = streamText({
  model: portkey.completionModel(''),
  prompt: 'Invent a new holiday and describe its traditions.',
});

for await (const chunk of result) {
  console.log(chunk);
}
```

----------------------------------------

TITLE: Implementing Client-Side Text Stream Consumer in React
DESCRIPTION: A React component that handles text generation streaming using the readStreamableValue function. It maintains the generated text in state and updates it as new chunks arrive from the stream.
SOURCE: https://github.com/vercel/ai/blob/main/content/cookbook/20-rsc/20-stream-text.mdx#2025-04-23_snippet_0

LANGUAGE: tsx
CODE:
```
'use client';

import { useState } from 'react';
import { generate } from './actions';
import { readStreamableValue } from 'ai/rsc';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export default function Home() {
  const [generation, setGeneration] = useState<string>('');

  return (
    <div>
      <button
        onClick={async () => {
          const { output } = await generate('Why is the sky blue?');

          for await (const delta of readStreamableValue(output)) {
            setGeneration(currentGeneration => `${currentGeneration}${delta}`);
          }
        }}
      >
        Ask
      </button>

      <div>{generation}</div>
    </div>
  );
}
```

----------------------------------------

TITLE: Using createDataStream with Multiple Stream Operations
DESCRIPTION: Demonstrates creating a data stream with writing data, annotations, and merging streams. Shows the complete usage pattern including error handling and stream execution.
SOURCE: https://github.com/vercel/ai/blob/main/content/docs/07-reference/02-ai-sdk-ui/40-create-data-stream.mdx#2025-04-23_snippet_1

LANGUAGE: tsx
CODE:
```
const stream = createDataStream({
  async execute(dataStream) {
    // Write data
    dataStream.writeData({ value: 'Hello' });

    // Write annotation
    dataStream.writeMessageAnnotation({ type: 'status', value: 'processing' });

    // Merge another stream
    const otherStream = getAnotherStream();
    dataStream.merge(otherStream);
  },
  onError: error => `Custom error: ${error.message}`,
});
```

----------------------------------------

TITLE: Handling GET Requests for Resuming Streams in Next.js API
DESCRIPTION: This snippet implements the GET handler for the `/api/chat` route. It reads a `chatId` from the query string, loads associated stream IDs, and returns the latest one to `streamContext.resumableStream()` to allow clients to resume the stream. It includes error handling for missing IDs or streams.
SOURCE: https://github.com/vercel/ai/blob/main/content/docs/04-ai-sdk-ui/03-chatbot-message-persistence.mdx#_snippet_14

LANGUAGE: TypeScript
CODE:
```
import { loadStreams } from '@/util/chat-store';
import { createDataStream } from 'ai';
import { after } from 'next/server';
import { createResumableStreamContext } from 'resumable-stream';

const streamContext = createResumableStreamContext({
  waitUntil: after,
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const chatId = searchParams.get('chatId');

  if (!chatId) {
    return new Response('id is required', { status: 400 });
  }

  const streamIds = await loadStreams(chatId);

  if (!streamIds.length) {
    return new Response('No streams found', { status: 404 });
  }

  const recentStreamId = streamIds.at(-1);

  if (!recentStreamId) {
    return new Response('No recent stream found', { status: 404 });
  }

  const emptyDataStream = createDataStream({
    execute: () => {},
  });

  return new Response(
    await streamContext.resumableStream(recentStreamId, () => emptyDataStream),
  );
}
```

----------------------------------------

TITLE: Creating a Message Component for Displaying Streamed Text
DESCRIPTION: A client component that utilizes the useStreamableValue hook to display text streamed from the server. It's responsible for rendering the message content as it arrives.
SOURCE: https://github.com/vercel/ai/blob/main/content/cookbook/20-rsc/120-stream-assistant-response.mdx#2025-04-23_snippet_1

LANGUAGE: tsx
CODE:
```
'use client';

import { StreamableValue, useStreamableValue } from 'ai/rsc';

export function Message({ textStream }: { textStream: StreamableValue }) {
  const [text] = useStreamableValue(textStream);

  return <div>{text}</div>;
}
```

----------------------------------------

TITLE: Implementing Server-Side Array Streaming with OpenAI
DESCRIPTION: This server-side route demonstrates how to use the streamObject function in array output mode. It generates an array of notifications using OpenAI's GPT-4 model.
SOURCE: https://github.com/vercel/ai/blob/main/content/cookbook/01-next/40-stream-object.mdx#2025-04-23_snippet_6

LANGUAGE: typescript
CODE:
```
import { openai } from '@ai-sdk/openai';
import { streamObject } from 'ai';
import { notificationSchema } from './schema';

export const maxDuration = 30;

export async function POST(req: Request) {
  const context = await req.json();

  const result = streamObject({
    model: openai('gpt-4-turbo'),
    output: 'array',
    schema: notificationSchema,
    prompt:
      `Generate 3 notifications for a messages app in this context:` + context,
  });

  return result.toTextStreamResponse();
}
```

----------------------------------------

TITLE: Converting LlamaIndex ChatEngine Stream to Data Stream Response
DESCRIPTION: Demonstrates how to create a POST endpoint that uses LlamaIndex ChatEngine with OpenAI and converts its output stream to a data stream response. It initializes a chat engine with GPT-4 and processes prompt inputs with streaming enabled.
SOURCE: https://github.com/vercel/ai/blob/main/content/docs/07-reference/04-stream-helpers/16-llamaindex-adapter.mdx#2025-04-23_snippet_1

LANGUAGE: tsx
CODE:
```
import { OpenAI, SimpleChatEngine } from 'llamaindex';
import { LlamaIndexAdapter } from 'ai';

export async function POST(req: Request) {
  const { prompt } = await req.json();

  const llm = new OpenAI({ model: 'gpt-4o' });
  const chatEngine = new SimpleChatEngine({ llm });

  const stream = await chatEngine.chat({
    message: prompt,
    stream: true,
  });

  return LlamaIndexAdapter.toDataStreamResponse(stream);
}
```

----------------------------------------

TITLE: Using pipeDataStreamToResponse Function - TypeScript/TSX
DESCRIPTION: Demonstrates how to use pipeDataStreamToResponse to handle streaming data with custom headers, data writing, annotations, and stream merging. Includes error handling and status code configuration.
SOURCE: https://github.com/vercel/ai/blob/main/content/docs/07-reference/02-ai-sdk-ui/42-pipe-data-stream-to-response.mdx#2025-04-23_snippet_1

LANGUAGE: tsx
CODE:
```
pipeDataStreamToResponse(serverResponse, {
  status: 200,
  statusText: 'OK',
  headers: {
    'Custom-Header': 'value',
  },
  async execute(dataStream) {
    // Write data
    dataStream.writeData({ value: 'Hello' });

    // Write annotation
    dataStream.writeMessageAnnotation({ type: 'status', value: 'processing' });

    // Merge another stream
    const otherStream = getAnotherStream();
    dataStream.merge(otherStream);
  },
  onError: error => `Custom error: ${error.message}`,
});
```

----------------------------------------

TITLE: Client-Side Stream Cancellation with useCompletion Hook
DESCRIPTION: Shows how to implement client-side stream cancellation using the useCompletion hook from the AI SDK UI. The example includes a stop button that appears during submission or streaming states.
SOURCE: https://github.com/vercel/ai/blob/main/content/docs/06-advanced/02-stopping-streams.mdx#2025-04-23_snippet_1

LANGUAGE: tsx
CODE:
```
'use client';

import { useCompletion } from '@ai-sdk/react';

export default function Chat() {
  const { input, completion, stop, status, handleSubmit, handleInputChange } =
    useCompletion();

  return (
    <div>
      {(status === 'submitted' || status === 'streaming') && (
        <button type="button" onClick={() => stop()}>
          Stop
        </button>
      )}
      {completion}
      <form onSubmit={handleSubmit}>
        <input value={input} onChange={handleInputChange} />
      </form>
    </div>
  );
}
```

----------------------------------------

TITLE: Smoothing Azure OpenAI Streams with AI SDK
DESCRIPTION: This code snippet demonstrates how to use the smoothStream transformation function from the AI SDK to improve streaming performance with Azure OpenAI. It applies a transformation to ensure words are streamed individually rather than in large chunks.
SOURCE: https://github.com/vercel/ai/blob/main/content/docs/09-troubleshooting/01-azure-stream-slow.mdx#2025-04-23_snippet_0

LANGUAGE: tsx
CODE:
```
import { smoothStream, streamText } from 'ai';

const result = streamText({
  model,
  prompt,
  experimental_transform: smoothStream(),
});
```

----------------------------------------

TITLE: Server-Side Object Stream Generation with OpenAI
DESCRIPTION: Server action that implements object streaming using OpenAI's GPT-4 model. Uses Zod for schema validation and handles stream generation and updates through the AI SDK.
SOURCE: https://github.com/vercel/ai/blob/main/content/cookbook/20-rsc/40-stream-object.mdx#2025-04-23_snippet_1

LANGUAGE: typescript
CODE:
```
'use server';

import { streamObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { createStreamableValue } from 'ai/rsc';
import { z } from 'zod';

export async function generate(input: string) {
  'use server';

  const stream = createStreamableValue();

  (async () => {
    const { partialObjectStream } = streamObject({
      model: openai('gpt-4-turbo'),
      system: 'You generate three notifications for a messages app.',
      prompt: input,
      schema: z.object({
        notifications: z.array(
          z.object({
            name: z.string().describe('Name of a fictional person.'),
            message: z.string().describe('Do not use emojis or links.'),
            minutesAgo: z.number(),
          }),
        ),
      }),
    });

    for await (const partialObject of partialObjectStream) {
      stream.update(partialObject);
    }

    stream.done();
  })();

  return { object: stream.value };
}
```

----------------------------------------

TITLE: Implementing Text Stream Protocol in Backend API Route
DESCRIPTION: Next.js API route implementation for handling text stream completion requests. Shows how to use streamText with OpenAI and convert the result to a text stream response.
SOURCE: https://github.com/vercel/ai/blob/main/content/docs/04-ai-sdk-ui/50-stream-protocol.mdx#2025-04-23_snippet_1

LANGUAGE: typescript
CODE:
```
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { prompt }: { prompt: string } = await req.json();

  const result = streamText({
    model: openai('gpt-4o'),
    prompt,
  });

  return result.toTextStreamResponse();
}
```

----------------------------------------

TITLE: simulateReadableStream without Delays
DESCRIPTION: Shows how to create a stream that emits chunks immediately without any delays between emissions.
SOURCE: https://github.com/vercel/ai/blob/main/content/docs/07-reference/01-ai-sdk-core/75-simulate-readable-stream.mdx#2025-04-23_snippet_3

LANGUAGE: typescript
CODE:
```
const stream = simulateReadableStream({
  chunks: ['Hello', ' ', 'World'],
  initialDelayInMs: null, // No initial delay
  chunkDelayInMs: null, // No delay between chunks
});
```

----------------------------------------

TITLE: Rendering Streamable Message Component in React
DESCRIPTION: This client-side component renders a message using a streamable value. It utilizes the useStreamableValue hook from ai/rsc to handle the streaming of text content.
SOURCE: https://github.com/vercel/ai/blob/main/content/cookbook/20-rsc/121-stream-assistant-response-with-tools.mdx#2025-04-23_snippet_1

LANGUAGE: tsx
CODE:
```
'use client';

import { StreamableValue, useStreamableValue } from 'ai/rsc';

export function Message({ textStream }: { textStream: StreamableValue }) {
  const [text] = useStreamableValue(textStream);

  return <div>{text}</div>;
}
```

----------------------------------------

TITLE: Implementing Client-Side Object Streaming with React
DESCRIPTION: A React client component that handles streaming object generation. Uses useState for state management and implements a button click handler to trigger object generation and stream updates.
SOURCE: https://github.com/vercel/ai/blob/main/content/cookbook/20-rsc/40-stream-object.mdx#2025-04-23_snippet_0

LANGUAGE: tsx
CODE:
```
'use client';

import { useState } from 'react';
import { generate } from './actions';
import { readStreamableValue } from 'ai/rsc';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export default function Home() {
  const [generation, setGeneration] = useState<string>('');

  return (
    <div>
      <button
        onClick={async () => {
          const { object } = await generate('Messages during finals week.');

          for await (const partialObject of readStreamableValue(object)) {
            if (partialObject) {
              setGeneration(
                JSON.stringify(partialObject.notifications, null, 2),
              );
            }
          }
        }}
      >
        Ask
      </button>

      <pre>{generation}</pre>
    </div>
  );
}
```

----------------------------------------

TITLE: Handling Streaming Errors with Error Support (TypeScript)
DESCRIPTION: This snippet illustrates how to handle streaming errors in full streams that support error parts. It uses a switch statement to handle different part types, including error parts, and includes a try/catch block for errors that occur outside of streaming.
SOURCE: https://github.com/vercel/ai/blob/main/content/docs/03-ai-sdk-core/50-error-handling.mdx#2025-04-23_snippet_2

LANGUAGE: typescript
CODE:
```
import { generateText } from 'ai';

try {
  const { fullStream } = streamText({
    model: yourModel,
    prompt: 'Write a vegetarian lasagna recipe for 4 people.',
  });

  for await (const part of fullStream) {
    switch (part.type) {
      // ... handle other part types

      case 'error': {
        const error = part.error;
        // handle error
        break;
      }
    }
  }
} catch (error) {
  // handle error
}
```

----------------------------------------

TITLE: Smoothing Text Streams with AI SDK in TypeScript
DESCRIPTION: Demonstrates how to use the smoothStream function to smooth out text streaming, which can be applied as a transformation to the streamText function.
SOURCE: https://github.com/vercel/ai/blob/main/content/docs/03-ai-sdk-core/05-generating-text.mdx#2025-04-23_snippet_8

LANGUAGE: tsx
CODE:
```
import { smoothStream, streamText } from 'ai';

const result = streamText({
  model,
  prompt,
  experimental_transform: smoothStream(),
});
```

----------------------------------------

TITLE: Implementing Text Stream Protocol in React Frontend
DESCRIPTION: Example of using useCompletion hook with text stream protocol in a Next.js client component. Shows how to set up a basic form with streaming completion responses.
SOURCE: https://github.com/vercel/ai/blob/main/content/docs/04-ai-sdk-ui/50-stream-protocol.mdx#2025-04-23_snippet_0

LANGUAGE: tsx
CODE:
```
'use client';

import { useCompletion } from '@ai-sdk/react';

export default function Page() {
  const { completion, input, handleInputChange, handleSubmit } = useCompletion({
    streamProtocol: 'text',
  });

  return (
    <form onSubmit={handleSubmit}>
      <input name="prompt" value={input} onChange={handleInputChange} />
      <button type="submit">Submit</button>
      <div>{completion}</div>
    </form>
  );
}

```