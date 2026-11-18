// (horizontal scanner bar is hiding for now till the typing finishes)

// 1.5 spawning the spooky chrome stars in the background
const starContainer = document.getElementById('star-container');
const allStars = [];
for (let i = 0; i < 50; i++) { // gave us way more stars!
    const wrapper = document.createElement('div');
    wrapper.style.position = 'absolute';
    wrapper.style.left = `${Math.random() * 100}vw`;
    wrapper.style.top = `${Math.random() * 100}vh`;

    const starSvg = document.createElement('div');
    starSvg.classList.add('star');
    
    // making them thick and white so the neon yellow glows pop on them
    starSvg.style.backgroundImage = `url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M50 0 C50 35 65 50 100 50 C65 50 50 65 50 100 C50 65 35 50 0 50 C35 50 50 35 50 0 Z' fill='%23ffffff'/%3E%3C/svg%3E")`;
    starSvg.style.backgroundSize = 'contain';
    starSvg.style.backgroundRepeat = 'no-repeat';
    
    // Random size between 20px and 60px
    const size = Math.random() * 40 + 20;
    starSvg.style.width = `${size}px`;
    starSvg.style.height = `${size}px`;
    
    wrapper.appendChild(starSvg);
    starContainer.appendChild(wrapper);
    allStars.push(starSvg);
    
    // Set initial slightly lower opacity
    starSvg.style.opacity = '0.9';
    
    // Constant endless float applied to the WRAPPER, so interactive push on the star isn't killed
    function drift() {
        gsap.to(wrapper, {
            y: (Math.random() - 0.5) * 400, // Move much further
            x: (Math.random() - 0.5) * 400,
            duration: Math.random() * 6 + 6, // Move quicker (6 to 12 seconds)
            ease: "sine.inOut",
            onComplete: drift
        });
    }
    drift();
    
    // Rotation applied to the STAR itself
    gsap.to(starSvg, {
        rotation: (Math.random() - 0.5) * 180,
        duration: Math.random() * 10 + 10,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
    });
    
    // Twinkle opacity (10% dimmer overall)
    gsap.to(starSvg, {
        opacity: Math.random() * 0.5 + 0.4, // Max was 0.5 + 0.5 = 1.0, now 0.9
        duration: Math.random() * 2 + 1,
        repeat: -1,
        yoyo: true,
        ease: "power1.inOut"
    });
}

const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";

// Start wipe sequence after decryption
gsap.set(".scanner-bar", { opacity: 0 });
const wipeObj = { top: -10 };

function startWipeSequence() {
    gsap.set(".scanner-bar", { opacity: 0.9, top: "-10%" });
    gsap.to(wipeObj, {
        top: 110,
        duration: 5.0, // Slowed down from 3.5s
        ease: "sine.inOut",
        onUpdate: () => {
            gsap.set(".scanner-bar", { top: wipeObj.top + "%" });
            // Wipe away the black screen downwards, revealing the logo underneath
            gsap.set("#intro-blackout", { 
                clipPath: `polygon(0% ${Math.max(0, wipeObj.top)}%, 100% ${Math.max(0, wipeObj.top)}%, 100% 100%, 0% 100%)` 
            });
        },
        onComplete: () => {
            document.getElementById('intro-blackout').style.display = 'none';
            
            // Now continue sweeping infinitely
            gsap.fromTo(".scanner-bar", 
                { top: "110%" }, 
                { top: "-10%", duration: 5.0, ease: "sine.inOut", repeat: -1, yoyo: true }
            );

            // Automatically shatter the logo earlier to reduce dead time
            setTimeout(() => {
                triggerRevealSequence();
            }, 300);
        }
    });
}

// Intro Decryption Effect
const introTextEl = document.getElementById('decryption-text');
const finalIntroStr = "YOU HAVE BEEN SELECTED...";
let iter = 0;

const interval = setInterval(() => {
    iter += 1/3;
    introTextEl.innerText = finalIntroStr.split('').map((char, index) => {
        if (index < iter || char === ' ') return char;
        return chars[Math.floor(Math.random() * chars.length)];
    }).join('');
    
    if (iter >= finalIntroStr.length) {
        clearInterval(interval);
        setTimeout(startWipeSequence, 200); // Speed up: Wait only 0.2s before wiping
    }
}, 30); // Speed up: Type faster

