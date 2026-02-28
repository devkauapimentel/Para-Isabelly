document.addEventListener('DOMContentLoaded', () => {
    // Register GSAP ScrollTrigger
    gsap.registerPlugin(ScrollTrigger);

    // Mobile-optimized scroll config
    const isMobile = /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || ('ontouchstart' in window);
    ScrollTrigger.config({ ignoreMobileResize: true });

    // Only normalizeScroll on mobile to capture touch events for horizontal scrolling
    if (isMobile) {
        ScrollTrigger.normalizeScroll({
            allowNestedScroll: false,
            type: "touch,pointer"
        });
    }

    initScrollAnimations(isMobile);
    initHoldToUnlock();
    initInteractiveElements(isMobile);
});

// ===== 1. GSAP Scroll Animations =====
let scrollTween;

function initScrollAnimations(isMobile) {
    const frames = gsap.utils.toArray('.frame');
    const ambientLight = document.getElementById('ambient-light');
    const scrollIndicator = document.getElementById('scroll-indicator');
    const horizontalContainer = document.getElementById('horizontal-container');
    const mainScroll = document.getElementById('main-scroll');

    // Ensure touch-action allows vertical swipe to drive our horizontal scroll
    if (isMobile && mainScroll) {
        mainScroll.style.touchAction = 'pan-y';
    }

    // Horizontal Scroll Tween
    // scrub: lower = more responsive on mobile
    scrollTween = gsap.to(frames, {
        xPercent: -100 * (frames.length - 1),
        ease: "none",
        scrollTrigger: {
            trigger: "#main-scroll",
            pin: true,
            scrub: isMobile ? 0.4 : 1,
            snap: {
                snapTo: 1 / (frames.length - 1),
                duration: isMobile ? { min: 0.2, max: 0.5 } : { min: 0.3, max: 0.6 },
                delay: isMobile ? 0.1 : 0.05,
                ease: "power1.inOut"
            },
            end: () => "+=" + horizontalContainer.offsetWidth
        }
    });

    // Hide scroll indicator on Scroll
    ScrollTrigger.create({
        trigger: frames[1],
        containerAnimation: scrollTween,
        start: "left 80%",
        onEnter: () => gsap.to(scrollIndicator, { opacity: 0, duration: 0.5 }),
        onLeaveBack: () => gsap.to(scrollIndicator, { opacity: 0.5, duration: 0.5 })
    });

    // Animate texts in each frame
    frames.forEach((frame, index) => {
        const textElements = frame.querySelectorAll('.gs-reveal');

        if (textElements.length > 0) {
            gsap.to(textElements, {
                opacity: 1,
                filter: "blur(0px)",
                y: 0,
                scale: 1,
                duration: 2.5,
                stagger: 0.3,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: frame,
                    containerAnimation: scrollTween,
                    start: "left 60%", // Triggers when the left of the frame hits 60% of viewport width
                    toggleActions: "play reverse play reverse"
                }
            });
        }

        const flowerElements = frame.querySelectorAll('.gs-reveal-flower');
        if (flowerElements.length > 0) {
            gsap.to(flowerElements, {
                opacity: 1,
                filter: "blur(0px)",
                scale: 1.05,
                duration: 3,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: frame,
                    containerAnimation: scrollTween,
                    start: "left 60%",
                    toggleActions: "play reverse play reverse"
                }
            });
        }

        // Ambient Light / Temperature change (Dark/Cold -> Warm/Gold)
        // By Frame 7, we start warming up the background
        if (index === 6) {
            ScrollTrigger.create({
                trigger: frame,
                containerAnimation: scrollTween,
                start: "left 50%",
                onEnter: () => gsap.to(ambientLight, { backgroundColor: "rgba(20, 15, 0, 0.5)", duration: 2 }),
                onLeaveBack: () => gsap.to(ambientLight, { backgroundColor: "rgba(0, 0, 0, 0)", duration: 2 })
            });
        }
    });

    // Music Player controls visibility (Show ONLY on Frame 9)
    const frame9 = document.getElementById('frame-9');
    const frame10 = document.getElementById('frame-10');
    const musicControls = document.getElementById('music-controls');
    const lyricsContainer = document.getElementById('lyrics-container');

    // Show controls when entering Frame 9
    ScrollTrigger.create({
        trigger: frame9,
        containerAnimation: scrollTween,
        start: "left 50%",
        onEnter: () => {
            musicControls.classList.remove('opacity-0', 'pointer-events-none');
            lyricsContainer.classList.remove('opacity-0', 'pointer-events-none');
        },
        onLeaveBack: () => {
            musicControls.classList.add('opacity-0', 'pointer-events-none');
            lyricsContainer.classList.add('opacity-0', 'pointer-events-none');
        }
    });

    // Hide controls when entering Frame 10
    ScrollTrigger.create({
        trigger: frame10,
        containerAnimation: scrollTween,
        start: "left 50%",
        onEnter: () => {
            musicControls.classList.add('opacity-0', 'pointer-events-none');
            lyricsContainer.classList.add('opacity-0', 'pointer-events-none');
        },
        onLeaveBack: () => {
            musicControls.classList.remove('opacity-0', 'pointer-events-none');
            lyricsContainer.classList.remove('opacity-0', 'pointer-events-none');
        }
    });
}

