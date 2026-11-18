class GoldSparkle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 3 + 1;
        this.speedX = (Math.random() - 0.5) * 2;
        this.speedY = (Math.random() - 0.5) * 2;
        this.isMobile = window.innerWidth <= 768;
        this.life = 1.0;
        this.decay = this.isMobile ? (Math.random() * 0.005 + 0.005) : (Math.random() * 0.02 + 0.02);
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY - (this.isMobile ? 0.2 : 0);
        this.life -= this.decay;
    }

    draw(ctx) {
        ctx.fillStyle = `rgba(217, 136, 119, ${this.life})`; // Light Terracotta
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Setup Canvas for Sparkles
    const canvas = document.createElement('canvas');
    canvas.id = 'sparkle-canvas';
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    
    let width, height;
    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
    }
    window.addEventListener('resize', resize);
    resize();

    let sparkles = [];
    let mouseX = -100;
    let mouseY = -100;
    let lastMouseX = -100;
    let lastMouseY = -100;

    function handlePointerMove(clientX, clientY) {
        mouseX = clientX;
        mouseY = clientY;
        
        // Add sparkles on movement
        let dist = Math.hypot(mouseX - lastMouseX, mouseY - lastMouseY);
        if (dist > 5) {
            sparkles.push(new GoldSparkle(mouseX, mouseY));
            if (window.innerWidth <= 768) {
                // Dense, floating trail for mobile
                sparkles.push(new GoldSparkle(mouseX + (Math.random()-0.5)*15, mouseY + (Math.random()-0.5)*15));
                sparkles.push(new GoldSparkle(mouseX + (Math.random()-0.5)*15, mouseY + (Math.random()-0.5)*15));
            } else {
                // Subtle, quick sparkle for desktop
                sparkles.push(new GoldSparkle(mouseX + (Math.random()-0.5)*10, mouseY + (Math.random()-0.5)*10));
            }
            lastMouseX = mouseX;
            lastMouseY = mouseY;
        }
    }

    window.addEventListener('mousemove', (e) => {
        handlePointerMove(e.clientX, e.clientY);
    });

    window.addEventListener('touchmove', (e) => {
        if (e.touches.length > 0) {
            handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
        }
    }, { passive: true });

    function animateSparkles() {
        ctx.clearRect(0, 0, width, height);
        
        for (let i = 0; i < sparkles.length; i++) {
            sparkles[i].update();
            sparkles[i].draw(ctx);
        }
        
        sparkles = sparkles.filter(s => s.life > 0);
        requestAnimationFrame(animateSparkles);
    }
    animateSparkles();

    // Trigger Slide-in Animations
    setTimeout(() => {
        const imageContainers = document.querySelectorAll('.image-container');
        imageContainers.forEach(container => {
            container.classList.add('slide-in');
        });
    }, 100);

    // Audio Player Logic
    document.querySelectorAll('.audio-player').forEach(player => {
        const audio = player.querySelector('audio');
        const playBtn = player.querySelector('.play-btn');
        const soundBarsContainer = player.querySelector('.sound-bars');
        const currentTimeEl = player.querySelector('.current-time');
        const durationEl = player.querySelector('.duration');

        if (audio && playBtn && soundBarsContainer) {
            // Generate 30 bars
            for (let i = 0; i < 30; i++) {
                const bar = document.createElement('div');
                bar.className = 'bar';
                bar.style.animationDelay = `${Math.random() * 0.5}s`;
                soundBarsContainer.appendChild(bar);
            }

            const bars = player.querySelectorAll('.bar');

            const formatTime = (seconds) => {
                const min = Math.floor(seconds / 60);
                const sec = Math.floor(seconds % 60);
                return `${min}:${sec.toString().padStart(2, '0')}`;
            };

            const updateTimeDisplay = (el, time) => {
                if (!isNaN(time) && isFinite(time)) {
                    el.textContent = formatTime(time);
                }
            };

            audio.addEventListener('loadedmetadata', () => {
                updateTimeDisplay(durationEl, audio.duration);
            });

            audio.addEventListener('timeupdate', () => {
                updateTimeDisplay(currentTimeEl, audio.currentTime);
            });

            playBtn.addEventListener('click', () => {
                if (audio.paused) {
                    // Pause any other playing audio on the page
                    document.querySelectorAll('audio').forEach(a => {
                        if (a !== audio) {
                            a.pause();
                            const otherBtn = a.parentElement.querySelector('.play-btn');
                            if (otherBtn) otherBtn.textContent = '▶';
                            a.parentElement.querySelectorAll('.bar').forEach(b => {
                                b.classList.remove('playing');
                                b.style.transform = `scaleY(${Math.random() * 0.3 + 0.1})`;
                            });
                        }
                    });

                    audio.play();
                    playBtn.textContent = '⏸';
                    bars.forEach(bar => bar.classList.add('playing'));
                } else {
                    audio.pause();
                    playBtn.textContent = '▶';
                    bars.forEach(bar => {
                        bar.classList.remove('playing');
                        bar.style.transform = `scaleY(${Math.random() * 0.3 + 0.1})`;
                    });
                }
            });

            audio.addEventListener('ended', () => {
                playBtn.textContent = '▶';
                bars.forEach(bar => {
                    bar.classList.remove('playing');
                    bar.style.transform = `scaleY(${Math.random() * 0.3 + 0.1})`;
                });
            });
        }
    });
});
