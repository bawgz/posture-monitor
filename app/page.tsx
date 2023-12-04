'use client';

import Webcam from 'react-webcam';
import { useRef, useState, useEffect } from 'react'
import useSound from 'use-sound';

let screenShotInterval: ReturnType<typeof setInterval> = null!;

export default function Chat() {
  const [screenshot, setScreenshot] = useState('');
  const [postureDescription, setPostureDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [play] = useSound('/beep-warning.mp3');

  const webcamRef = useRef<Webcam & HTMLVideoElement>(null);

  useEffect(() => {
    if ("Notification" in window && Notification.permission !== "denied") {
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
    setIsLoading(true);

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
    setIsLoading(false);
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
    if ("Notification" in window && Notification.permission === "granted") {
      console.log("sending notification");
      new Notification('Bad Posture Detected');
      play();
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
      {
        screenshot ?
          <section className="bg-white">
            <div className="py-8 px-4 mx-auto max-w-screen-xl lg:py-16 lg:px-6">
              <div className="max-w-screen-lg text-black">
                <h4 className="mb-4 text-4xl tracking-tight font-bold">Posture Description</h4>
                <p className="mb-4 font-light">{isLoading ? 'Loading...' : postureDescription}</p>
              </div>
            </div>
          </section>
          :
          <span />
      }
      <button className='h-10 px-6 font-semibold rounded-md bg-black text-white' onClick={() => handleStartStopOnClick(isStarted)}>
        {isStarted ? 'Stop' : 'Start'}
      </button>

    </div>
  );
}
