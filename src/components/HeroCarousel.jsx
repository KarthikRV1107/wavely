import { useEffect, useState } from 'react';

export default function HeroCarousel({ songs, queue, playSong, isDesktop }) {
  const [active, setActive] = useState(0);
  const count = songs.length;

  useEffect(() => {
    if (count < 2) return undefined;
    const timer = window.setInterval(() => setActive(index => (index + 1) % count), 5000);
    return () => window.clearInterval(timer);
  }, [count]);

  useEffect(() => {
    if (active >= count) setActive(0);
  }, [active, count]);

  if (!count) return null;
  const visible = Array.from({ length: Math.min(isDesktop ? 3 : 1, count) }, (_, offset) =>
    songs[(active + offset) % count]
  );
  const move = direction => setActive(index => (index + direction + count) % count);

  return (
    <section className="home-carousel" aria-label="Featured music">
      <div className={`home-banner-track${isDesktop ? ' is-wide' : ''}`}>
        {visible.map((song, offset) => {
          const index = (active + offset) % count;
          const queueIndex = queue.findIndex(item => item.videoId === song.videoId);
          return (
            <button className="home-banner-card" key={`${song.videoId}-${index}`} type="button"
              aria-label={`Play ${song.title} by ${song.channelName}`}
              onClick={() => playSong(song, queue, queueIndex)}>
              <img src={song.thumbnailUrl} alt="" loading={offset === 0 ? 'eager' : 'lazy'} decoding="async"/>
              <span className="home-banner-shade"/>
              <span className="home-banner-copy">
                <span className="home-banner-kicker">TRENDING NOW</span>
                <span className="home-banner-title" title={song.title}>{song.title}</span>
                <span className="home-banner-artist" title={song.channelName}>{song.channelName}</span>
              </span>
              <span className="home-banner-play" aria-hidden="true">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>
              </span>
            </button>
          );
        })}
      </div>
      {count > 1 && <>
        <button className="home-carousel-arrow is-prev" type="button" aria-label="Previous banners" onClick={() => move(-1)}>‹</button>
        <button className="home-carousel-arrow is-next" type="button" aria-label="Next banners" onClick={() => move(1)}>›</button>
        <div className="home-carousel-dots" aria-label="Choose featured slide">
          {songs.map((song, index) => <button key={song.videoId} type="button"
            aria-label={`Show featured slide ${index + 1}`} aria-current={index === active ? 'true' : undefined}
            className={index === active ? 'is-active' : ''} onClick={() => setActive(index)}/>) }
        </div>
      </>}
    </section>
  );
}