// 3. Advanced Shattering Image Math
const shatterLogoContainer = document.getElementById('shatter-logo');
const allShards = [];

// Create an 8x4 grid of shatter shards = 32 cells. 2 triangles per cell = 64 shards for high detail
const rows = 4;
const cols = 8;
for(let r = 0; r < rows; r++) {
    for(let c = 0; c < cols; c++) {
        const x1 = (c / cols) * 100;
        const x2 = ((c+1) / cols) * 100;
        const y1 = (r / rows) * 100;
        const y2 = ((r+1) / rows) * 100;

        // Triangle 1 (top-left)
        const shard1 = document.createElement('div');
        shard1.className = 'image-shard';
        shard1.style.clipPath = `polygon(${x1}% ${y1}%, ${x2}% ${y1}%, ${x1}% ${y2}%)`;
        shatterLogoContainer.appendChild(shard1);
        allShards.push(shard1);

        // Triangle 2 (bottom-right)
        const shard2 = document.createElement('div');
        shard2.className = 'image-shard';
        shard2.style.clipPath = `polygon(${x2}% ${y1}%, ${x2}% ${y2}%, ${x1}% ${y2}%)`;
        shatterLogoContainer.appendChild(shard2);
        allShards.push(shard2);
    }
}


// 4. Custom Cursor & Interactive Physics
const cursor = document.getElementById('custom-cursor');
const trails = document.querySelectorAll('.cursor-trail');

function handleInteraction(e) {
    let clientX, clientY;
    if (e.touches && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
    } else {
        clientX = e.clientX;
        clientY = e.clientY;
    }

    // Main ripple cursor
    gsap.to(cursor, { x: clientX, y: clientY, duration: 0.1, ease: "power2.out" });
    
    // Trail physics (each trail element follows with increasing delay)
    trails.forEach((trail, index) => {
        gsap.to(trail, { 
            x: clientX, 
            y: clientY, 
            duration: 0.15 + (index * 0.05), 
            ease: "power2.out" 
        });
    });

    // --- INTERACTIVE CHROME STARS ---
    allStars.forEach(star => {
        const rect = star.getBoundingClientRect();
        const starX = rect.left + rect.width / 2;
        const starY = rect.top + rect.height / 2;
        
        const dx = clientX - starX;
        const dy = clientY - starY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 150) {
            const force = (150 - dist) / 150;
            const pushX = -(dx / dist) * force * 200;
            const pushY = -(dy / dist) * force * 200;
            
            // Push star away and slowly float back
            gsap.killTweensOf(star, "x,y");
            gsap.to(star, {
                x: pushX,
                y: pushY,
                duration: 0.6,
                ease: "power2.out",
                onComplete: () => {
                    gsap.to(star, {
                        x: 0,
                        y: 0,
                        duration: 3,
                        ease: "power2.inOut"
                    });
                }
            });
        }
    });

    // --- INTERACTIVE SCANNER BAR ---
    const scanner = document.querySelector('.scanner-bar');
    if (scanner) {
        const rect = scanner.getBoundingClientRect();
        const distToScanner = Math.abs(clientY - (rect.top + rect.height/2));
        
        if (distToScanner < 60) {
            const force = (60 - distToScanner) / 60;
            // Distort and change hue to Neon Yellow/Lime when touched
            gsap.to(scanner, {
                scaleY: 1 + (force * 3),
                skewX: force * 30,
                background: "linear-gradient(to bottom, rgba(215, 255, 0, 0.8), rgba(255,255,255,1), rgba(215, 255, 0, 0.8))",
                boxShadow: "0 0 30px 12px rgba(215, 255, 0, 0.6), 0 0 80px 30px rgba(215, 255, 0, 0.3)",
                duration: 0.2,
                ease: "power1.out"
            });
        } else {
            // Revert to Creamy White
            gsap.to(scanner, {
                scaleY: 1,
                skewX: 0,
                background: "linear-gradient(to bottom, rgba(241, 230, 178, 0.8), rgba(255,255,255,1), rgba(241, 230, 178, 0.8))",
                boxShadow: "0 0 20px 8px rgba(241, 230, 178, 0.4), 0 0 60px 20px rgba(241, 230, 178, 0.2)",
                duration: 0.5,
                ease: "power2.out"
            });
        }
    }

    // (Proximity shatter removed as requested)
}