// ===== 1.5. Interactive Elements (Cursor & Flower) =====
function initInteractiveElements(isMobile) {
    const cursor = document.getElementById('thermal-cursor');
    const mainFlower = document.getElementById('main-flower');
    let hasMoved = false;

    // Smooth cursor movement variables
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let cursorX = mouseX;
    let cursorY = mouseY;

    // Hide thermal cursor on mobile to avoid interference
    if (isMobile && cursor) {
        cursor.style.display = 'none';
    }

    // Set initial position for GSAP
    if (cursor) {
        gsap.set(cursor, { xPercent: -50, yPercent: -50 });
    }

    // Mouse: desktop only
    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        if (!hasMoved && cursor) {
            hasMoved = true;
            gsap.to(cursor, { opacity: 1, duration: 2 });
        }
    });

    // Touch: passive listener so it NEVER blocks scrolling
    window.addEventListener('touchmove', (e) => {
        if (e.touches.length > 0) {
            mouseX = e.touches[0].clientX;
            mouseY = e.touches[0].clientY;
            if (!hasMoved && !isMobile && cursor) {
                hasMoved = true;
                gsap.to(cursor, { opacity: 1, duration: 2 });
            }
        }
    }, { passive: true });

    // Animate cursor and flower on tick
    gsap.ticker.add(() => {
        // Thermal cursor follows with slight lag for smoothness
        if (hasMoved && cursor) {
            cursorX += (mouseX - cursorX) * 0.15;
            cursorY += (mouseY - cursorY) * 0.15;
            gsap.set(cursor, { x: cursorX, y: cursorY });
        }

        // Flower organic magnetic behavior
        if (mainFlower && hasMoved) {
            const rect = mainFlower.getBoundingClientRect();
            // Since it's pinned in a horizontal scroll container, getBoundingClientRect() works correctly physically
            const flowerCenterX = rect.left + rect.width / 2;
            const flowerCenterY = rect.top + rect.height / 2;

            // Calculate distance and angle
            const dx = mouseX - flowerCenterX;
            const dy = mouseY - flowerCenterY;

            // Limit the tilt based on max tilt of 10-15 degrees requested
            const maxTilt = 15;

            // Dampen distance effect - max tilt reaches at screen edges
            const tiltX = (dy / (window.innerHeight / 2)) * -maxTilt; // Pitch (up/down)
            const tiltY = (dx / (window.innerWidth / 2)) * maxTilt;   // Yaw (left/right)

            // Clamp values
            const clampedTiltX = Math.max(-maxTilt, Math.min(maxTilt, tiltX));
            const clampedTiltY = Math.max(-maxTilt, Math.min(maxTilt, tiltY));

            // Smoothly apply transform
            gsap.to(mainFlower, {
                rotationX: clampedTiltX,
                rotationY: clampedTiltY,
                rotationZ: clampedTiltX * 0.1, // slight organic twist
                transformPerspective: 1000,
                duration: 1.5, // organically slow
                ease: "power2.out"
            });
        }
    });
}

