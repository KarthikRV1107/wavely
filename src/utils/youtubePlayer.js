export const loadYouTubeVideo = (player, videoId) => {
  if (!player?.__wavelyReady || !videoId) return false;
  if (player.__wavelyRequestedVideoId === videoId) return false;

  player.__wavelyRequestedVideoId = videoId;
  player.loadVideoById?.(videoId);
  return true;
};
