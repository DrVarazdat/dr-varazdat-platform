"use client";
import { useEffect } from 'react';

export default function BotpressChat() {
  useEffect(() => {
    if (document.getElementById("botpress-inject")) return;

    const injectScript = document.createElement('script');
    injectScript.id = "botpress-inject";
    injectScript.src = 'https://cdn.botpress.cloud/webchat/v2.2/inject.js';
    injectScript.async = true;
    document.body.appendChild(injectScript);

    injectScript.onload = () => {
       if (window.botpress) {
         window.botpress.init({
            botId: "0bf385fc-8f77-4957-9854-0144e63f284d", 
            clientId: "0bf385fc-8f77-4957-9854-0144e63f284d",
            theme: "prism",
            themeColor: "#1e3a8a", 
         });
       }
    };
  }, []);
  
  return null;
}