// ===== 2. YouTube API Integration =====
let player;
let isPlaying = false;
let currentLyricIndex = -1;
let checkLyricsInterval = null;

const lyrics = [
    {
        "time": 0.0,
        "text": ""
    },
    {
        "time": 18.38,
        "text": "The world was on fire, and no one could save me but you<br><span style='font-size: 0.65em; opacity: 0.7;'>O mundo um caos, e ninguém podia me acalmar além de você</span>"
    },
    {
        "time": 26.15,
        "text": "It's strange what desire will make foolish people do<br><span style='font-size: 0.65em; opacity: 0.7;'>É estranho o que a atração faz a gente fazer</span>"
    },
    {
        "time": 38.43,
        "text": "I never dreamed that I'd need somebody like you"
    },
    {
        "time": 43.25,
        "text": "I never dreamed that I'd meet somebody like you<br><span style='font-size: 0.65em; opacity: 0.8; color: #D4AF37;'>Eu nunca imaginei que a minha lógica tropeçaria em você</span>"
    },
    {
        "time": 51.65, // A IA do YouTube ouviu "No". Consertado para a letra real.
        "text": "And I wanna fall in love..."
    },
    {
        "time": 60.25, // A IA ouviu "Nah". Consertado para a letra real.
        "text": "And I wanna fall in love..."
    },
    {
        "time": 68.73,
        "text": "With you..."
    },
    {
        "time": 77.46,
        "text": "With you..."
    },
    {
        "time": 95.98,
        "text": "What a wicked thing to do, to make me dream of you<br><span style='font-size: 0.65em; opacity: 0.7;'>Que golpe baixo... me fazer sonhar em te decifrar pessoalmente</span>"
    },
    {
        "time": 104.21,
        "text": "What a wicked thing to say, you never felt that way<br><span style='font-size: 0.65em; opacity: 0.7;'>Que jogo é esse que você joga...</span>"
    },
    {
        "time": 128.14, // O "Bye!" bizarro removido. As reticências mantêm a imersão visual no instrumental.
        "text": "<span style='opacity: 0.5;'>...</span>"
    },
    {
        "time": 154.18,
        "text": "The world was on fire, and no one could save me but you"
    },
    {
        "time": 162.16,
        "text": "It's strange what desire will make foolish people do"
    },
    {
        "time": 171.08,
        "text": "I never dreamed that I'd need somebody like you"
    },
    {
        "time": 179.31,
        "text": "I never dreamed that I'd miss somebody like you<br><span style='font-size: 0.65em; opacity: 0.8; color: #D4AF37;'>Eu nunca imaginei que sentiria falta de alguém como você</span>"
    },
    // --- O CLÍMAX HIPNÓTICO ---
    {
        "time": 187.85,
        "text": "And I wanna fall in love..."
    },
    {
        "time": 196.90,
        "text": "And I wanna fall in love..."
    },
    {
        "time": 205.44,
        "text": "And I wanna fall in love..."
    },
    {
        "time": 225.30,
        "text": "Wanna fall in love..."
    },
    // -----------------------------
    {
        "time": 230.04,
        "text": "With you..."
    },
    {
        "time": 248.51,
        "text": "Nobody loves no one.<br><span style='font-size: 0.65em; opacity: 0.7;'>A lógica não explica isso.</span>"
    },
    {
        "time": 255.00, // Encerra suavemente
        "text": ""
    }
];

