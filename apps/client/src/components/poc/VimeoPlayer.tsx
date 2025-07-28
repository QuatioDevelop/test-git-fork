'use client';

import { useEffect, useRef, useState } from 'react';
import Player from '@vimeo/player';

interface VimeoPlayerProps {
  videoId: string;
  width?: number | string;
  height?: number | string;
  autoplay?: boolean;
  className?: string;
  onVideoEnd?: () => void;
}

export default function VimeoPlayer({
  videoId,
  width = '100%',
  height = 400,
  autoplay = false,
  className = '',
  onVideoEnd
}: VimeoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<Player | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clean up any existing player first
    if (playerRef.current) {
      try {
        playerRef.current.destroy();
        playerRef.current = null;
      } catch (e) {
        console.error('VimeoPlayer: Error cleaning up player:', e);
      }
    }

    let isMounted = true;
    let timeoutId: NodeJS.Timeout;

    const initializePlayer = async () => {
      try {
        setIsLoading(true);
        setError(null);

        if (!containerRef.current) return;

        // Create player with optimized settings
        const player = new Player(containerRef.current, {
          id: parseInt(videoId),
          autoplay,
          controls: true,
          keyboard: true,
          pip: false,
          autopause: true,
          background: false,
          muted: autoplay,
          byline: false,
          portrait: false,
          title: false
        });

        if (!isMounted) {
          player.destroy();
          return;
        }

        playerRef.current = player;
        
        // Set timeout
        timeoutId = setTimeout(() => {
          if (isMounted) {
            setError('Video load timeout');
            setIsLoading(false);
          }
        }, 6000);

        await player.ready();
        
        // Clear timeout on success
        clearTimeout(timeoutId);
        
        if (!isMounted) return;

        // Add event listeners
        if (onVideoEnd) {
          player.on('ended', onVideoEnd);
        }

        player.on('error', (error) => {
          console.error('VimeoPlayer error:', error);
          if (isMounted) {
            setError('Video playback error');
            setIsLoading(false);
          }
        });

        // Hide loading
        if (isMounted) {
          setIsLoading(false);
        }
        
      } catch (err) {
        console.error('VimeoPlayer initialization error:', err);
        clearTimeout(timeoutId);
        if (isMounted) {
          setError('Failed to load video');
          setIsLoading(false);
        }
      }
    };

    // Small delay to ensure DOM is ready
    const initTimeout = setTimeout(() => {
      if (isMounted) {
        initializePlayer();
      }
    }, 50);

    return () => {
      isMounted = false;
      clearTimeout(initTimeout);
      clearTimeout(timeoutId);
      
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
          playerRef.current = null;
        } catch (e) {
          console.error('VimeoPlayer cleanup error:', e);
          playerRef.current = null;
        }
      }
    };
  }, [videoId]);

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 rounded ${className}`} 
           style={{ width, height }}>
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} style={{ width, height }}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 rounded z-10 transition-opacity duration-300">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
            <span className="text-gray-300 text-sm">Cargando video... (ID: {videoId})</span>
          </div>
        </div>
      )}
      <div 
        ref={containerRef} 
        className={`w-full h-full ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-500`}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}