document.addEventListener('mousemove', handleInteraction);
document.addEventListener('touchmove', handleInteraction, { passive: true });

// --- INTERACTIVE SHATTER & REVEAL FLOW ---
const isMobile = window.innerWidth < 768;
const explodeRadius = isMobile ? 200 : 450;
const explodeZ = isMobile ? 100 : 200;

let isExploding = false;
let buttonRevealed = false;

function triggerRevealSequence() {
    if (isExploding) return;
    isExploding = true;
    
    gsap.to(cursor, { scale: 1.5, duration: 0.4, ease: "power2.out", yoyo: true, repeat: 1 });
    
    // Fade out the tight PNG glow so it doesn't leave a ghost silhouette when shards fly away
    const glow = document.getElementById('logo-glow');
    if (glow) gsap.to(glow, { opacity: 0, duration: 0.2, overwrite: "auto" });
    
    // 1. Explode the Logo
    allShards.forEach(shard => {
        // (Glow is now handled dynamically by the scanner bar in the GSAP ticker!)
        
        gsap.to(shard, {
            x: (Math.random() - 0.5) * explodeRadius, 
            y: (Math.random() - 0.5) * explodeRadius, 
            z: (Math.random() - 0.5) * explodeZ, 
            rotationX: Math.random() * 500,
            rotationY: Math.random() * 500,
            rotationZ: Math.random() * 500,
            opacity: Math.random() * 0.5 + 0.3,
            duration: 1.2,
            ease: "power2.out"
        });
    });

    // 2. Move Logo Upwards, then heal
    setTimeout(() => {
        gsap.to(shatterLogoContainer, {
            y: isMobile ? -40 : -70, 
            duration: 1.5, 
            ease: "power2.inOut"
        });
        
        allShards.forEach((shard, index) => {
            gsap.to(shard, {
                x: 0, y: 0, z: 0, rotationX: 0, rotationY: 0, rotationZ: 0,
                opacity: 1,
                duration: 1.5,
                ease: "power3.inOut",
                onComplete: () => {
                    // Wipe any inline filters applied during the explosion
                    shard.style.filter = '';
                    
                    // Reset explosion lock when the last shard is done
                    if (index === allShards.length - 1) {
                        isExploding = false;
                    }
                }
            });
        });
    }, 600); 
    
    // If they click the logo early, still trigger the reveal sequence after the shatter finishes
    setTimeout(() => {
        startButtonRevealSequence();
    }, 1000);
}

// --- BUTTON REVEAL LOGIC ---
let revealStarted = false;

function startButtonRevealSequence() {
    if (revealStarted) return;
    revealStarted = true;
    
    const executeReveal = () => {
        if (buttonRevealed) return;
        buttonRevealed = true;
        
        // Ensure logo is moved up slightly so the button has room if it hasn't exploded yet
        if (!isExploding) {
            gsap.to(shatterLogoContainer, {
                y: isMobile ? -40 : -70, 
                duration: 1.5, 
                ease: "power2.inOut"
            });
        }
        
        const formContainer = document.getElementById('form-container');
        formContainer.style.opacity = '1';
        gsap.to('#real-button-content', { opacity: 1, duration: 0.8 });
        formContainer.style.pointerEvents = 'auto';
        
        decodeTextElement(document.getElementById('decode-text-1'), "[ CLEARANCE GRANTED ]");
        decodeTextElement(document.getElementById('decode-text-2'), "// THE PORTAL OPENS FOR ONE NIGHT ONLY_");
    };

    const checkScanner = () => {
        if (buttonRevealed) return;
        const scanner = document.querySelector('.scanner-bar');
        const scannerRect = scanner.getBoundingClientRect();
        
        const formContainer = document.getElementById('form-container');
        const formRect = formContainer.getBoundingClientRect();
        
        if (scannerRect.top > formRect.top - 50 && scannerRect.top < formRect.bottom + 50) {
            executeReveal();
        } else {
            requestAnimationFrame(checkScanner);
        }
    };
    
    requestAnimationFrame(checkScanner);
    
    // Fallback: forcefully reveal after 2 seconds no matter what
    setTimeout(() => {
        executeReveal();
    }, 2000);
}

