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
    const [fallingStars, setFallingStars] = useState([]);
    const prevPointsRef = useRef(points);
    const doodleLine = "#4a4a4a";

    const sceneRef = useRef(null);
    const engineRef = useRef(null);
    const renderRef = useRef(null);
    const bodiesRef = useRef([]);
    const mouseConstraintRef = useRef(null);
    const [starPositions, setStarPositions] = useState([]);

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
        const colors = isDoodle
            ? ["#ffb5a7", "#ffc8a2", "#ffd5ba", "#ffe5d9"]
            : ["#22d3ee", "#38bdf8", "#fbbf24", "#fcd34d"];
        const stars = [];
        for (let i = 0; i < visualStarCount; i++) {
            const row = Math.floor(i / 5.5);
            const col = i % 5.5;
            const xBase = 22 + (col * 12);
            const xJitter = (sr(i + 42) - 0.5) * 16;
            const x = Math.min(82, Math.max(18, xBase + xJitter));
            const yBase = 124 - (row * 6.5);
            const yJitter = (sr(i * 3.3) - 0.5) * 8;
            stars.push({
                id: i,
                initialX: x,
                initialY: yBase + yJitter,
                rotate: sr(i * 1.7) * 360,
                scale: 0.65 + (sr(i * 9.1) * 0.4),
                color: colors[Math.floor(sr(i * 13) * colors.length)]
            });
        }
        return stars;
    }, [visualStarCount, isDoodle, numericSeed]);

    // Initialize Matter.js physics
    useEffect(() => {
        if (!sceneRef.current) return;

        const { Engine, Render, World, Bodies, Mouse, MouseConstraint, Events, Runner } = Matter;

        // Create engine with sleeping enabled for stability
        const engine = Engine.create({
            gravity: { x: 0, y: 0.8 },
            enableSleeping: true,
            positionIterations: 10,
            velocityIterations: 8
        });
        engineRef.current = engine;

        // Create renderer
        const render = Render.create({
            element: sceneRef.current,
            engine: engine,
            options: {
                width: 100,
                height: 140,
                wireframes: true,
                background: 'transparent',
                pixelRatio: window.devicePixelRatio || 1,
                wireframeBackground: 'transparent',
                showAngleIndicator: false,
                showVelocity: false
            }
        });
        renderRef.current = render;

        // Style the canvas for interaction but hide visuals
        render.canvas.style.position = 'absolute';
        render.canvas.style.top = '0';
        render.canvas.style.left = '0';
        render.canvas.style.width = '100%';
        render.canvas.style.height = '100%';
        render.canvas.style.pointerEvents = 'auto';
        render.canvas.style.zIndex = '20';
        render.canvas.style.opacity = '0'; // Hide the canvas visually

        // Create jar boundaries
        const wallThickness = 2;
        const walls = [
            // Bottom
            Bodies.rectangle(50, 127, 65, wallThickness, {
                isStatic: true,
                friction: 0.8,
                render: { fillStyle: 'transparent' }
            }),
            // Left wall
            Bodies.rectangle(15, 85, wallThickness, 90, {
                isStatic: true,
                friction: 0.5,
                render: { fillStyle: 'transparent' }
            }),
            // Right wall
            Bodies.rectangle(85, 85, wallThickness, 90, {
                isStatic: true,
                friction: 0.5,
                render: { fillStyle: 'transparent' }
            })
        ];

        // Create star bodies with stable physics
        const starBodies = starData.map((star) => {
            const body = Bodies.circle(star.initialX, star.initialY, 4, {
                restitution: 0.05,
                friction: 0.3,
                density: 0.002,
                frictionAir: 0.08,
                slop: 0.05,
                sleepThreshold: 60,
                render: {
                    fillStyle: star.color,
                    strokeStyle: isDoodle ? "#c18c00" : "#b8860b",
                    lineWidth: 1
                }
            });
            body.starData = star;
            return body;
        });

        bodiesRef.current = starBodies;
        World.add(engine.world, [...walls, ...starBodies]);

        // Add mouse control
        const mouse = Mouse.create(render.canvas);
        mouse.pixelRatio = window.devicePixelRatio || 1;

        const mouseConstraint = MouseConstraint.create(engine, {
            mouse: mouse,
            constraint: {
                stiffness: 0.05,
                render: { visible: false }
            }
        });
        mouseConstraintRef.current = mouseConstraint;
        World.add(engine.world, mouseConstraint);

        // Update star positions on each physics tick
        Events.on(engine, 'afterUpdate', () => {
            const positions = starBodies.map(body => ({
                x: body.position.x,
                y: body.position.y,
                angle: body.angle
            }));
            setStarPositions(positions);
        });

        // Device orientation for mobile tilt/shake effect
        const handleOrientation = (event) => {
            if (event.beta !== null && event.gamma !== null) {
                // beta: front-to-back tilt (-180 to 180)
                // gamma: left-to-right tilt (-90 to 90)

                // Map device tilt to gravity direction
                // Normalize and scale the values
                const maxTilt = 45; // degrees
                const gravityStrength = 1.0;

                // Calculate gravity components
                const gravityX = (event.gamma / maxTilt) * gravityStrength;
                const gravityY = 0.8 + (event.beta / maxTilt) * gravityStrength;

                // Update engine gravity
                engine.gravity.x = Math.max(-1, Math.min(1, gravityX));
                engine.gravity.y = Math.max(0.3, Math.min(1.5, gravityY));
            }
        };

        // Request permission for iOS 13+
        const requestPermission = async () => {
            if (typeof DeviceOrientationEvent !== 'undefined' &&
                typeof DeviceOrientationEvent.requestPermission === 'function') {
                try {
                    const permission = await DeviceOrientationEvent.requestPermission();
                    if (permission === 'granted') {
                        window.addEventListener('deviceorientation', handleOrientation);
                    }
                } catch (error) {
                    console.log('Device orientation permission denied');
                }
            } else if (window.DeviceOrientationEvent) {
                // For non-iOS devices, just add the listener
                window.addEventListener('deviceorientation', handleOrientation);
            }
        };

        requestPermission();

        // Run the engine and renderer
        const runner = Runner.create();
        Runner.run(runner, engine);
        Render.run(render);

        return () => {
            window.removeEventListener('deviceorientation', handleOrientation);
            Runner.stop(runner);
            Render.stop(render);
            World.clear(engine.world);
            Engine.clear(engine);
            render.canvas.remove();
        };
    }, [starData, isDoodle]);

    // Falling stars effect
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

    const removeFallingStar = (id) => {
        setFallingStars(prev => prev.filter(s => s.id !== id));
    };

    return (
        <div className="relative w-24 h-32 flex justify-center items-end">
            <div ref={sceneRef} className="absolute inset-0" style={{ zIndex: 20 }} />

            <div className="absolute inset-0 overflow-visible pointer-events-none z-50">
                <AnimatePresence>
                    {fallingStars.map(star => (
                        <FallingStar key={star.id} seed={star.id} delay={star.delay} onComplete={() => removeFallingStar(star.id)} />
                    ))}
                </AnimatePresence>
            </div>

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
                    <g mask="url(#jarMask)">
                        {starData.map((star, index) => {
                            const pos = starPositions[index] || { x: star.initialX, y: star.initialY, angle: 0 };
                            const wobble = {
                                p1: (Math.sin((star.id + 1) * 10000) % 1) * 1.5,
                                p2: (Math.sin((star.id + 2) * 10000) % 1) * 1.5,
                                p3: (Math.sin((star.id + 3) * 10000) % 1) * 1.5,
                                p4: (Math.sin((star.id + 4) * 10000) % 1) * 1.5,
                                p5: (Math.sin((star.id + 5) * 10000) % 1) * 1.5,
                            };
                            // Rounder, cuter star shape using bezier curves
                            const starPath = `
                                M 0 ${-9 + wobble.p1}
                                Q 1.5 -4.5 2.5 -3
                                Q 5.5 -2.5 ${9 + wobble.p2} -3
                                Q 6 -1 4 1.5
                                Q 5 5 ${6 + wobble.p3} ${8 + wobble.p4}
                                Q 3 6.5 0 4.5
                                Q -3 6.5 ${-6 + wobble.p5} 8
                                Q -5 5 -4 1.5
                                Q -6 -1 -9 -3
                                Q -5.5 -2.5 -2.5 -3
                                Q -1.5 -4.5 0 ${-9 + wobble.p1}
                                Z
                            `.replace(/\s+/g, ' ').trim();
                            const strokeColor = isDoodle ? "#d4a373" : "#0891b2";

                            return (
                                <g
                                    key={star.id}
                                    transform={`translate(${pos.x}, ${pos.y}) rotate(${(pos.angle * 180 / Math.PI) + star.rotate}) scale(${star.scale})`}
                                    style={{ cursor: 'grab' }}
                                >
                                    <path d={starPath} fill="rgba(0,0,0,0.06)" transform="translate(1, 1)" />
                                    <path d={starPath} fill={star.color} stroke={strokeColor} strokeWidth={isDoodle ? "1.4" : "1"} strokeLinejoin="round" />
                                    <path d="M-3 -3 L0 -5 L3 -3" stroke="white" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.3" />
                                </g>
                            );
                        })}
                    </g>
                </svg>

                <img
                    src={isDoodle ? "/mason_jar.png" : "/mason_jar_neon.png"}
                    alt="Jar"
                    style={{ mixBlendMode: isDoodle ? 'multiply' : 'normal' }}
                    className="absolute inset-0 w-full h-full object-contain pointer-events-none z-30"
                />

                <div className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none" style={{ paddingTop: '42px' }}>
                    <div className="relative">
                        <div className="absolute inset-0 bg-white/20 blur-md rounded-full -m-2" />
                        <span
                            className="relative font-black italic uppercase transition-all duration-300"
                            style={{
                                fontSize: points > 99 ? '30px' : '36px',
                                fontFamily: isDoodle ? '"M PLUS Rounded 1c", sans-serif' : '"Outfit", sans-serif',
                                fill: isDoodle ? doodleLine : 'white',
                                color: isDoodle ? doodleLine : 'white',
                                letterSpacing: '-0.05em',
                                opacity: 0.95
                            }}
                        >
                            {points}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
