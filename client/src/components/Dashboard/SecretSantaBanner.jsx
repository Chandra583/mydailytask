import React, { useState, useEffect } from 'react';
import { X, Gift, Sparkles, Heart, Star, PartyPopper } from 'lucide-react';
import Confetti from 'react-confetti';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Romantic Secret Santa Surprise Banner
 * Shows only for Naagamma (naagu@gmail.com) and only once
 * Multi-step reveal with beautiful animations
 */
const SecretSantaBanner = ({ onClose }) => {
  const [show, setShow] = useState(true);
  const [step, setStep] = useState(1); // Multi-step reveal: 1 = intro, 2 = message
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800,
  });

  // Update window size for confetti
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleClose = () => {
    localStorage.setItem('secretSantaBannerShown_naagu', 'true');
    setShow(false);
    if (onClose) onClose();
  };

  const handleOpenGift = () => {
    setStep(2);
  };

  if (!show) return null;

  return (
    <AnimatePresence>
      {show && (
        <>
          {/* Confetti Animation - Romantic Colors */}
          <Confetti
            width={windowSize.width}
            height={windowSize.height}
            recycle={false}
            numberOfPieces={400}
            colors={['#FF6B9D', '#C44569', '#FFA07A', '#FFD700', '#FF69B4', '#E91E63', '#9C27B0']}
            gravity={0.15}
          />

          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/85 backdrop-blur-md z-[9999] flex items-center justify-center p-4"
          >
            {/* Banner Card */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0, rotateY: -180 }}
              animate={{ scale: 1, opacity: 1, rotateY: 0 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{
                duration: 0.8,
                type: "spring",
                stiffness: 100
              }}
              onClick={(e) => e.stopPropagation()}
              className="relative bg-gradient-to-br from-pink-500 via-rose-500 to-purple-600 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
              style={{
                boxShadow: '0 0 60px rgba(236, 72, 153, 0.4), 0 0 100px rgba(168, 85, 247, 0.2)'
              }}
            >
              {/* Animated Background Elements */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 180, 360],
                  }}
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                  className="absolute -top-20 -left-20 w-40 h-40 bg-white/10 rounded-full blur-3xl"
                />
                <motion.div
                  animate={{
                    scale: [1.2, 1, 1.2],
                    rotate: [360, 180, 0],
                  }}
                  transition={{
                    duration: 15,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                  className="absolute -bottom-20 -right-20 w-60 h-60 bg-yellow-300/15 rounded-full blur-3xl"
                />
                {/* Floating hearts background */}
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{
                      y: [0, -30, 0],
                      opacity: [0.2, 0.5, 0.2],
                    }}
                    transition={{
                      duration: 3 + i * 0.5,
                      repeat: Infinity,
                      delay: i * 0.3,
                    }}
                    className="absolute text-white/10"
                    style={{
                      left: `${15 + i * 15}%`,
                      top: `${20 + (i % 3) * 25}%`,
                    }}
                  >
                    <Heart size={20 + i * 4} fill="currentColor" />
                  </motion.div>
                ))}
              </div>

              {/* Close Button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 z-20 w-10 h-10 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 hover:rotate-90 group"
              >
                <X size={20} className="text-white group-hover:text-pink-200" />
              </button>

              {/* Content */}
              <div className="relative z-10 p-8">
                <AnimatePresence mode="wait">
                  {step === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="text-center text-white space-y-6"
                    >
                      {/* Animated Gift Icon */}
                      <motion.div
                        animate={{
                          y: [0, -10, 0],
                          rotate: [0, 5, -5, 0]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                        className="relative inline-block"
                      >
                        <motion.div
                          animate={{ scale: [1, 1.3, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="absolute inset-0 opacity-20"
                        >
                          <Gift size={80} className="text-white" />
                        </motion.div>
                        <Gift size={80} className="relative text-white drop-shadow-2xl" />

                        {/* Floating sparkles */}
                        <motion.div
                          animate={{
                            y: [0, -20, 0],
                            opacity: [1, 0.3, 1],
                            rotate: [0, 180, 360]
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: 0.5
                          }}
                          className="absolute -top-4 -right-4"
                        >
                          <Sparkles size={24} className="text-yellow-300" />
                        </motion.div>

                        <motion.div
                          animate={{
                            y: [0, -15, 0],
                            opacity: [1, 0.3, 1]
                          }}
                          transition={{
                            duration: 2.5,
                            repeat: Infinity,
                            delay: 1
                          }}
                          className="absolute -bottom-2 -left-4"
                        >
                          <Star size={20} className="text-yellow-300" fill="currentColor" />
                        </motion.div>

                        <motion.div
                          animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.8, 1, 0.8]
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                          }}
                          className="absolute top-1/2 -right-6"
                        >
                          <Heart size={18} className="text-pink-300" fill="currentColor" />
                        </motion.div>
                      </motion.div>

                      {/* Title */}
                      <div className="space-y-2">
                        <motion.h1
                          initial={{ opacity: 0, y: -20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                          className="text-4xl font-bold tracking-tight"
                        >
                          🎅 Secret Santa! 🎄
                        </motion.h1>

                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.5 }}
                          className="text-2xl font-semibold"
                        >
                          My Dear Naagamma!😂😂 
                        </motion.p>
                      </div>

                      {/* Message Preview */}
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.7 }}
                        className="bg-white/15 backdrop-blur-md rounded-2xl p-5 border border-white/30 shadow-xl"
                      >
                        <p className="text-base leading-relaxed mb-3">
                          You've received a special <span className="font-bold text-yellow-300">Christmas gift</span> from ME 😎😎
                        </p>

                        <div className="flex items-center justify-center gap-2 text-sm text-yellow-200">
                          <Heart size={16} className="animate-pulse" fill="currentColor" />
                          <span>There's a special message waiting...</span>
                          <Heart size={16} className="animate-pulse" fill="currentColor" />
                        </div>
                      </motion.div>

                      {/* Open Gift Button */}
                      <motion.button
                        onClick={handleOpenGift}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="mt-6 bg-white text-pink-600 font-bold px-10 py-4 rounded-full hover:bg-yellow-300 hover:text-rose-600 transition-all duration-300 shadow-2xl flex items-center gap-3 mx-auto group"
                        style={{
                          boxShadow: '0 8px 30px rgba(255, 255, 255, 0.3)'
                        }}
                      >
                        <Gift size={22} className="group-hover:rotate-12 transition-transform" />
                        <span className="text-lg">Open Your Gift</span>
                        <Sparkles size={22} className="group-hover:rotate-12 transition-transform" />
                      </motion.button>

                      {/* Footer */}
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.2 }}
                        className="text-sm text-white/80"
                      >
                        🎄 Merry Christmas & Happy New Year2026! ✨
                      </motion.p>
                    </motion.div>
                  )}

                  {step === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, scale: 0.8, rotateY: 90 }}
                      animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                      transition={{ duration: 0.6, type: "spring" }}
                      className="text-center text-white space-y-5"
                    >
                      {/* Header */}
                      <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="flex items-center justify-center gap-3"
                      >
                        <Sparkles size={28} className="text-yellow-300" />
                        <h2 className="text-2xl font-bold">Your Special Message</h2>
                        <Sparkles size={28} className="text-yellow-300" />
                      </motion.div>

                      {/* Full Message Card */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/30 shadow-xl text-left space-y-4"
                      >
                        <p className="text-lg leading-relaxed font-semibold text-yellow-300">
                          "Dear Naagamma, 🎄
                        </p>

                        <p className="text-base leading-relaxed">
                          So… what are you gifting me for writing this amazing Christmas message? 😌
                        </p>

                        <p className="text-base leading-relaxed">
                          Jokes aside, hope your Christmas is full of laughs, good food, and zero awkward relatives. 🎉
                        </p>

                        <p className="text-base leading-relaxed">
                          May 2026 treat you better than your alarm clock treats you every morning 😄
                        </p>

                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 1 }}
                          className="flex items-center justify-center gap-2 pt-3 text-yellow-200"
                        >
                          <span className="font-semibold text-lg">Merry Christmas!</span>
                        </motion.div>

                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 1.2 }}
                          className="text-center font-bold text-lg pt-2"
                        >
                          — Your Secret Santa(Chandra😎) 🎅✨"
                        </motion.p>
                      </motion.div>

                      {/* Celebration Emojis */}
                      <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.8, type: "spring" }}
                        className="flex items-center justify-center gap-3 text-3xl"
                      >
                        <motion.span
                          animate={{ y: [0, -10, 0] }}
                          transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                        >
                          🎄
                        </motion.span>
                        <motion.span
                          animate={{ y: [0, -10, 0] }}
                          transition={{ duration: 1, repeat: Infinity, delay: 0.1 }}
                        >
                          🎁
                        </motion.span>
                        <motion.span
                          animate={{ y: [0, -10, 0] }}
                          transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                        >
                          💝
                        </motion.span>
                        <motion.span
                          animate={{ y: [0, -10, 0] }}
                          transition={{ duration: 1, repeat: Infinity, delay: 0.3 }}
                        >
                          ❄️
                        </motion.span>
                        <motion.span
                          animate={{ y: [0, -10, 0] }}
                          transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                        >
                          ✨
                        </motion.span>
                      </motion.div>

                      {/* Close Button */}
                      <motion.button
                        onClick={handleClose}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.4 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-white text-pink-600 font-bold px-8 py-3 rounded-full hover:bg-yellow-300 hover:text-rose-600 transition-all duration-300 shadow-xl flex items-center gap-2 mx-auto group"
                      >
                        <PartyPopper size={20} className="group-hover:rotate-12 transition-transform" />
                        <span>Thank You! 🥰💖</span>
                      </motion.button>

                      {/* Footer */}
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.6 }}
                        className="text-sm text-white/70"
                      >
                        Merry Christmas! May all your wishes come true! 🎅🌟
                      </motion.p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SecretSantaBanner;
