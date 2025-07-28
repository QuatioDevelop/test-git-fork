'use client';

import { useState } from 'react';

interface ChatIframeProps {
  roomID?: string; // Optional, will use env var if not provided
  nombre: string;
  userID: string;
  width?: number | string;
  height?: number | string;
  className?: string;
}

export default function ChatIframe({
  roomID,
  nombre,
  userID,
  width = '100%',
  height = 400,
  className = ''
}: ChatIframeProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use environment variables for chat configuration
  const chatBaseUrl = process.env.NEXT_PUBLIC_CHAT_BASE_URL || 'https://chat.quatio.co/chat';
  const defaultRoomID = process.env.NEXT_PUBLIC_CHAT_ROOM_ID || '18082025';
  const effectiveRoomID = roomID || defaultRoomID;

  const chatUrl = `${chatBaseUrl}?roomID=${encodeURIComponent(effectiveRoomID)}&nombre=${encodeURIComponent(nombre)}&userID=${encodeURIComponent(userID)}`;

  const handleLoad = () => {
    setIsLoading(false);
    setError(null);
  };

  const handleError = () => {
    setIsLoading(false);
    setError('Error loading chat');
  };

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 rounded border ${className}`} 
           style={{ width, height }}>
        <div className="text-center">
          <p className="text-red-500 mb-2">{error}</p>
          <p className="text-sm text-gray-500">Chat URL: {chatUrl}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} style={{ width, height }}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded border">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2 mx-auto"></div>
            <p className="text-sm text-gray-600">Cargando chat...</p>
          </div>
        </div>
      )}
      <iframe
        src={chatUrl}
        width="100%"
        height="100%"
        frameBorder="0"
        onLoad={handleLoad}
        onError={handleError}
        title={`Chat - Room ${roomID}`}
        className="rounded border"
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
      />
    </div>
  );
}