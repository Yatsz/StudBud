"use client";

import React, { useRef, useEffect, useState } from 'react';
import { TextGenerateEffect } from "./ui/text-generate-effect";

const BeaverIcon = () => (
    <svg width="76" height="76" viewBox="0 0 76 76" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M23.1136 22.328C20.0804 25.993 23.9561 28.0678 26.2731 28.647C24.7317 29.748 24.1975 38.5222 24.0854 44.4204C24.0585 45.8365 25.0013 47.0906 26.3872 47.3824C35.147 49.2266 45.2896 48.2502 50.9463 47.2243C52.1837 46.9999 53.1392 46.0162 53.2528 44.7638C53.8239 38.4681 52.0079 31.2547 50.9174 28.1731C55.9727 26.9093 54.7089 23.7498 53.4451 22.328C50.9174 19.4844 48.3898 21.9594 46.968 23.9078C40.2698 16.8304 32.2762 20.9589 29.1167 23.9078C26.5891 19.7372 24.0615 21.1168 23.1136 22.328Z" fill="#D9D9D9" stroke="black" stroke-width="0.631906"/>
<path d="M35.4277 39.5894C36.5336 41.9063 39.314 45.1501 41.5888 39.5894" stroke="black" stroke-width="0.631906" stroke-linecap="round"/>
<path d="M40.6416 33.4277H37.3241C35.5548 33.4277 35.2704 34.5336 35.9024 35.3235L37.103 36.2239C37.5542 36.5623 38.1029 36.7452 38.6669 36.7452C39.2309 36.7452 39.7797 36.5623 40.2309 36.2239L41.4315 35.3235C42.3162 34.186 41.2735 33.5857 40.6416 33.4277Z" fill="black" stroke="black" stroke-width="0.315953"/>
<ellipse cx="31.6357" cy="31.6902" rx="2.05369" ry="2.21167" fill="black"/>
<ellipse cx="45.5381" cy="31.6902" rx="2.05369" ry="2.21167" fill="black"/>
<path d="M38.7461 36.9033C39.8519 38.799 42.7271 41.611 45.3811 37.6932" stroke="black" stroke-width="0.631906" stroke-linecap="round"/>
<path d="M38.7461 36.7451C37.6403 38.6408 34.7651 41.4528 32.1111 37.535" stroke="black" stroke-width="0.631906" stroke-linecap="round"/>
<ellipse cx="30.5308" cy="30.9002" rx="0.315953" ry="0.473929" fill="#D9D9D9"/>
<ellipse cx="44.7486" cy="30.9002" rx="0.315953" ry="0.473929" fill="#D9D9D9"/>
<path d="M38.7461 37.0615V42.5907" stroke="black" stroke-width="0.631906"/>
<g filter="url(#filter0_d_74_1049)">
<circle cx="38" cy="34" r="22" fill="#E97E7E"/>
</g>
<path d="M24.3899 23.3191C21.6096 26.6787 25.1623 28.5805 27.2862 29.1115C25.8732 30.1208 25.3835 38.1638 25.2807 43.5704C25.2561 44.8685 26.1203 46.0181 27.3908 46.2856C35.4206 47.9761 44.718 47.0811 49.9032 46.1407C51.0375 45.9349 51.9134 45.0332 52.0176 43.8852C52.541 38.1142 50.8763 31.5019 49.8768 28.6771C54.5108 27.5186 53.3523 24.6224 52.1938 23.3191C49.8768 20.7124 47.5598 22.9812 46.2565 24.7672C40.1165 18.2796 32.789 22.064 29.8928 24.7672C27.5758 20.9441 25.2588 22.2088 24.3899 23.3191Z" fill="#923F1E" stroke="black" stroke-width="0.579247"/>
<path d="M38.5744 37.2588L36.1126 39.2862L35.9678 39.5758L37.2711 41.1687L39.0088 41.8928L40.3121 41.0239L41.0362 39.1413L38.5744 37.2588Z" fill="white" stroke="white" stroke-width="0.289623"/>
<path d="M35.6777 39.1411C36.6914 41.265 39.2401 44.2385 41.3254 39.1411" stroke="black" stroke-width="0.579247" stroke-linecap="round"/>
<path d="M40.4575 33.4937H37.4164C35.7945 33.4937 35.5338 34.5073 36.1131 35.2314L37.2137 36.0568C37.6273 36.367 38.1303 36.5347 38.6473 36.5347C39.1643 36.5347 39.6674 36.367 40.081 36.0568L41.1815 35.2314C41.9925 34.1887 41.0367 33.6385 40.4575 33.4937Z" fill="black" stroke="black" stroke-width="0.289623"/>
<ellipse cx="32.2029" cy="31.9009" rx="1.88255" ry="2.02736" fill="black"/>
<ellipse cx="44.946" cy="31.9009" rx="1.88255" ry="2.02736" fill="black"/>
<path d="M38.7188 36.6792C39.7324 38.4169 42.368 40.9946 44.8008 37.4033" stroke="black" stroke-width="0.579247" stroke-linecap="round"/>
<path d="M38.7188 36.5347C37.7051 38.2724 35.0695 40.8501 32.6367 37.2587" stroke="black" stroke-width="0.579247" stroke-linecap="round"/>
<ellipse cx="31.189" cy="31.1761" rx="0.289623" ry="0.434435" fill="#D9D9D9"/>
<ellipse cx="44.2213" cy="31.1761" rx="0.289623" ry="0.434435" fill="#D9D9D9"/>
<path d="M38.7188 36.8242V41.8926" stroke="black" stroke-width="0.579247"/>
<defs>
<filter id="filter0_d_74_1049" x="0" y="0" width="76" height="76" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset dy="4"/>
<feGaussianBlur stdDeviation="8"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_74_1049"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_74_1049" result="shape"/>
</filter>
</defs>
</svg>

  );

  const LoadingMessage = () => {
    const [dots, setDots] = useState('');
  
    useEffect(() => {
      const interval = setInterval(() => {
        setDots(prevDots => {
          if (prevDots.length >= 3) return '';
          return prevDots + '.';
        });
      }, 1000);
  
      return () => clearInterval(interval);
    }, []);
  
    return <span>{dots}</span>;
  };
  
  const Message = ({ message }) => (
    <div className="flex items-start space-x-4 mb-4">
      <div className="flex-shrink-0">
        <BeaverIcon />
      </div>
      <div className="flex-grow mt-[10px]">
      {message.startsWith('Loading') ? (
        <LoadingMessage />
      ) : (
        <TextGenerateEffect words={message} />
      )}
      </div>
    </div>
  );
  
  const ChatHistory = ({ messages, isLoading }) => {
    const scrollableRef = useRef(null);
  
    const scrollToBottom = () => {
      if (scrollableRef.current) {
        scrollableRef.current.scrollTop = scrollableRef.current.scrollHeight;
      }
    };
  
    useEffect(() => {
      scrollToBottom();
    }, [messages]);
  
    return (
      <div className="w-[463px] h-[414px] bg-[#F7F5ED] rounded-tl-[100px] rounded-tr-[100px] rounded-br-[100px] p-8 flex flex-col">
        <div 
          ref={scrollableRef}
          className="flex-grow overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
        >
          {messages.map((msg, index) => (
            <Message key={index} message={msg} />
          ))}
          {isLoading && <Message message="Loading" />}
        </div>
      </div>
    );
  };
  
  export default ChatHistory;