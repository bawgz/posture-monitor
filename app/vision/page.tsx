'use client';

import { useChat } from 'ai/react';
import Webcam from 'react-webcam';
import { useState } from 'react';

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: '/api/chat-with-vision',
  });

  const [screenshot, setScreenshot] = useState('');

  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      <Webcam
        audio={false}
        screenshotFormat="image/jpeg"
      >
        {({ getScreenshot }) => (
          <button
            onClick={(event) => {
              const screenshot = getScreenshot();
              console.log(screenshot);
              handleSubmit(event, { data: { imageUrl: screenshot } });
              setScreenshot(screenshot);
            }}
          >
            Capture photo
          </button>
        )}
      </Webcam>
      {messages.length > 0
        ? messages.map(m => (
          <div key={m.id} className="whitespace-pre-wrap">
            {m.role === 'user' ? 'User: ' : 'AI: '}
            {m.content}
          </div>
        ))
        : null}

      <form
        onSubmit={e => {
          handleSubmit(e, {
            data: {
              imageUrl: screenshot,
            },
          });
        }}
      >
        <input
          className="fixed bottom-0 w-full max-w-md p-2 mb-8 border border-gray-300 rounded shadow-xl"
          value={input}
          placeholder="What does the image show..."
          onChange={handleInputChange}
        />
      </form>

      {screenshot !== '' && (
        <img
          src={screenshot}
        />
      )}

    </div>
  );
}
