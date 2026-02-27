// Register GSAP ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

// ===== 1. PRE-LOADER ANIMATION =====
const preloader = document.getElementById('pre-loader');
const preloaderText = document.getElementById('preloader-text');
const pulseDot = document.getElementById('pulse-dot');

const preloaderTimeline = gsap.timeline({
    onComplete: () => {
        // Init ScrollTrigger after preloader is done to avoid layout thrashing
        initScroll();
    }
});

// Text sequences
preloaderTimeline
    .to(preloaderText, { opacity: 1, duration: 1.5, ease: 'power2.inOut' })
    .to(preloaderText, { opacity: 0, duration: 1.5, delay: 1, ease: 'power2.inOut' })
    .call(() => { preloaderText.innerText = "Sintonizando na frequência da Lua..."; })
    .to(preloaderText, { opacity: 1, duration: 1.5, ease: 'power2.inOut' })
    .to(preloaderText, { opacity: 0, duration: 1.5, delay: 1, ease: 'power2.inOut' })
    .to(pulseDot, { scale: 50, opacity: 0, duration: 1.5, ease: 'power3.in' }, "-=0.5")
    .to(preloader, { opacity: 0, duration: 1, ease: 'power2.inOut' })
    .set(preloader, { display: 'none' });


// ===== 2. GSAP HORIZONTAL SCROLL & PARALLAX =====
function initScroll() {
    const scrollContainer = document.getElementById('scroll-container');
    const panels = gsap.utils.toArray('.panel');

    // Horizontal Scroll Tween
    const horizontalScroll = gsap.to(panels, {
        xPercent: -100 * (panels.length - 1),
        ease: "none",
        scrollTrigger: {
            trigger: scrollContainer,
            pin: true,
            scrub: 1,
            snap: {
                snapTo: 1 / (panels.length - 1),
                duration: { min: 0.2, max: 0.8 },
                delay: 0.1
            },
            end: () => "+=" + scrollContainer.offsetWidth
        }
    });

    // Reveal animations per section
    panels.forEach((panel, i) => {
        // Reveal elements with .gs-reveal
        const trigs = panel.querySelectorAll('.gs-reveal');
        if (trigs.length) {
            gsap.from(trigs, {
                y: 50,
                opacity: 0,
                duration: 1.5,
                stagger: 0.3,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: panel,
                    containerAnimation: horizontalScroll,
                    start: "left center",
                    toggleActions: "play none none reverse"
                }
            });
        }
    });

    // Staggered texts in Section 2 (A Dualidade)
    const staggeredConfig = document.querySelectorAll('.staggered-text');
    if (staggeredConfig.length) {
        gsap.from(staggeredConfig, {
            x: -40,
            opacity: 0,
            duration: 1.5,
            stagger: 0.5,
            ease: "power2.out",
            scrollTrigger: {
                trigger: panels[1],
                containerAnimation: horizontalScroll,
                start: "left center",
                toggleActions: "play none none reverse"
            }
        });
    }

    // Parallax & Story Elements
    // Section 2: Show Bon Jovi Texture
    gsap.to('#bg-texture', {
        opacity: 0.15,
        scrollTrigger: {
            trigger: panels[1],
            containerAnimation: horizontalScroll,
            start: "left center",
            end: "right center",
            scrub: true
        }
    });

    // Moonflower Parallax & Transformations
    const flowerWrapper = document.getElementById('moonflower-wrapper');
    const flower = document.getElementById('moonflower-flower');
    const glow = document.getElementById('moonflower-glow');

    // As user scrolls right, flower opens and glows more
    gsap.to(glow, {
        scale: 1.5,
        opacity: 0.4,
        ease: "none",
        scrollTrigger: {
            trigger: scrollContainer,
            start: "top top",
            end: () => "+=" + scrollContainer.offsetWidth,
            scrub: true
        }
    });

    gsap.to(flower, {
        rotation: 360,
        scale: 1.2,
        ease: "none",
        scrollTrigger: {
            trigger: scrollContainer,
            start: "top top",
            end: () => "+=" + scrollContainer.offsetWidth,
            scrub: true
        }
    });

    // Section 4: Show Play Button when entering Section 4
    const customPlayer = document.getElementById('custom-player');
    const lyricsCont = document.getElementById('lyrics-container');

    ScrollTrigger.create({
        trigger: panels[3], // Section 4
        containerAnimation: horizontalScroll,
        start: "left center",
        onEnter: () => {
            customPlayer.classList.remove('opacity-0', 'pointer-events-none');
            lyricsCont.classList.remove('opacity-0', 'pointer-events-none');
            // Show the lyrics container smoothly if music was already playing
        },
        onLeaveBack: () => {
            // Optional: Pause music and hide when going back
            customPlayer.classList.add('opacity-0', 'pointer-events-none');
            lyricsCont.classList.add('opacity-0', 'pointer-events-none');
        },
        onLeave: () => {
            customPlayer.classList.add('opacity-0', 'pointer-events-none');
            lyricsCont.classList.add('opacity-0', 'pointer-events-none');
        },
        onEnterBack: () => {
            customPlayer.classList.remove('opacity-0', 'pointer-events-none');
            lyricsCont.classList.remove('opacity-0', 'pointer-events-none');
        }
    });

    // Section 5: Signature fade
    gsap.to('#final-signature', {
        opacity: 1,
        y: -30,
        duration: 2,
        ease: "power2.out",
        scrollTrigger: {
            trigger: panels[4], // Section 5
            containerAnimation: horizontalScroll,
            start: "left center"
        }
    });
}


