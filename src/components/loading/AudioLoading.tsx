import { useEffect } from 'react';
import Player from 'react-lottie-player';
import loadingAnimation from '@/src/components/lottie/loading_lottie.json';

export default function AudioLoading({
  children,
}: {
  children?: React.ReactNode;
}) {
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    const prevPaddingRight = document.body.style.paddingRight;

    const scrollBarWidth =
      window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    if (scrollBarWidth > 0) {
      document.body.style.paddingRight = `${scrollBarWidth}px`;
    }

    const preventScroll = (e: Event) => {
      e.preventDefault();
    };

    window.addEventListener('wheel', preventScroll, { passive: false });
    window.addEventListener('touchmove', preventScroll, { passive: false });

    return () => {
      window.removeEventListener('wheel', preventScroll);
      window.removeEventListener('touchmove', preventScroll);
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPaddingRight;
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-[60] bg-white/85 flex items-center justify-center px-6"
      aria-live="polite"
      role="status"
    >
      <div
        className="w-full max-w-sm flex flex-col items-center p-8 rounded-3xl bg-white 
    shadow-[0_0_50px_30px_rgba(255,255,255,1)]"
      >
        <div className="w-3xl h-3xl">
          <Player
            play
            loop
            animationData={loadingAnimation}
            style={{ width: '100%', height: '100%' }}
          />
        </div>
        {children}
      </div>
    </div>
  );
}
