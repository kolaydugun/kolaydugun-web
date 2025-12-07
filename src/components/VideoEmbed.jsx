import React from 'react';
import './VideoEmbed.css';

const VideoEmbed = ({ videoUrl }) => {
    if (!videoUrl) return null;

    const getEmbedUrl = (url) => {
        // YouTube
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            let videoId;
            if (url.includes('youtu.be/')) {
                videoId = url.split('youtu.be/')[1].split('?')[0];
            } else {
                videoId = url.split('v=')[1]?.split('&')[0];
            }
            return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
        }

        // Vimeo
        if (url.includes('vimeo.com')) {
            const videoId = url.split('vimeo.com/')[1]?.split('?')[0];
            return videoId ? `https://player.vimeo.com/video/${videoId}` : null;
        }

        return null;
    };

    const embedUrl = getEmbedUrl(videoUrl);

    if (!embedUrl) {
        return null;
    }

    return (
        <div className="video-embed-container">
            <h3 className="video-title">📹 Video</h3>
            <div className="video-wrapper">
                <iframe
                    src={embedUrl}
                    title="Vendor Video"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="video-iframe"
                />
            </div>
        </div>
    );
};

export default VideoEmbed;
