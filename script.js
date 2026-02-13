document.addEventListener('DOMContentLoaded', () => {
    // --- Theme Toggle Logic ---
    const themeBtn = document.getElementById('theme-btn');
    const icon = themeBtn.querySelector('i');

    // Check local storage or system preference
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    function setTheme(theme) {
        document.body.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        if (theme === 'dark') {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        } else {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        }
    }

    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
        setTheme('dark');
    } else {
        setTheme('light');
    }

    themeBtn.addEventListener('click', () => {
        const currentTheme = document.body.getAttribute('data-theme');
        setTheme(currentTheme === 'light' ? 'dark' : 'light');
    });

    // --- Interactive Cursor Glow ---
    const cursorGlow = document.querySelector('.cursor-glow');
    if (cursorGlow) {
        document.addEventListener('mousemove', (e) => {
            gsap.to(cursorGlow, {
                x: e.clientX,
                y: e.clientY,
                duration: 0.5,
                ease: 'power2.out'
            });
        });
    }

    // --- 3D Tilt Effect for Cards ---
    // --- 3D Tilt Effect for Cards (Right Click to Move) ---
    const card = document.querySelector('.glass');
    if (card) {
        let isRightClickDown = false;

        // Prevent context menu on right click to allow interaction
        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });

        document.addEventListener('mousedown', (e) => {
            if (e.button === 2) { // Right click
                isRightClickDown = true;
                document.body.style.cursor = 'grabbing';
            }
        });

        document.addEventListener('mouseup', () => {
            isRightClickDown = false;
            document.body.style.cursor = 'default';
            // Reset position
            gsap.to(card, {
                duration: 1,
                rotationY: 0,
                rotationX: 0,
                ease: 'elastic.out(1, 0.5)'
            });
        });

        document.addEventListener('mousemove', (e) => {
            if (!isRightClickDown) return;

            // Clamp values to prevent extreme rotation
            const x = gsap.utils.clamp(-20, 20, (window.innerWidth / 2 - e.clientX) / 25);
            const y = gsap.utils.clamp(-20, 20, (window.innerHeight / 2 - e.clientY) / 25);

            gsap.to(card, {
                duration: 0.1, // Faster response when dragging
                rotationY: -x,
                rotationX: y,
                ease: 'power1.out',
                transformPerspective: 1000,
                transformOrigin: 'center'
            });
        });
    }


    // --- GSAP Animations (Entry) ---
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    // Animate Landing Page
    if (document.querySelector('.profile-card')) {
        gsap.set('.profile-card', { autoAlpha: 1 }); // Ensure visibility

        tl.fromTo('.profile-card',
            { opacity: 0, y: 100, rotationX: 10 },
            { opacity: 1, y: 0, rotationX: 0, duration: 1.2 }
        )
            .fromTo('.img-container',
                { opacity: 0, scale: 0, rotation: -45 },
                { opacity: 1, scale: 1, rotation: 0, duration: 1, ease: 'back.out(1.7)' },
                '-=0.8'
            )
            .fromTo('.name',
                { opacity: 0, x: -50, clipPath: 'inset(0 100% 0 0)' },
                { opacity: 1, x: 0, clipPath: 'inset(0 0% 0 0)', duration: 0.8 },
                '-=0.6'
            )
            .fromTo('.major',
                { opacity: 0, x: -30 },
                { opacity: 1, x: 0, duration: 0.6 },
                '-=0.6'
            )
            .fromTo('.description',
                { opacity: 0, y: 30 },
                { opacity: 1, y: 0, duration: 0.6 },
                '-=0.4'
            )
            .fromTo('.cta-btn',
                { opacity: 0, scale: 0.8 },
                { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(2)' },
                '-=0.2'
            );
    }

    // Animate Links Page
    if (document.querySelector('.links-card')) {
        const tlLink = gsap.timeline({ defaults: { ease: 'power2.out' } });

        tlLink.fromTo('.links-card',
            { opacity: 0, y: 50, rotationX: 10 },
            { opacity: 1, y: 0, rotationX: 0, duration: 1 }
        )
            .fromTo('.profile-thumb',
                { opacity: 0, scale: 0, rotation: 180 },
                { opacity: 1, scale: 1, rotation: 0, duration: 0.8, ease: 'back.out(1.7)' },
                '-=0.6'
            )
            .fromTo('.link-item',
                { opacity: 0, x: -100, stagger: 0.1 },
                { opacity: 1, x: 0, duration: 0.8, ease: 'power4.out', stagger: 0.1 },
                '-=0.4'
            );
    }

    // Magnetic Button Effect
    document.querySelectorAll('.cta-btn, .link-item, #theme-btn').forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            gsap.to(btn, {
                duration: 0.3,
                x: x * 0.3,
                y: y * 0.3,
                ease: 'power2.out'
            });
        });

        btn.addEventListener('mouseleave', () => {
            gsap.to(btn, {
                duration: 0.6,
                x: 0,
                y: 0,
                ease: 'elastic.out(1, 0.4)'
            });
        });
    });
    // --- Physics Particle Splash (Google Anti-Gravity Style) ---
    const canvas = document.getElementById('splash-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particles = [];
        const gravity = 0.5;
        const friction = 0.99; // Air resistance

        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        class Particle {
            constructor(x, y) {
                this.x = x;
                this.y = y;
                // Random explosive velocity
                this.vx = (Math.random() - 0.5) * 15;
                this.vy = (Math.random() - 0.5) * 15;
                this.size = Math.random() * 8 + 4; // Larger chunks
                this.color = document.body.getAttribute('data-theme') === 'dark'
                    ? `hsl(${Math.random() * 60 + 200}, 100%, 70%)`
                    : `hsl(${Math.random() * 60 + 10}, 100%, 60%)`;
            }

            update() {
                // Apply physics
                this.vy += gravity;
                this.vx *= friction;
                this.vy *= friction;

                this.x += this.vx;
                this.y += this.vy;

                // Bounce off floor
                if (this.y + this.size > canvas.height) {
                    this.y = canvas.height - this.size;
                    this.vy *= -0.6; // Bounce with energy loss
                }

                // Bounce off walls
                if (this.x + this.size > canvas.width || this.x - this.size < 0) {
                    this.vx *= -0.6;
                }

                // Remove checks (let them pile up or disappear slowly)
                // For performance, we'll shrink them slowly after they settle
                if (Math.abs(this.vx) < 0.1 && Math.abs(this.vy) < 0.1 && this.y > canvas.height - 50) {
                    this.size *= 0.95;
                }
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = this.color;
                ctx.fill();
            }
        }

        function animateParticles() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            for (let i = 0; i < particles.length; i++) {
                particles[i].update();
                particles[i].draw();

                if (particles[i].size <= 0.5) {
                    particles.splice(i, 1);
                    i--;
                }
            }
            requestAnimationFrame(animateParticles);
        }

        animateParticles();

        document.addEventListener('mousemove', (e) => {
            const card = document.querySelector('.glass');
            if (card) {
                const rect = card.getBoundingClientRect();
                const isOverCard = e.clientX >= rect.left && e.clientX <= rect.right &&
                    e.clientY >= rect.top && e.clientY <= rect.bottom;

                if (!isOverCard) {
                    // Spawn fewer but more "solid" looking particles
                    if (Math.random() > 0.5) { // Limit spawn rate
                        particles.push(new Particle(e.clientX, e.clientY));
                    }
                }
            }
        });

        // Click to explode
        document.addEventListener('mousedown', (e) => {
            for (let i = 0; i < 10; i++) {
                particles.push(new Particle(e.clientX, e.clientY));
            }
        });
    }
});