// ===== 3. YOUTUBE API & LYRICS SYNCHRONIZATION =====
let ytPlayer;
let isPlaying = false;
let checkLyricsInterval;

// The Lyrics exactly as provided
const lyrics = [
    { time: 0.0, text: "" },
    { time: 27.0, text: "The world was on fire...<br><span style='font-size: 0.65em; opacity: 0.7;'>O mundo estava um caos...</span>" },
    { time: 35.0, text: "It's strange what desire will make foolish people do<br><span style='font-size: 0.65em; opacity: 0.7;'>É estranho o que o desejo faz a gente fazer</span>" },
    { time: 43.0, text: "I never dreamed that I'd need somebody like you<br><span style='font-size: 0.65em; opacity: 0.8; color: #D4AF37;'>Eu nunca imaginei que a minha lógica tropeçaria em alguém como você</span>" },
    { time: 58.0, text: "And I wanna fall in love" }, // Sem tradução
    { time: 72.0, text: "With you..." },
    { time: 88.0, text: "What a wicked game you play...<br><span style='font-size: 0.65em; opacity: 0.7;'>Que jogo é esse que você joga...</span>" },
    { time: 96.0, text: "To make me feel this way<br><span style='font-size: 0.65em; opacity: 0.7;'>Para me fazer sentir desse jeito</span>" },
    { time: 104.0, text: "What a wicked thing to do...<br><span style='font-size: 0.65em; opacity: 0.7;'>Que golpe baixo o seu...</span>" },
    { time: 111.0, text: "To make me dream of you<br><span style='font-size: 0.65em; opacity: 0.8; color: #D4AF37;'>Me fazer sonhar em te conhecer pessoalmente</span>" },
    { time: 118.0, text: "And I wanna fall in love" },
    { time: 132.0, text: "With you..." },
    { time: 225.0, text: "" }
];

// This function creates an <iframe> (and YouTube player)
// after the API code downloads.
function onYouTubeIframeAPIReady() {
    ytPlayer = new YT.Player('player', {
        height: '0',
        width: '0',
        videoId: 'me87-0uZeSA', // James Vincent McMorrow - Wicked Game
        playerVars: {
            'autoplay': 0,
            'controls': 0,
            'rel': 0,
            'modestbranding': 1,
            'showinfo': 0,
            'playsinline': 1
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
}

function onPlayerReady(event) {
    // Player is ready
    const playPauseBtn = document.getElementById('play-pause-btn');

    playPauseBtn.addEventListener('click', () => {
        if (!isPlaying) {
            ytPlayer.playVideo();
        } else {
            ytPlayer.pauseVideo();
        }
    });
}

function onPlayerStateChange(event) {
    const iconPlay = document.getElementById('icon-play');
    const iconPause = document.getElementById('icon-pause');

    // YT.PlayerState.PLAYING = 1
    if (event.data == YT.PlayerState.PLAYING) {
        isPlaying = true;
        iconPlay.classList.add('hidden');
        iconPause.classList.remove('hidden');

        // Start checking lyrics
        if (!checkLyricsInterval) {
            checkLyricsInterval = setInterval(syncLyrics, 500); // Check every 500ms
        }

    } else {
        isPlaying = false;
        iconPlay.classList.remove('hidden');
        iconPause.classList.add('hidden');

        // Stop checking lyrics
        if (checkLyricsInterval) {
            clearInterval(checkLyricsInterval);
            checkLyricsInterval = null;
        }
    }
}

// Global state for current lyric index
let currentLyricIndex = -1;
const currentLyricEl = document.getElementById('current-lyric');

function syncLyrics() {
    if (!ytPlayer || typeof ytPlayer.getCurrentTime !== 'function') return;

    const time = ytPlayer.getCurrentTime();

    // Find the current active lyric
    // We iterate backwards to find the last lyric whose time has passed
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
}

function updateLyricDOM(html) {
    // Cinematic fade out / fade in
    gsap.to(currentLyricEl, {
        opacity: 0,
        y: -10,
        duration: 0.5,
        onComplete: () => {
            currentLyricEl.innerHTML = html;
            gsap.to(currentLyricEl, { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" });
        }
    });
}