function onYouTubeIframeAPIReady() {
    player = new YT.Player('youtube-player-container', {
        height: '0',
        width: '0',
        videoId: 'me87-0uZeSA',
        playerVars: {
            'playsinline': 1,
            'controls': 0,
            'disablekb': 1,
            'fs': 0,
            'rel': 0,
            'modestbranding': 1
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
}

function onPlayerReady(event) {
    const playPauseBtn = document.getElementById('play-pause-btn');

    playPauseBtn.addEventListener('click', () => {
        if (!isPlaying) {
            player.playVideo();
        } else {
            player.pauseVideo();
        }
    });
}

function onPlayerStateChange(event) {
    const iconPlay = document.getElementById('icon-play');
    const iconPause = document.getElementById('icon-pause');

    if (event.data === YT.PlayerState.PLAYING) {
        isPlaying = true;
        iconPlay.classList.add('hidden');
        iconPause.classList.remove('hidden');
        if (!checkLyricsInterval) {
            checkLyricsInterval = setInterval(syncLyrics, 50); // Hyper-precision
        }
    } else {
        isPlaying = false;
        iconPlay.classList.remove('hidden');
        iconPause.classList.add('hidden');
        if (checkLyricsInterval) {
            clearInterval(checkLyricsInterval);
            checkLyricsInterval = null;
        }
    }
}

function syncLyrics() {
    if (!player || !player.getCurrentTime) return;

    const time = player.getCurrentTime();

    let activeIndex = -1;
    for (let i = lyrics.length - 1; i >= 0; i--) {
        if (time >= lyrics[i].time) {
            activeIndex = i;
            break;
        }
    }

    if (activeIndex !== -1 && activeIndex !== currentLyricIndex) {
        currentLyricIndex = activeIndex;
        updateLyricDOM(lyrics[activeIndex].text);
    }

    // Call visual sync
    updateVisualProgression(time);
}

function updateLyricDOM(html) {
    const currentLyricEl = document.getElementById('current-lyric');
    if (!currentLyricEl) return;

    gsap.to(currentLyricEl, {
        opacity: 0,
        y: -10,
        duration: 0.1, // Faster fade out to prevent perceived delay
        onComplete: () => {
            currentLyricEl.innerHTML = html;
            gsap.to(currentLyricEl, { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" });
        }
    });
}

// ===== 2.5. Visual Progression Sync =====
let currentVisualPhase = -1;

function updateVisualProgression(time) {
    let newPhase = 0;
    if (time >= 170) {
        newPhase = 2; // Final: A Entrega
    } else if (time >= 85) {
        newPhase = 1; // Middle: A Tensão
    } else {
        newPhase = 0; // Initial: A Armadura
    }

    if (newPhase !== currentVisualPhase) {
        currentVisualPhase = newPhase;
        applyVisualPhase(newPhase);
    }
}

function applyVisualPhase(phase) {
    const musicAmbient = document.getElementById('music-ambient');
    const flowerImage = document.getElementById('flower-image');

    // We only animate if the elements exist
    if (!musicAmbient) return;

    if (phase === 0) {
        // Terço Inicial (A Armadura)
        // Cores frias. Preto ônix, azul da meia-noite.
        // Luz incide de cima, dura, refletindo prata.
        gsap.to(musicAmbient, {
            opacity: 0.8,
            "--amb-x": "50%",
            "--amb-y": "0%",
            "--amb-c1": "rgba(40, 44, 84, 0.4)",  // Midnight blue / light silver
            "--amb-c2": "rgba(5, 5, 20, 0.2)",    // Onyx shade
            duration: 8,
            ease: "power2.inOut"
        });
    } else if (phase === 1) {
        // Terço Médio (A Tensão)
        // Púrpura, magenta escuro, bordeaux. Luz lateral.
        // Gelo perde brilho, torna-se aveludado.
        gsap.to(musicAmbient, {
            opacity: 0.8,
            "--amb-x": "100%",
            "--amb-y": "50%",
            "--amb-c1": "rgba(100, 20, 70, 0.4)", // Magenta / Bordeaux
            "--amb-c2": "rgba(40, 10, 30, 0.2)",  // Deep purple
            duration: 12, // Smooth, slow transition
            ease: "power2.inOut"
        });
    } else if (phase === 2) {
        // Terço Final (A Entrega)
        // Âmbar, dourado escuro, vermelho carmesim. Luz de baixo (lareira).
        // Quente, abafado, íntimo.
        gsap.to(musicAmbient, {
            opacity: 0.9,
            "--amb-x": "50%",
            "--amb-y": "100%",
            "--amb-c1": "rgba(220, 100, 20, 0.35)", // Amber / Golden
            "--amb-c2": "rgba(139, 0, 0, 0.25)",    // Crimson red
            duration: 15,
            ease: "power2.inOut"
        });
    }
}


// ===== 3. Touch/Hold to Unlock Mechanic =====
function initHoldToUnlock() {
    const holdBtn = document.getElementById('hold-button');
    const progressCircle = document.getElementById('progress-circle');
    const unlockContainer = document.getElementById('unlock-container');
    const revealedContent = document.getElementById('revealed-content');

    let holdTimer;
    let holdStartTime;
    const holdDuration = 3000; // 3 seconds
    let isUnlocked = false;
    let animationFrame;

    // The length of the SVG circle (2 * PI * r) -> 2 * PI * 46 ≈ 289
    const circumference = 289;

    let hapticInterval;

    function startHold(e) {
        if (isUnlocked) return;
        e.preventDefault();

        // Lock horizontal scroll by disabling the scroll trigger
        if (scrollTween) {
            scrollTween.scrollTrigger.disable(false); // Disable without resetting position
        }

        progressCircle.classList.remove('opacity-0');
        holdStartTime = Date.now();

        // Start heartbeat haptic feedback (approx 60bpm -> 1 beat every 1000ms)
        // A heartbeat is usually two quick pulses
        if (navigator.vibrate) {
            navigator.vibrate([30, 100, 30]); // Initial beat
            hapticInterval = setInterval(() => {
                navigator.vibrate([30, 100, 30]);
            }, 1000);
        }

        function updateProgress() {
            const elapsedTime = Date.now() - holdStartTime;
            let progress = Math.min(elapsedTime / holdDuration, 1);

            // Calculate dash offset (289 = 0%, 0 = 100%)
            const offset = circumference - (progress * circumference);
            progressCircle.style.strokeDashoffset = offset;

            // Scale and glow logic for the button itself
            gsap.to(holdBtn, { scale: 1 + (progress * 0.1), duration: 0.1 });

            // Animate the flower inside - scale up, spin, and glow (Bouquet colors: magenta/rose)
            const holdFlower = document.getElementById('hold-flower');
            if (holdFlower) {
                gsap.to(holdFlower, {
                    scale: 1 + (progress * 1.8), // Grows almost 2x
                    rotate: progress * 180, // Spins half a circle
                    filter: `drop-shadow(0 0 ${15 + (progress * 40)}px rgba(255,105,180,${0.8 + (progress * 0.2)})) brightness(${1 + (progress * 0.5)})`,
                    duration: 0.1
                });
            }

            if (progress < 1) {
                animationFrame = requestAnimationFrame(updateProgress);
            } else {
                unlockSecret();
            }
        }

        animationFrame = requestAnimationFrame(updateProgress);
    }

    function stopHold(e) {
        if (isUnlocked) return;
        if (e) e.preventDefault();

        cancelAnimationFrame(animationFrame);
        clearInterval(hapticInterval);

        progressCircle.classList.add('opacity-0');
        progressCircle.style.strokeDashoffset = circumference;
        gsap.to(holdBtn, { scale: 1, duration: 0.3 });

        // Reset the flower if the hold is cancelled
        const holdFlower = document.getElementById('hold-flower');
        if (holdFlower) {
            gsap.to(holdFlower, {
                scale: 1,
                rotate: 0,
                filter: "drop-shadow(0 0 15px rgba(255,105,180,0.8)) brightness(1)",
                duration: 0.5,
                ease: "back.out(1.5)"
            });
        }
    }

    function unlockSecret() {
        isUnlocked = true;
        clearInterval(hapticInterval);

        // Visual cue of unlocking
        holdBtn.classList.add('unlocked-glow');
        progressCircle.style.strokeDashoffset = 0;

        // Restore horizontal scroll so they can navigate back
        if (scrollTween) {
            scrollTween.scrollTrigger.enable(false, false);
        }

        // Final long Haptic Feedback for Mobile
        if (navigator.vibrate) {
            navigator.vibrate(400);
        }

        // Cinematic Flash
        const flash = document.getElementById('cinematic-flash');
        if (flash) {
            gsap.to(flash, {
                opacity: 0.8,
                duration: 0.1,
                yoyo: true,
                repeat: 1,
                ease: "power4.out"
            });
        }

        // Change the ambient vibe to purely romantic (Solid Black -> Warm Amber)
        const musicAmbient = document.getElementById('music-ambient');
        if (musicAmbient) {
            gsap.to(musicAmbient, {
                "--amb-c1": "rgba(220, 100, 20, 0.4)", // Bright amber
                "--amb-c2": "rgba(139, 0, 0, 0.3)", // Deep crimson
                duration: 3,
                ease: "power2.out"
            });
            // Fade out the noise background for cleanliness safely by ID
            const bgNoise = document.getElementById('bg-noise');
            if (bgNoise) {
                gsap.to(bgNoise, { opacity: 0, duration: 2 });
            }
        }

        // Start Embers Particles
        startEmbers();

        // Fade out hold button, fade in the final text
        gsap.to(unlockContainer, {
            opacity: 0,
            scale: 0.8,
            duration: 1.5,
            ease: "power2.in",
            onComplete: () => {
                unlockContainer.style.display = 'none';
                revealedContent.classList.remove('hidden');

                // 1. Animate text up
                gsap.to(revealedContent, {
                    opacity: 1,
                    y: 0,
                    duration: 2,
                    ease: "power3.out"
                });

                // 2. Animate the Final Flower blooming
                const finalFlower = document.getElementById('final-flower');
                if (finalFlower) {
                    gsap.fromTo(finalFlower,
                        { scale: 0, rotation: -90, opacity: 0 },
                        {
                            scale: 1,
                            rotation: 0,
                            opacity: 0.9,
                            duration: 3,
                            delay: 0.5, // Starts slightly after text appears
                            ease: "elastic.out(1, 0.5)",
                            onComplete: () => {
                                // 3. Set continuous floating breathing animation
                                gsap.to(finalFlower, {
                                    y: -15,
                                    rotation: 5,
                                    duration: 4,
                                    repeat: -1,
                                    yoyo: true,
                                    ease: "sine.inOut"
                                });
                            }
                        }
                    );
                }
            }
        });
    }

    // Event listeners for Mouse and Touch (preventing context menu)
    holdBtn.addEventListener('mousedown', startHold);
    holdBtn.addEventListener('touchstart', startHold, { passive: false });

    window.addEventListener('mouseup', stopHold);
    window.addEventListener('touchend', stopHold);
    window.addEventListener('touchcancel', stopHold);

    // Crucial for mobile hold: prevent text selection and context menu
    holdBtn.addEventListener('contextmenu', (e) => e.preventDefault());
    window.addEventListener('selectstart', (e) => e.preventDefault());
    window.addEventListener('touchcancel', stopHold);
}

// ===== 4. Particles Engine (Embers) =====
function startEmbers() {
    const container = document.getElementById('particles-container');
    if (!container) return;

    container.classList.remove('hidden');

    // Create a particle every 200ms
    setInterval(() => {
        const ember = document.createElement('div');
        ember.classList.add('ember');

        // Randomize size, position, duration, and drift
        const size = Math.random() * 4 + 2; // 2px to 6px
        const left = Math.random() * 100; // 0% to 100% viewport width
        const duration = Math.random() * 3 + 4; // 4s to 7s
        const maxOpacity = Math.random() * 0.5 + 0.3; // 0.3 to 0.8
        const drift = (Math.random() - 0.5) * 50; // -25px to 25px horizontal drift

        ember.style.width = `${size}px`;
        ember.style.height = `${size}px`;
        ember.style.left = `${left}vw`;
        ember.style.setProperty('--duration', `${duration}s`);
        ember.style.setProperty('--max-opacity', maxOpacity);
        ember.style.setProperty('--drift', `${drift}px`);

        container.appendChild(ember);

        // Remove element after animation finishes
        setTimeout(() => {
            ember.remove();
        }, duration * 1000);
    }, 200);
}
