'use client';

import Webcam from 'react-webcam';
import { useRef, useState, useEffect } from 'react'

let screenShotInterval: ReturnType<typeof setInterval> = null!;

export default function Chat() {
  const [screenshot, setScreenshot] = useState('');
  const [postureDescription, setPostureDescription] = useState('');
  const [isStarted, setIsStarted] = useState(false);

  const webcamRef = useRef<Webcam & HTMLVideoElement>(null);

  useEffect(() => {
    if (!("Notification" in window)) {
      alert("This browser does not support system notifications!")
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission((permission) => {
        console.log(permission);
      })
    }
  }, [])


  async function takeScreenshot() {
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

    const data = JSON.parse(await resp.json());

    console.log(data);

    if (data.status === 'bad') {
      sendNotification(data.reason);
    }

    setPostureDescription(data.reason);

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

  function sendNotification(reason: string): void {
    if (Notification.permission === "granted") {
      console.log("sending notification");
      new Notification('Bad Posture Detected');
    }
  }

  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
      />
      <br />
      {screenshot !== '' && (
        <img
          src={screenshot}
        />
      )}
      <div>
        {screenshot ? `Posture description: ${postureDescription}` : ''}
      </div>
      <button className='h-10 px-6 font-semibold rounded-md bg-black text-white' onClick={() => handleStartStopOnClick(isStarted)}>
        {isStarted ? 'Stop' : 'Start'}
      </button>

    </div>
  );
}
