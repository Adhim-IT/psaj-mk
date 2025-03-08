/**
 * Extracts the YouTube video ID from various YouTube URL formats
 */
export function extractYouTubeId(url: string): string | null {
    if (!url) return null;
    
    // Regular expression to match YouTube video IDs from various URL formats
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    
    return (match && match[2].length === 11) ? match[2] : null;
  }
  
  /**
   * Validates if a URL is a valid YouTube URL
   */
  export function isValidYouTubeUrl(url: string): boolean {
    if (!url) return false;
    
    // Check if we can extract a valid YouTube ID
    const videoId = extractYouTubeId(url);
    return videoId !== null;
  }
  
  /**
   * Generates an embed URL for a YouTube video
   */
  export function getYouTubeEmbedUrl(url: string): string | null {
    const videoId = extractYouTubeId(url);
    if (!videoId) return null;
    
    return `https://www.youtube.com/embed/${videoId}`;
  }
  