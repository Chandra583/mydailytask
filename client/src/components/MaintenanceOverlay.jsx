import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

/**
 * MaintenanceOverlay Component
 * 
 * Full-screen image background with text overlay:
 * - Image covers entire viewport
 * - Text floats on top of image
 * - Responsive for all screen sizes
 */
const MaintenanceOverlay = () => {
  const containerRef = useRef(null);
  const imageRef = useRef(null);
  const textBlockRef = useRef(null);
  const titleRef = useRef(null);
  const dividerRef = useRef(null);
  const text1Ref = useRef(null);
  const text2Ref = useRef(null);
  const text3Ref = useRef(null);
  const highlightRef = useRef(null);
  const footerRef = useRef(null);
  const butterflyRefs = useRef([]);

  const butterflies = Array.from({ length: 3 }, (_, i) => ({ id: i }));

  useEffect(() => {
    document.body.style.overflow = 'hidden';

    const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });

    tl.fromTo(containerRef.current, { opacity: 0 }, { opacity: 1, duration: 1.2 }, 0);
    tl.fromTo(imageRef.current, { scale: 1.08, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.8, ease: 'power1.out' }, 0);
    tl.fromTo(textBlockRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 1 }, 0.5);
    tl.fromTo(titleRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8 }, 0.7);
    tl.fromTo(dividerRef.current, { scaleX: 0, opacity: 0 }, { scaleX: 1, opacity: 1, duration: 0.6 }, 0.9);
    tl.fromTo([text1Ref.current, text2Ref.current, text3Ref.current], { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.12 }, 1.0);
    tl.fromTo(highlightRef.current, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.7 }, 1.3);
    tl.fromTo(footerRef.current, { opacity: 0, y: 10 }, { opacity: 0.8, y: 0, duration: 0.5 }, 1.5);

    butterflyRefs.current.forEach((ref, i) => {
      if (ref) {
        tl.fromTo(ref, { opacity: 0, scale: 0 }, { opacity: 0.7, scale: 1, duration: 0.6, ease: 'back.out(1.5)' }, 1.6 + i * 0.1);
      }
    });

    // Gentle floating
    gsap.to(titleRef.current, { y: -3, duration: 4, ease: 'sine.inOut', repeat: -1, yoyo: true, delay: 2 });
    gsap.to([text1Ref.current, text2Ref.current, text3Ref.current, highlightRef.current], { y: -2, duration: 4.5, ease: 'sine.inOut', repeat: -1, yoyo: true, delay: 2.2 });

    butterflyRefs.current.forEach((ref, i) => {
      if (ref) {
        gsap.to(ref, { x: `+=${10 + Math.random() * 15}`, y: `+=${-6 - Math.random() * 10}`, rotation: 5 - Math.random() * 10, duration: 6 + Math.random() * 3, ease: 'sine.inOut', repeat: -1, yoyo: true, delay: i * 0.4 });
      }
    });

    return () => { document.body.style.overflow = ''; gsap.killTweensOf('*'); };
  }, []);

  return (
    <div ref={containerRef} className="overlay" style={{ opacity: 0 }}>
      {/* Full-Screen Background Image */}
      <img ref={imageRef} src="/masha.png" alt="" className="bg-image" />

      {/* Dark Gradient Overlay for Text Readability */}
      <div className="gradient-overlay" />

      {/* Text Content - Floating on Top */}
      <div ref={textBlockRef} className="text-container">
        {/* Butterflies */}
        <div className="butterflies">
          {butterflies.map((b, i) => (
            <div key={b.id} ref={(el) => (butterflyRefs.current[i] = el)} className="butterfly">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M12 12c-2-3-6-4-8-2s-1 6 2 8c2 1 4 0 6-2 2 2 4 3 6 2 3-2 4-6 2-8s-6-1-8 2z" fill="url(#bfg)" />
                <defs><linearGradient id="bfg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#fbbf24" /><stop offset="100%" stopColor="#f59e0b" /></linearGradient></defs>
              </svg>
            </div>
          ))}
        </div>

        <h1 ref={titleRef} className="title">Under Maintenance</h1>
        <div ref={dividerRef} className="divider" />
        <p ref={text1Ref} className="body body-first">Shhh naagu🤫… I'm working on it 😌</p>
        <p ref={text2Ref} className="body"> To make this place</p>
        <p ref={text3Ref} className="body">a little nicer…</p>
        <p ref={highlightRef} className="highlight">because you're visiting na..🥰💖💗</p>
        <p ref={footerRef} className="footer">Come back soon, my dear Naaaaaguuuu🙈😻.</p>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

        .overlay {
          position: fixed;
          inset: 0;
          width: 100vw;
          height: 100vh;
          height: 100dvh;
          overflow: hidden;
          z-index: 9999;
          background: #e8e4ed;
        }

        /* === FULL-SCREEN BACKGROUND IMAGE === */
        .bg-image {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: left center;
          z-index: 1;
        }

        /* === GRADIENT OVERLAY FOR TEXT READABILITY === */
        .gradient-overlay {
          position: absolute;
          inset: 0;
          z-index: 2;
          background: 
            linear-gradient(135deg, rgba(230, 220, 240, 0.7) 0%, rgba(220, 210, 235, 0.5) 50%, rgba(200, 190, 220, 0.3) 100%);
        }

        /* === TEXT CONTAINER === */
        .text-container {
          position: absolute;
          z-index: 3;
          right: 8%;
          top: 50%;
          transform: translateY(-50%);
          max-width: 400px;
        }

        .butterflies {
          display: flex;
          gap: 12px;
          margin-bottom: 14px;
        }

        .butterfly { opacity: 0; }

        /* === TYPOGRAPHY === */
        .title {
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          font-size: 2.2rem;
          font-weight: 800;
          letter-spacing: -0.02em;
          line-height: 1.15;
          color: #1a1a1a;
          margin: 0 0 1.2rem 0;
        }

        .divider {
          width: 45px;
          height: 2.5px;
          border-radius: 2px;
          background: linear-gradient(90deg, #8b5cf6, #a78bfa);
          margin-bottom: 1.25rem;
          transform-origin: left center;
        }

        .body {
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          font-size: 1rem;
          font-weight: 400;
          line-height: 1.9;
          color: #4a4a4a;
          margin: 0 0 0.1rem 0;
        }

        .body-first {
          font-weight: 500;
          color: #2d2d2d;
          margin-bottom: 1rem;
        }

        .highlight {
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          font-size: 1rem;
          font-weight: 500;
          line-height: 1.9;
          color: #8b5cf6;
          margin: 0.5rem 0 0 0;
        }

        .footer {
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          font-size: 0.9rem;
          font-weight: 400;
          color: #888888;
          margin: 1.5rem 0 0 0;
        }

        /* === TABLET (768px - 1023px) === */
        @media (max-width: 1023px) and (min-width: 768px) {
          .bg-image {
            object-position: 30% center;
          }

          .text-container {
            right: 5%;
            max-width: 350px;
          }

          .title {
            font-size: 1.9rem;
          }

          .body, .highlight {
            font-size: 0.95rem;
          }

          .footer {
            font-size: 0.85rem;
          }
        }

        /* === MOBILE (≤767px) === */
        @media (max-width: 767px) {
          .bg-image {
            object-position: 20% top;
          }

          .gradient-overlay {
            background: none;
          }

          .text-container {
            right: auto;
            left: 50%;
            top: auto;
            bottom: 8%;
            transform: translateX(-50%);
            text-align: center;
            max-width: 90%;
            width: 100%;
            padding: 0 1.25rem;
          }

          .butterflies {
            justify-content: center;
            margin-bottom: 10px;
          }

          .title {
            font-size: 1.6rem;
            color: #1a1a1a;
          }

          .divider {
            margin-left: auto;
            margin-right: auto;
            width: 35px;
          }

          .body {
            font-size: 0.95rem;
            color: #3a3a3a;
          }

          .body-first {
            color: #2a2a2a;
          }

          .highlight {
            font-size: 0.95rem;
            color: #8b5cf6;
          }

          .footer {
            font-size: 0.85rem;
            margin-top: 1.1rem;
            color: #666;
          }
        }

        /* === SMALL MOBILE (≤375px) === */
        @media (max-width: 375px) {
          .bg-image {
            object-position: 15% top;
          }

          .text-container {
            bottom: 6%;
            padding: 0 1rem;
          }

          .title {
            font-size: 1.4rem;
          }

          .body, .highlight {
            font-size: 0.88rem;
          }

          .footer {
            font-size: 0.8rem;
          }
        }

        /* === LANDSCAPE MOBILE === */
        @media (max-height: 500px) and (orientation: landscape) {
          .bg-image {
            object-position: left center;
          }

          .gradient-overlay {
            background: 
              linear-gradient(to left, rgba(230, 220, 240, 0.9) 0%, rgba(220, 210, 235, 0.6) 50%, transparent 75%);
          }

          .text-container {
            right: 5%;
            left: auto;
            top: 50%;
            bottom: auto;
            transform: translateY(-50%);
            text-align: left;
            max-width: 45%;
          }

          .butterflies {
            justify-content: flex-start;
          }

          .divider {
            margin-left: 0;
          }

          .title {
            font-size: 1.4rem;
            margin-bottom: 0.6rem;
          }

          .body, .highlight {
            font-size: 0.85rem;
            line-height: 1.5;
          }

          .divider {
            margin-bottom: 0.8rem;
          }

          .footer {
            margin-top: 1rem;
            font-size: 0.8rem;
          }
        }

        /* === LARGE DESKTOP (≥1440px) === */
        @media (min-width: 1440px) {
          .text-container {
            right: 12%;
            max-width: 420px;
          }

          .title {
            font-size: 2.5rem;
          }

          .body, .highlight {
            font-size: 1.1rem;
          }

          .footer {
            font-size: 0.95rem;
          }
        }
      `}</style>
    </div>
  );
};

export default MaintenanceOverlay;
