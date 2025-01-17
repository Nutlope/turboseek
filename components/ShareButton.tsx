import React from 'react';

const ShareButton = ({ textToShare }: { textToShare: string }) => {
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Check this out!',
          text: textToShare,
          url: window.location.href,
        });
        console.log('Content shared successfully');
      } catch (error) {
        console.error('Error sharing content:', error);
      }
    } else {
      console.warn('Web Share API not supported in this browser');
    }
  };

  return (
    <button onClick={handleShare} className="share-button">
      Share
    </button>
  );
};

export default ShareButton;