// Automatically start the button reveal sequence 4 seconds after the page loads
// Removed: The button is now natively revealed after the automatic logo shatter!

// Reusable text decryption function
function decodeTextElement(element, finalString) {
    if (!element) return;
    let iterations = 0;
    const interval = setInterval(() => {
        element.innerText = finalString.split("").map((letter, index) => {
            if (letter === " ") return " ";
            if (index < iterations) return finalString[index];
            return chars[Math.floor(Math.random() * chars.length)];
        }).join("");

        if (iterations >= finalString.length) {
            clearInterval(interval);
        }
        iterations += 0.5;
    }, 30);
}

// Bind to click/touch
shatterLogoContainer.addEventListener('click', triggerRevealSequence);
shatterLogoContainer.addEventListener('touchstart', (e) => {
    e.stopPropagation();
    triggerRevealSequence();
}, { passive: true });

// --- DEVICE TILT FOR STARS (Gyroscope Parallax) ---
function handleOrientation(e) {
    let tiltX = e.gamma; // Left-to-right tilt
    let tiltY = e.beta;  // Front-to-back tilt
    if (tiltX === null || tiltY === null) return;

    // Cap values to prevent extreme shifting
    if (tiltX > 45) tiltX = 45;
    if (tiltX < -45) tiltX = -45;
    if (tiltY > 45) tiltY = 45;
    if (tiltY < -45) tiltY = -45;

    allStars.forEach((star, index) => {
        // Pseudo-3D depth parallax based on index
        const depth = 1 + (index % 3); 
        
        gsap.to(star, {
            x: tiltX * depth * 2,
            y: (tiltY - 20) * depth * 2, // offset by 20 so normal holding angle is near center
            duration: 0.5,
            ease: "power1.out",
            overwrite: "auto"
        });
    });
}
window.addEventListener('deviceorientation', handleOrientation);

// --- SCANNER LOGO GLOW FX ---
// Automatically calculate the distance between the scanner bar and the logo,
// and apply an orange glow when the scanner is hovering over it!
gsap.ticker.add(() => {
    const scanner = document.querySelector('.scanner-bar');
    const logo = document.getElementById('shatter-logo');
    if (!scanner || !logo || isExploding) return;
    
    const scannerRect = scanner.getBoundingClientRect();
    const logoRect = logo.getBoundingClientRect();
    
    const scannerCenter = scannerRect.top + scannerRect.height / 2;
    const logoCenter = logoRect.top + logoRect.height / 2;
    
    // Distance from the scanner bar to the center of the logo
    const dist = Math.abs(scannerCenter - logoCenter);
    
    // The logo is 300px tall. If the scanner is within 300px of its center, start glowing.
    const logoGlow = document.getElementById('logo-glow');
    if (!logoGlow) return;
    
    if (dist < 300) {
        let rawIntensity = Math.max(0, 1 - (dist / 300));
        let intensity = rawIntensity * rawIntensity * (3 - 2 * rawIntensity);
        
        if (isExploding) {
            // Apply dynamic CSS filters to the 64 individual flying shards
            allShards.forEach(shard => {
                shard.style.filter = `drop-shadow(0 0 15px rgba(215, 255, 0, ${intensity})) brightness(${1 + intensity*0.5})`;
            });
            logoGlow.style.opacity = 0; // Ensure tight background glow is hidden during explosion
        } else {
            // Buttery smooth GPU fade for unbroken logo
            logoGlow.style.opacity = intensity;
        }
    } else {
        if (isExploding) {
            allShards.forEach(shard => {
                shard.style.filter = "none";
            });
        }
        logoGlow.style.opacity = 0;
    }
});

