'use client';

import { useChat } from 'ai/react';
import Webcam from 'react-webcam';
import { useRef, useState } from 'react'

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: '/api/chat-with-vision',
  });

  const [screenshot, setScreenshot] = useState('');

  const webcamRef = useRef<Webcam & HTMLVideoElement>(null);

  const takeScreenshot = () => {
    if (!webcamRef.current) {
      return;
    }

    const screenshot = webcamRef.current!.getScreenshot();
    console.log(screenshot);

    if (!screenshot) {
      return;
    }

    setScreenshot(screenshot);
  }

  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
      />
      <button onClick={takeScreenshot}>
        Capture photo
      </button>

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
