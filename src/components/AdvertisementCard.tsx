import { motion } from 'framer-motion';
import { ArrowRight, Play, Sparkles } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { buildApiUrl } from '../config/api';

type Advertisement = {
  _id: string;
  title: string;
  advertiserName: string;
  destinationUrl: string;
  placement: string;
  image?: string;
  videoUrl?: string;
  gifUrl?: string;
  logoUrl?: string;
  description?: string;
  ctaText?: string;
  status?: string;
  mediaType?: string;
  htmlContent?: string;
  html?: string;
};

type AdvertisementCardProps = {
  advertisement: Advertisement;
  variant?: 'hero' | 'homepage' | 'inline' | 'story' | 'sidebar' | 'newsletter';
  className?: string;
  disableTracking?: boolean;
};

const getMediaType = (advertisement: Advertisement) => {
  if (advertisement.mediaType === 'html' || advertisement.htmlContent || advertisement.html) {
    return 'html';
  }
  if (advertisement.videoUrl) return 'video';
  if (advertisement.gifUrl) return 'gif';
  return advertisement.image ? 'image' : 'none';
};

const AdvertisementCard = ({ advertisement, variant = 'homepage', className = '', disableTracking = false }: AdvertisementCardProps) => {
  const mediaType = getMediaType(advertisement);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [hasTrackedImpression, setHasTrackedImpression] = useState(false);

  useEffect(() => {
    if (disableTracking || hasTrackedImpression || !advertisement._id) {
      return;
    }

    const trackImpression = async () => {
      try {
        await fetch(buildApiUrl(`/api/advertisements/${advertisement._id}/track`), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ event: 'impression' }),
        });
      } catch (error) {
        console.error(error);
      }
    };

    trackImpression();
    setHasTrackedImpression(true);
  }, [advertisement._id, disableTracking, hasTrackedImpression]);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement || mediaType !== 'video') {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            videoElement.play().catch(() => undefined);
          } else {
            videoElement.pause();
          }
        });
      },
      { threshold: 0.3 },
    );

    observer.observe(videoElement);
    return () => observer.disconnect();
  }, [mediaType]);

  const handleClick = async () => {
    if (disableTracking || !advertisement._id) {
      return;
    }

    try {
      await fetch(buildApiUrl(`/api/advertisements/${advertisement._id}/track`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: 'click' }),
      });
    } catch (error) {
      console.error(error);
    }
  };

  const isHero = variant === 'hero';
  const isStory = variant === 'story';
  const isSidebar = variant === 'sidebar';
  const isNewsletter = variant === 'newsletter';

  return (
    <motion.a
      href={advertisement.destinationUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      whileHover={{ y: -4, scale: 1.01, boxShadow: '0 18px 45px rgba(34,211,238,0.12)' }}
      transition={{ duration: 0.35 }}
      className={`group block overflow-hidden rounded-[1.5rem] border border-cyan-400/20 bg-white/80 shadow-[0_20px_50px_rgba(15,23,42,0.08)] transition-all duration-300 hover:border-cyan-400/40 dark:border-white/10 dark:bg-slate-900/80 ${className}`}
    >
      <div className={`relative overflow-hidden ${mediaType === 'html' ? 'min-h-[120px]' : isHero ? 'min-h-[220px]' : isStory ? 'min-h-[220px]' : 'min-h-[180px]'}`}>
        {mediaType === 'video' && advertisement.videoUrl ? (
          <video
            ref={videoRef}
            src={advertisement.videoUrl}
            muted
            autoPlay
            playsInline
            loop
            preload="metadata"
            className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
          />
        ) : null}
        {mediaType === 'gif' && advertisement.gifUrl ? (
          <img src={advertisement.gifUrl} alt={advertisement.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
        ) : null}
        {mediaType === 'image' && advertisement.image ? (
          <img src={advertisement.image} alt={advertisement.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
        ) : null}
        {mediaType === 'html' ? (
          <div className="flex h-full min-h-[140px] items-center justify-center bg-gradient-to-br from-cyan-500/10 via-violet-500/10 to-slate-300/20 p-4 text-sm text-slate-700 dark:text-slate-300">
            <div className="w-full" dangerouslySetInnerHTML={{ __html: advertisement.htmlContent || advertisement.html || '' }} />
          </div>
        ) : null}
        {mediaType === 'none' ? (
          <div className="flex h-full min-h-[180px] items-center justify-center bg-gradient-to-br from-cyan-500/10 via-violet-500/10 to-slate-300/20 dark:from-cyan-500/10 dark:via-violet-500/10 dark:to-slate-900/80">
            <div className="rounded-full border border-cyan-400/30 bg-white/70 p-4 text-cyan-500 dark:bg-slate-950/70 dark:text-cyan-300">
              <Sparkles size={20} />
            </div>
          </div>
        ) : null}

        {mediaType !== 'html' ? <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent" /> : null}
        <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full border border-white/20 bg-slate-950/70 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-cyan-200 backdrop-blur">
          <span className="inline-flex h-2 w-2 rounded-full bg-cyan-300" />
          Sponsored
        </div>
        {advertisement.logoUrl ? (
          <div className="absolute right-4 top-4 overflow-hidden rounded-full border border-white/20 bg-white/80 p-1 shadow-lg dark:bg-slate-950/80">
            <img src={advertisement.logoUrl} alt={`${advertisement.advertiserName} logo`} className="h-9 w-9 rounded-full object-cover" />
          </div>
        ) : null}
      </div>

      <div className={`p-5 sm:p-6 ${isSidebar ? 'space-y-3' : 'space-y-4'}`}>
        <div className="flex items-center justify-between gap-3">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-cyan-500 dark:text-cyan-300">{advertisement.advertiserName}</p>
          {isHero || isStory ? <span className="rounded-full border border-cyan-400/20 bg-cyan-500/10 px-2.5 py-1 text-[0.66rem] font-medium text-cyan-600 dark:text-cyan-300">Premium placement</span> : null}
        </div>
        <h3 className={`font-semibold tracking-tight text-slate-900 transition group-hover:text-cyan-600 dark:text-white dark:group-hover:text-cyan-300 ${isHero ? 'text-2xl' : isStory ? 'text-xl' : isNewsletter ? 'text-lg' : 'text-lg'}`}>{advertisement.title}</h3>
        {advertisement.description ? <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">{advertisement.description}</p> : null}
        <div className="flex items-center justify-between gap-3 pt-1">
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-600 dark:text-cyan-300">
            {advertisement.ctaText || 'Learn more'} <ArrowRight size={14} />
          </span>
          {mediaType === 'video' ? <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-slate-100/70 px-2.5 py-1 text-[0.7rem] font-medium text-slate-600 dark:border-white/10 dark:bg-slate-800/70 dark:text-slate-300"><Play size={12} /> Video</span> : null}
        </div>
      </div>
    </motion.a>
  );
};

export default AdvertisementCard;
export type { Advertisement };