// Attach listener. iOS 13+ requires explicit permission triggered by user interaction.
document.addEventListener('touchstart', function requestOrientation() {
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        DeviceOrientationEvent.requestPermission()
            .then(permissionState => {
                if (permissionState === 'granted') {
                    window.addEventListener('deviceorientation', handleOrientation);
                }
            })
            .catch(console.error);
    } else if (window.DeviceOrientationEvent) {
        // Non-iOS 13+ devices
        window.addEventListener('deviceorientation', handleOrientation);
    }
    // Remove listener after first interaction
    document.removeEventListener('touchstart', requestOrientation);
}, { once: true });

// --- GENTLE LOGO FLOAT ---
gsap.to("#logo-floater", {
    y: -15, // Float up by 15px
    rotation: 1, // Slight rotation
    duration: 3, // Very slow
    ease: "sine.inOut",
    repeat: -1,
    yoyo: true
});

// --- THE HUGE PORTAL JUMP TO THE UNIVERSE PAGE! ---
const portalLink = document.getElementById('portal-link');
if (portalLink) {
    portalLink.addEventListener('click', function(e) {
        e.preventDefault();
        const targetUrl = this.href;
        
        // kill the logo glow forever so it doesn't accidentally flash if the scanner bar hits it while we're flying through space
        isExploding = true;
        const lg = document.getElementById('logo-glow');
        if (lg) lg.style.display = 'none';

        // zoom thru the background real fast! but don't zoom the canvas on mobile bc it makes the phone lag sooo bad
        gsap.to('#chrome-bg', { 
            scale: isMobile ? 1.5 : 4, 
            opacity: 0, 
            duration: 1.5, 
            ease: "power2.in" 
        });
        
        gsap.to('#matrix-canvas-bg', { 
            scale: isMobile ? 1 : 4, 
            opacity: 0, 
            duration: 1.5, 
            ease: "power2.in" 
        });
        
        // hide all the cursor stuff instantly
        gsap.to(['.scanner-bar', '#custom-cursor', '.cursor-trail'], { opacity: 0, duration: 1.0 });
        
        // 1. hide the buttons right away
        gsap.to('#real-button-content', { opacity: 0, duration: 0.5 });
        
        // 2. blow up the logo into tiny flying shards!
        if (typeof allShards !== 'undefined') {
            allShards.forEach(shard => {
                gsap.to(shard, {
                    x: (Math.random() - 0.5) * (isMobile ? 800 : 1500), 
                    y: (Math.random() - 0.5) * (isMobile ? 800 : 1500), 
                    z: (Math.random() - 0.5) * (isMobile ? 500 : 1000), 
                    rotationX: Math.random() * 1000,
                    rotationY: Math.random() * 1000,
                    rotationZ: Math.random() * 1000,
                    opacity: 0,
                    duration: 2.0,
                    ease: "power2.out"
                });
            });
        }
        
        // 3. Just hide the static background stars instantly (they were looking clunky)
        if (typeof allStars !== 'undefined') {
            allStars.forEach(star => star.style.display = 'none');
        }
        
        // Remove the solid background of the shatter container so we can see into deep space
        gsap.to(shatterLogoContainer, { background: 'transparent', duration: 0.5 });

        // 4. Start the swirling space-hole tunnel IMMEDIATELY as everything shatters!
        // CREATE CONTINUOUS SWIRLING WARP TUNNEL
        const warpContainer = document.createElement('div');
        warpContainer.style.position = 'fixed';
        warpContainer.style.top = '0';
        warpContainer.style.left = '0';
        warpContainer.style.width = '100vw'; 
        warpContainer.style.height = '100vh'; 
        warpContainer.style.overflow = 'visible'; // Allow stars to fly outside the bounds as it rotates!
        warpContainer.style.zIndex = '99999'; 
        warpContainer.style.pointerEvents = 'none';
        warpContainer.style.opacity = '0'; // Start invisible for a smooth fade-in
        
        // Remove the colorful galaxy swirl, keep it deep pure space
        warpContainer.style.background = 'transparent';

        document.body.appendChild(warpContainer);

        // Smoothly fade in the entire warp tunnel quickly
        gsap.to(warpContainer, {
            opacity: 1,
            duration: 0.5,
            ease: "power2.out"
        });

        // Spin the entire warp container heavily to create a massive swirling effect as they fly towards us
        gsap.to(warpContainer, {
            rotation: -1080, // Spins the other way!
            duration: 10, // Slowed down from 5.5s to 10s for a hypnotic spin
            ease: "power1.inOut"
        });

        // Emit ethereal trailing orbs continuously from the center

        const emitter = setInterval(() => {
            // Spawn ethereal orbs (drastically reduce count on mobile to save GPU!)
            const spawnCount = isMobile ? 1 : 5;
            for (let i = 0; i < spawnCount; i++) {
                const star = document.createElement('div');
                star.style.position = 'absolute';
                
                // Random angle
                const angle = Math.random() * Math.PI * 2;
                
                // Use 50% to precisely center on the screen
                const spawnRadius = 30 + Math.random() * 50; 
                star.style.top = '50%';
                star.style.left = '50%';
                
                // Make them 3D metallic liquid chrome spheres instead of flat glowing lights
                star.style.width = '12px';  // Made larger to see the 3D texture
                star.style.height = '12px';
                star.style.borderRadius = '50%';
                
                // Bulletproof off-center spawning logic: 
                // Shift them outwards using basic pixel margins, and subtract 6px to center the 12px width/height!
                star.style.marginTop = `${Math.sin(angle) * spawnRadius - 6}px`;
                star.style.marginLeft = `${Math.cos(angle) * spawnRadius - 6}px`;
                
                // Start them small but with varying initial sizes using GSAP so it stacks correctly
                const startScale = 0.2 + Math.random() * 0.3;
                gsap.set(star, {
                    rotation: angle * (180 / Math.PI),
                    scale: startScale
                });
                
                // 15% of orbs are 50% brighter and larger
                const isBright = Math.random() > 0.85;
                const brightnessBoost = isBright ? 1.5 : 1.0;
                
                // 3D Liquid Chrome texture! 
                // Bright highlight top-left, fading to dark charcoal/black, with a tiny silver bounce-light rim
                star.style.background = `radial-gradient(circle at 30% 30%, #ffffff 0%, #dcdcdc 10%, #666666 35%, #111111 60%, #000000 100%)`;
                
                // Pick color: Dark Teal/Blue, Cream, Dark Charcoal, or 3% Neon Yellow
                let color;
                const colorRoll = Math.random();
                if (colorRoll < 0.45) {
                    color = 'rgba(20, 60, 80, 0.8)'; // Dark Teal/Blue (matches background)
                } else if (colorRoll < 0.90) {
                    color = 'rgba(241, 230, 178, 0.6)'; // Pale Cream (matches matrix letters)
                } else if (colorRoll < 0.97) {
                    color = 'rgba(40, 50, 60, 0.7)'; // Dark Charcoal Silver
                } else {
                    color = 'rgba(215, 255, 0, 0.8)'; // Neon Yellow/Lime (Exactly 3%)
                }
                
                // If it's a bright orb, boost the alpha of the brand color to 1.0 (pure bright)
                if (isBright) {
                    color = color.replace(/0\.\d+\)/, '1)');
                }
                
                const glowSpread = (15 + Math.random() * 15) * brightnessBoost;
                // Add the colored aura + an INSET shadow to simulate bounce light on the bottom edge of the metal
                star.style.boxShadow = `inset -2px -2px 4px rgba(255, 255, 255, 0.2), 0 0 ${glowSpread}px ${glowSpread/3}px ${color}`;
                star.style.zIndex = '10'; 
                
                warpContainer.appendChild(star);

                // Animate outwards and scale up to simulate flying past the camera
                const distance = Math.max(window.innerWidth, window.innerHeight) * 0.8; 
                const duration = 2.0 + Math.random() * 1.5; 

                gsap.to(star, {
                    x: Math.cos(angle) * distance,
                    y: Math.sin(angle) * distance,
                    scale: (3 + Math.random() * 3) * brightnessBoost, // Chrome orbs get big as they pass
                    duration: duration,
                    ease: "power2.in", 
                    onComplete: () => {
                        star.remove(); 
                    }
                });

                // Animate opacity separately (fade in as they leave the center, fade out at the edges)
                gsap.to(star, {
                    keyframes: [
                        { opacity: 1, duration: duration * 0.4, ease: "power1.inOut" }, // Slower fade in so they appear smoothly from the hole
                        { opacity: 0, duration: duration * 0.6, ease: "power1.inOut" }  // Fade out
                    ]
                });
            }
        }, 40);

        // End the sequence and redirect
        setTimeout(() => {
            clearInterval(emitter);
            
            // Create a pure white overlay to flashbang the screen
            // This perfectly masks the browser redirect because Universe is a white website!
            const whiteout = document.createElement('div');
            whiteout.style.position = 'fixed';
            whiteout.style.top = '0';
            whiteout.style.left = '0';
            whiteout.style.width = '100vw';
            whiteout.style.height = '100vh';
            whiteout.style.backgroundColor = '#ffffff';
            whiteout.style.zIndex = '999999';
            whiteout.style.opacity = '0';
            whiteout.style.pointerEvents = 'none';
            document.body.appendChild(whiteout);

            // Hyperspace zoom: Scale forward while the screen aggressively fades to white
            gsap.to(warpContainer, {
                scale: 3, 
                duration: 0.8, 
                ease: "power2.in"
            });
            
            gsap.to(whiteout, {
                opacity: 1, 
                duration: 0.8, 
                ease: "power2.in",
                onComplete: () => {
                    window.location.href = targetUrl;
                }
            });
        }, 6000); // Wait 6 seconds total
    });
}

