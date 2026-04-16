import { useEffect } from 'react';

interface VideoEmbedProps {
  platform: 'youtube' | 'instagram';
  id: string;
  url: string;
}

export default function VideoEmbed({ platform, id, url }: VideoEmbedProps) {
  useEffect(() => {
    if (platform !== 'instagram') return;
    // Load Instagram embed.js once
    if (!document.getElementById('ig-embed-script')) {
      const s = document.createElement('script');
      s.id = 'ig-embed-script';
      s.src = 'https://www.instagram.com/embed.js';
      s.async = true;
      document.body.appendChild(s);
    } else if ((window as any).instgrm?.Embeds) {
      (window as any).instgrm.Embeds.process();
    }
  }, [platform, id]);

  if (platform === 'youtube') {
    return (
      <div className="aspect-video w-full rounded-xl overflow-hidden bg-black shadow-lg">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}`}
          title="YouTube video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="w-full h-full border-0"
        />
      </div>
    );
  }

  // Instagram embed
  return (
    <div className="max-w-[540px] mx-auto">
      <blockquote
        className="instagram-media"
        data-instgrm-permalink={url}
        data-instgrm-version="14"
        style={{ maxWidth: '540px', margin: '0 auto', minWidth: '280px', width: '100%' }}
      >
        <a href={url} target="_blank" rel="noreferrer" className="text-sm text-blue-500 hover:underline">
          View on Instagram
        </a>
      </blockquote>
    </div>
  );
}
