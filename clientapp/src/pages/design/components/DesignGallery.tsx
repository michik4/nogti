import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ZoomIn, Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { getImageUrl } from '@/utils/image.util';
import styles from './DesignGallery.module.css';

interface DesignGalleryProps {
  imageUrl: string;
  videoUrl?: string;
  title: string;
}

const DesignGallery: React.FC<DesignGalleryProps> = ({
  imageUrl,
  videoUrl,
  title
}) => {
  const [isVideoMode, setIsVideoMode] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isZoomed, setIsZoomed] = useState(false);

  const toggleVideo = () => {
    setIsVideoMode(!isVideoMode);
    setIsPlaying(false);
  };

  const togglePlay = () => {
    const video = document.getElementById('design-video') as HTMLVideoElement;
    if (video) {
      if (isPlaying) {
        video.pause();
      } else {
        video.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    const video = document.getElementById('design-video') as HTMLVideoElement;
    if (video) {
      video.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleZoom = () => {
    setIsZoomed(!isZoomed);
  };

  return (
    <Card className={styles.galleryCard}>
      <div className={styles.mediaContainer}>
        {isVideoMode && videoUrl ? (
          <div className={styles.videoWrapper}>
            <video
              id="design-video"
              src={videoUrl}
              className={styles.video}
              muted={isMuted}
              loop
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            >
              Ваш браузер не поддерживает видео.
            </video>
            
            <div className={styles.videoControls}>
              <Button
                size="sm"
                variant="secondary"
                onClick={togglePlay}
                className={styles.controlButton}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
              
              <Button
                size="sm"
                variant="secondary"
                onClick={toggleMute}
                className={styles.controlButton}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        ) : (
          <div className={styles.imageWrapper}>
            <img
              src={getImageUrl(imageUrl) || '/placeholder.svg'} 
              alt={title}
              className={`${styles.image} ${isZoomed ? styles.zoomed : ''}`}
              onClick={toggleZoom}
            />
            
            <Button
              size="sm"
              variant="secondary"
              onClick={toggleZoom}
              className={styles.zoomButton}
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
          </div>
        )}
        
        {videoUrl && (
          <div className={styles.mediaToggle}>
            <Button
              variant={isVideoMode ? "outline" : "default"}
              size="sm"
              onClick={() => setIsVideoMode(false)}
            >
              Фото
            </Button>
            <Button
              variant={isVideoMode ? "default" : "outline"}
              size="sm"
              onClick={toggleVideo}
            >
              Видео
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};

export default DesignGallery; 