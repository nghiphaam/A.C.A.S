export function setMediaMetadata(metadata) {
    if('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
            album: 'Chess',
            artwork: [{ src: '../assets/images/logo.png', sizes: '192x192', type: 'image/png' }],
            ...metadata
        });

        navigator.mediaSession.playbackState = 'playing';
    }
}

export function initMediaSession() {
    const audio = document.querySelector('#silence-audio');
    const audioStartEvents = ['click', 'keydown', 'touchstart'];

    audio.play().catch(() => {
        console.log('Autoplay blocked, waiting for user gesture...');
    });

    function startAudio() {
        audio.play().then(() => {
            toast.message(TRANS_OBJ?.playingSilentAudio ?? 'Playing a silent audiotrack for stability!', 1500);

            audioStartEvents.forEach(eventName => window.removeEventListener(eventName, startAudio));
        });
    }

    audioStartEvents.forEach(eventName => window.addEventListener(eventName, startAudio));

    if('mediaSession' in navigator) {
        setMediaMetadata({
            title: 'Ready when you are!',
            artist: 'Waiting for a new match...'
        });

        navigator.mediaSession.playbackState = 'playing';
    }
}
