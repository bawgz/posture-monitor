'use client';

import Webcam from 'react-webcam';
import { useRef, useState, useEffect } from 'react'
import useSound from 'use-sound';
import ModalImage from 'react-modal-image';

let screenShotInterval: ReturnType<typeof setInterval> = null!;

export default function Chat() {
  const [screenshot, setScreenshot] = useState('');
  const [postureDescription, setPostureDescription] = useState('');
  const [postureRating, setPostureRating] = useState('');
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

    const data = await resp.json();

    console.log(data);

    if (data.status === 'bad') {
      sendNotification(data.reason);
    }

    setPostureDescription(data.reason);
    setPostureRating(data.rating);
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
    <div className="flex flex-col items-center w-full max-w-2xl py-10 mx-auto stretch">
      <div className='relative'>
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          mirrored={true}
        />
        <button
          className='absolute h-10 bottom-0 w-full font-semibold rounded-md bg-black/40 text-white'
          onClick={() => handleStartStopOnClick(isStarted)}>
          {isStarted ? 'Stop' : 'Start'}
        </button>
      </div>
      {
        screenshot ?
          <section className="bg-gray-100 w-full">
            <div className="py-4 px-4 mx-auto max-w-screen-xl lg:px-6">
              <div className="max-w-screen-lg text-black">
                <h4 className="mb-4 text-4xl tracking-tight font-bold">Assessment</h4>
                <p className="mb-4 font-dark">{isLoading ? '' : `Rating: ${postureRating}`}</p>
                <p className="mb-4 font-light">{isLoading ? 'Loading...' : postureDescription}</p>
              </div>
            </div>
            <div className="flex justify-center mb-4">
              <div className="w-1/4">
                <ModalImage
                  small={screenshot}
                  medium={screenshot}
                  hideDownload={true}
                  hideZoom={true}
                  alt="Posture sampled"
                />
              </div>
            </div>
          </section>
          :
          <span />
      }
    </div>
  );
}
