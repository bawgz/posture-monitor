'use client';

import Webcam from 'react-webcam';
import { useRef, useState } from 'react'

let screenShotInterval: ReturnType<typeof setInterval> = null!;

export default function Chat() {
  const [screenshot, setScreenshot] = useState('');
  const [isStarted, setIsStarted] = useState(false);

  const webcamRef = useRef<Webcam & HTMLVideoElement>(null);

  const takeScreenshot = async () => {
    console.log(`taking screenshot at ${new Date().toLocaleTimeString()}`);
    if (!webcamRef.current) {
      return;
    }

    const screenshot = webcamRef.current!.getScreenshot();

    if (!screenshot) {
      return;
    }

    setScreenshot(screenshot);

    const resp = await fetch(
      '/api/chat-with-vision',
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: {
            imageUrl: screenshot,
          }
        }),
      });

    console.log(await resp.json());
  }

  function handleStartStopOnClick(isStarted: boolean): void {
    if (!isStarted) {
      takeScreenshot()
        .catch(console.error);
      screenShotInterval = setInterval(() => {
        takeScreenshot()
          .catch(console.error);
      }, 30000);
      console.log(screenShotInterval);
    } else {
      clearInterval(screenShotInterval);
    }

    setIsStarted(!isStarted);
  }

  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
      />

      {screenshot !== '' && (
        <img
          src={screenshot}
        />
      )}

      <button onClick={() => handleStartStopOnClick(isStarted)}>
        {isStarted ? 'Stop' : 'Start'}
      </button>

    </div>
  );
}
