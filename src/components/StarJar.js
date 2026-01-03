'use client';
import { useEffect, useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Matter from 'matter-js';

const FallingStar = ({ delay, onComplete, seed }) => {
    const randomX = (seed % 10) - 5;
    const randomRotate = (seed % 360);

    return (
        <motion.div
            initial={{ y: -30, x: randomX, opacity: 0, scale: 0.5, rotate: randomRotate }}
            animate={{
                y: [null, 100],
                opacity: [0, 1, 1, 0],
                scale: [1.2, 1],
                rotate: [randomRotate, randomRotate + 180]
            }}
            transition={{
                duration: 0.6,
                ease: "backIn",
                delay
            }}
            onAnimationComplete={onComplete}
            className="absolute top-0 left-1/2 -ml-3 text-[#ffd740] z-50 pointer-events-none filter drop-shadow-md"
        >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
            </svg>
        </motion.div>
    );
};

export default function StarJar({ points, theme, seed = 0 }) {
    const isDoodle = theme === 'doodle';
    const isContainer = theme === 'container';
    const [fallingStars, setFallingStars] = useState([]);
    const prevPointsRef = useRef(points);

    const sceneRef = useRef(null);
    const engineRef = useRef(null);
    const renderRef = useRef(null);
    const bodiesRef = useRef([]);
    const [starPositions, setStarPositions] = useState([]);

    // Track container size for responsive physics
    const [containerSize, setContainerSize] = useState({ width: 100, height: 150 }); // Init with dummy values

    // Auto-resize observer
    useEffect(() => {
        if (!isContainer || !sceneRef.current) return;

        const updateSize = () => {
            const parent = sceneRef.current.parentElement;
            if (parent) {
                const { offsetWidth, offsetHeight } = parent;
                // Add debounce or check diff
                if (Math.abs(offsetWidth - containerSize.width) > 5 || Math.abs(offsetHeight - containerSize.height) > 5) {
                    setContainerSize({ width: offsetWidth, height: offsetHeight });
                }
            }
        };

        // Initial measurement
        updateSize();

        const observer = new ResizeObserver(updateSize);
        observer.observe(sceneRef.current.parentElement);
        return () => observer.disconnect();
    }, [isContainer, containerSize.width, containerSize.height]);

    const visualStarCount = useMemo(() => {
        if (points <= 100) return points;
        return 100 + Math.floor((points - 100) / 4);
    }, [points]);

    const numericSeed = useMemo(() => {
        if (typeof seed === 'number') return seed;
        let h = 0;
        const str = String(seed);
        for (let i = 0; i < str.length; i++) h = Math.imul(31, h) + str.charCodeAt(i) | 0;
        return h;
    }, [seed]);

    const starData = useMemo(() => {
        const sr = (s) => {
            const x = Math.sin(s + numericSeed) * 10000;
            return x - Math.floor(x);
        };
        const colors = isDoodle || isContainer
            ? ["#ffb5a7", "#ffc8a2", "#ffd5ba", "#ffe5d9"]
            : ["#22d3ee", "#38bdf8", "#fbbf24", "#fcd34d"];

        const stars = [];

        // Dynamic config
        const { width, height } = isContainer ? containerSize : { width: 100, height: 140 };
        const startY = isContainer ? height - 80 : 124;
        const scaleBase = isContainer ? 2.5 : 0.65;

        // Adjust columns for wider containers
        const cols = isContainer ? Math.floor(width / 50) : 5.5;

        for (let i = 0; i < visualStarCount; i++) {
            const row = Math.floor(i / cols);
            const col = i % cols;

            const xBase = isContainer
                ? (width * 0.1) + (col * (width * 0.8 / cols))
                : 22 + (col * 12);

            const xJitter = (sr(i + 42) - 0.5) * (isContainer ? 30 : 16);
            const x = Math.min(width - 20, Math.max(20, xBase + xJitter));

            const yBase = startY - (row * (isContainer ? 25 : 6.5));
            const yJitter = (sr(i * 3.3) - 0.5) * (isContainer ? 20 : 8);

            stars.push({
                id: i,
                initialX: x,
                initialY: Math.max(0, yBase + yJitter),
                rotate: sr(i * 1.7) * 360,
                scale: scaleBase + (sr(i * 9.1) * (isContainer ? 1.0 : 0.4)),
                color: colors[Math.floor(sr(i * 13) * colors.length)]
            });
        }
        return stars;
    }, [visualStarCount, isDoodle, isContainer, numericSeed, containerSize]);

    // Initialize Matter.js physics
    useEffect(() => {
        if (!sceneRef.current) return;

        const { Engine, Render, World, Bodies, Mouse, MouseConstraint, Events, Runner } = Matter;

        const { width, height } = isContainer ? containerSize : { width: 100, height: 140 };

        // Create engine
        const engine = Engine.create({
            gravity: { x: 0, y: isContainer ? 1.2 : 0.8 },
            enableSleeping: false, // Updated: Keep bodies active for better interaction
            positionIterations: 10,
            velocityIterations: 8
        });
        engineRef.current = engine;

        // Create renderer
        const render = Render.create({
            element: sceneRef.current,
            engine: engine,
            options: {
                width: width,
                height: height,
                wireframes: false,
                background: 'transparent',
                pixelRatio: window.devicePixelRatio || 1
            }
        });
        renderRef.current = render;

        // Style canvas
        render.canvas.style.position = 'absolute';
        render.canvas.style.top = '0';
        render.canvas.style.left = '0';
        render.canvas.style.width = '100%';
        render.canvas.style.height = '100%';
        render.canvas.style.pointerEvents = 'auto'; // allow mouse interaction
        render.canvas.style.zIndex = '20';
        render.canvas.style.opacity = '0';

        // Create Boundaries based on dynamic size
        const wallOpts = {
            isStatic: true,
            friction: 0.8,
            render: { fillStyle: 'transparent' }
        };

        const walls = [];

        if (isContainer) {
            // Full Container Walls
            walls.push(Bodies.rectangle(width / 2, height, width, 60, wallOpts)); // Floor
            walls.push(Bodies.rectangle(0, height / 2, 60, height, wallOpts)); // Left
            walls.push(Bodies.rectangle(width, height / 2, 60, height, wallOpts)); // Right
        } else {
            // Original Mini Jar Walls
            walls.push(Bodies.rectangle(50, 127, 65, 2, wallOpts));
            walls.push(Bodies.rectangle(15, 85, 2, 90, { ...wallOpts, friction: 0.5 }));
            walls.push(Bodies.rectangle(85, 85, 2, 90, { ...wallOpts, friction: 0.5 }));
        }

        const starBodies = starData.map((star) => {
            // Updated: Larger radius to match visual scale (Visual is ~60px, Radius 25 -> 50px diameter)
            const radius = isContainer ? 25 : 6;
            // Updated: Use Polygon (5 sides) instead of Circle for irregular stacking (less neat)
            const body = Bodies.polygon(star.initialX, star.initialY, 5, radius, {
                angle: (star.rotate * Math.PI) / 180, // Sync initial angle
                restitution: 0.2, // Slightly more bouncy
                friction: 0.2, // Reduced friction to slide better on tilt
                density: 0.002,
                frictionAir: 0.02, // Reduced air resistance
                slop: 0.05,
                render: {
                    fillStyle: star.color,
                    strokeStyle: "#d4a373",
                    lineWidth: 1
                }
            });
            body.starData = star;
            return body;
        });

        bodiesRef.current = starBodies;
        World.add(engine.world, [...walls, ...starBodies]);

        // Mouse Control
        const mouse = Mouse.create(render.canvas);
        mouse.pixelRatio = window.devicePixelRatio || 1;
        const mouseConstraint = MouseConstraint.create(engine, {
            mouse: mouse,
            constraint: { stiffness: 0.2, render: { visible: false } }
        });
        World.add(engine.world, mouseConstraint);

        // Update star positions
        Events.on(engine, 'afterUpdate', () => {
            if (!engineRef.current) return;
            const positions = starBodies.map(body => ({
                x: body.position.x,
                y: body.position.y,
                angle: body.angle
            }));
            setStarPositions(positions);
        });

        // Run
        const runner = Runner.create();
        Runner.run(runner, engine);
        Render.run(render);

        return () => {
            Runner.stop(runner);
            Render.stop(render);
            World.clear(engine.world);
            Engine.clear(engine);
            render.canvas.remove();
            engineRef.current = null;
        };
    }, [starData, isDoodle, isContainer, containerSize]);

    // Handle Device Orientation (Gravity)
    useEffect(() => {
        const handleOrientation = (event) => {
            if (!engineRef.current) return;

            // Default gravity (container vs mini)
            const baseGravityY = isContainer ? 1.2 : 0.8;

            if (event.beta !== null && event.gamma !== null) {
                const maxTilt = 45;
                const gravityStrength = 1.5; // Increased strength

                // Gamma: Left/Right tilt (-90 to 90)
                const gravityX = (event.gamma / maxTilt) * gravityStrength;

                // Beta: Front/Back tilt (-180 to 180). Phone upright ~90. Flat ~0.
                // We want: Upright -> Gravity Down (Y=1). Flat -> Gravity Down (Y=1)??
                // Actually, if held upright, stars fall down relative to screen. Gravity Y=1.
                // If tilted upside down, Y=-1.
                // The MatterJS gravity is relative to the canvas coordinate system.
                // Mobile screen Y is always "Down" visually.
                // Changing Gravity Y based on Beta makes sense if we want stars to fall "towards earth" even if phone is inverted.
                // Let's keep it simple: Map Beta relative to upright.

                const gravityY = baseGravityY + (event.beta / 90) * 0.5; // Subtle Y change

                // Clamp
                engineRef.current.gravity.x = Math.max(-2, Math.min(2, gravityX));
                engineRef.current.gravity.y = Math.max(0.2, Math.min(2, gravityY));
            }
        };

        const initSensor = async () => {
            if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
                // iOS 13+ requires permission
                try {
                    const permission = await DeviceOrientationEvent.requestPermission();
                    if (permission === 'granted') {
                        window.addEventListener('deviceorientation', handleOrientation);
                    }
                } catch (e) {
                    console.log("Orientation permission denied or error", e);
                }
            } else {
                // Android / Non-iOS
                window.addEventListener('deviceorientation', handleOrientation);
            }
        };

        const onInteraction = () => {
            initSensor();
            // Remove listeners after first attempt
            window.removeEventListener('click', onInteraction);
            window.removeEventListener('touchstart', onInteraction);
        };

        // Attach interaction listeners to trigger permission request
        window.addEventListener('click', onInteraction);
        window.addEventListener('touchstart', onInteraction);

        return () => {
            window.removeEventListener('deviceorientation', handleOrientation);
            window.removeEventListener('click', onInteraction);
            window.removeEventListener('touchstart', onInteraction);
        };
    }, [isContainer]);

    // Falling stars visual effect
    useEffect(() => {
        const currentPoints = Math.floor(points);
        const prevPoints = Math.floor(prevPointsRef.current);
        if (currentPoints > prevPoints) {
            const count = Math.min(currentPoints - prevPoints, 5);
            const batchSeed = Date.now();
            const newStars = Array.from({ length: count }).map((_, i) => ({
                id: batchSeed + i,
                delay: i * 0.15
            }));
            setFallingStars(prev => [...prev, ...newStars]);
        }
        prevPointsRef.current = points;
    }, [points]);

    const removeFallingStar = (id) => setFallingStars(prev => prev.filter(s => s.id !== id));

    return (
        <div className={`relative ${isContainer ? 'w-full h-full' : 'w-24 h-32'} flex justify-center items-end`}>
            <div ref={sceneRef} className="absolute inset-0" style={{ zIndex: 20 }} />

            <div className="absolute inset-0 overflow-visible pointer-events-none z-50">
                <AnimatePresence>
                    {fallingStars.map(star => (
                        <FallingStar key={star.id} seed={star.id} delay={star.delay} onComplete={() => removeFallingStar(star.id)} />
                    ))}
                </AnimatePresence>
            </div>

            <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden rounded-[inherit]">
                {starPositions.map((pos, i) => {
                    const star = starData[i];
                    if (!star) return null;
                    return (
                        <div
                            key={star.id}
                            style={{
                                position: 'absolute',
                                left: 0,
                                top: 0,
                                transform: `translate(${pos.x}px, ${pos.y}px) rotate(${pos.angle}rad) scale(${star.scale})`,
                                transformOrigin: 'center center',
                                width: '1px',
                                height: '1px',
                            }}
                        >
                            <div className="transform -translate-x-1/2 -translate-y-1/2 text-[color:var(--star-color)]" style={{ '--star-color': star.color }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="#d4a373" strokeWidth="1" strokeLinejoin="round" strokeLinecap="round">
                                    <path d="M12 2 L15.09 8.26 L22 9.27 L17 14.14 L18.18 21.02 L12 17.77 L5.82 21.02 L7 14.14 L2 9.27 L8.91 8.26 Z" />
                                </svg>
                            </div>
                        </div>
                    );
                })}
            </div>

            {!isContainer && (
                <div className={`relative w-full h-full flex items-end ${isDoodle ? '' : 'filter drop-shadow-[0_0_20px_rgba(34,211,238,0.2)]'}`}>
                    <svg viewBox="0 0 100 140" className="absolute inset-0 w-full h-full overflow-visible z-10">
                        <defs>
                            <mask id="jarMask">
                                <path d="M20,38 L80,38 Q92,38 92,55 L90,112 Q88,128 70,128 L30,128 Q12,128 10,112 L8,55 Q8,38 20,38 Z" fill="white" />
                            </mask>
                        </defs>
                        <path
                            d="M20,38 L80,38 Q92,38 92,55 L90,112 Q88,128 70,128 L30,128 Q12,128 10,112 L8,55 Q8,38 20,38 Z"
                            fill={isDoodle ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.4)"}
                            mask="url(#jarMask)"
                        />
                        <path
                            d="M20,38 L80,38 Q92,38 92,55 L90,112 Q88,128 70,128 L30,128 Q12,128 10,112 L8,55 Q8,38 20,38 Z"
                            fill="none"
                            stroke={isDoodle ? "#4a4a4a" : "cyan"}
                            strokeWidth="2"
                        />
                    </svg>
                </div>
            )}
        </div>
    );
}