// --- THE CREEPY MATRIX RAIN LOOP ---
// HTML5 Canvas implementation (WAY smoother than glitchy GIFs!)
const canvas = document.getElementById('matrix-canvas-bg');
if (canvas) {
    const ctx = canvas.getContext('2d');
    
    // making the letters HUGE like before! (size 45)
    const fontSize = 45; 
    let drops = [];
    let lastWidth = window.innerWidth;
    
    function resizeCanvas() {
        // on mobile, only resize if the width actually changes (like if they turn the phone sideways)
        // this stops the address bar popping up from resetting the whole matrix canvas!
        if (window.innerWidth === lastWidth && canvas.width !== 0) return;
        lastWidth = window.innerWidth;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        const colCount = Math.floor(canvas.width / fontSize) + 1;
        // Only re-initialize if the number of columns changed significantly
        if (drops.length !== colCount) {
            drops = [];
            for (let i = 0; i < colCount; i++) {
                // scatter them way above the screen so they don't all fall in a straight line
                drops[i] = -Math.floor(Math.random() * 100); 
            }
        }
    }
    
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*!?';
    
    function drawMatrix() {
        // Paint a highly translucent black over the previous frame to create the fading trail
        ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Brand color: Cream Yellow
        ctx.fillStyle = 'rgb(241, 230, 178)';
        ctx.font = `${fontSize}px "Courier New", monospace`;
        ctx.textAlign = 'center';
        
        for (let i = 0; i < drops.length; i++) {
            // SPARSITY CONTROL: 30% chance a column just skips rendering this frame (creates broken, patchy, organic rain)
            if (Math.random() > 0.7) continue;
            
            // Only draw if it's actually on screen
            if (drops[i] * fontSize >= 0) {
                const char = chars[Math.floor(Math.random() * chars.length)];
                
                // Draw the character
                // Occasionally make the "head" of the drop pure white for a glowing effect
                if (Math.random() > 0.95) {
                    ctx.fillStyle = '#ffffff';
                } else {
                    ctx.fillStyle = 'rgb(241, 230, 178)';
                }
                
                ctx.fillText(char, i * fontSize + (fontSize/2), drops[i] * fontSize);
            }
            
            // Move the drop down
            drops[i]++;
            
            // If it hits the bottom, randomly reset it to the top (with a long random delay so it's sparse!)
            if (drops[i] * fontSize > canvas.height && Math.random() > 0.95) {
                // Reset it way above the screen so it takes time to fall back down (prevents a "full shower")
                drops[i] = -Math.floor(Math.random() * 30);
            }
        }
    }
    
    // Run at a smooth, constant interval (slower than normal matrix rain to match the chill vibe)
    setInterval(drawMatrix, 80);
}
