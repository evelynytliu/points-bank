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

    // Debug State - Minimal
    const [sensorStatus, setSensorStatus] = useState('Tap Jar to Start');
    const [shakeCount, setShakeCount] = useState(0);

    // Track container size for responsive physics
    const [containerSize, setContainerSize] = useState({ width: 100, height: 150 });

    // Auto-resize observer
    useEffect(() => {
        if (!isContainer || !sceneRef.current) return;
        const updateSize = () => {
            const parent = sceneRef.current.parentElement;
            if (parent) {
                const { offsetWidth, offsetHeight } = parent;
                if (Math.abs(offsetWidth - containerSize.width) > 5 || Math.abs(offsetHeight - containerSize.height) > 5) {
                    setContainerSize({ width: offsetWidth, height: offsetHeight });
                }
            }
        };
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
        const { width, height } = isContainer ? containerSize : { width: 100, height: 140 };
        const startY = isContainer ? height - 80 : 124;
        const scaleBase = isContainer ? 2.0 : 0.65;
        const cols = isContainer ? Math.floor(width / 50) : 5.5;

        for (let i = 0; i < visualStarCount; i++) {
            const row = Math.floor(i / cols);
            const col = i % cols;
            const xBase = isContainer ? (width * 0.1) + (col * (width * 0.8 / cols)) : 22 + (col * 12);
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

    // Initialize Matter.js
    useEffect(() => {
        if (!sceneRef.current) return;
        const { Engine, Render, World, Bodies, Mouse, MouseConstraint, Events, Runner } = Matter;
        const { width, height } = isContainer ? containerSize : { width: 100, height: 140 };

        const engine = Engine.create({
            gravity: { x: 0, y: isContainer ? 1.2 : 0.8 },
            enableSleeping: false,
            positionIterations: 10,
            velocityIterations: 8
        });
        engineRef.current = engine;

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

        render.canvas.style.position = 'absolute';
        render.canvas.style.top = '0';
        render.canvas.style.left = '0';
        render.canvas.style.width = '100%';
        render.canvas.style.height = '100%';
        render.canvas.style.pointerEvents = 'auto';
        render.canvas.style.zIndex = '20';
        render.canvas.style.opacity = '0';

        const wallOpts = { isStatic: true, friction: 0.8, render: { fillStyle: 'transparent' } };
        const walls = [];

        if (isContainer) {
            walls.push(Bodies.rectangle(width / 2, height, width, 60, wallOpts));
            walls.push(Bodies.rectangle(0, height / 2, 60, height, wallOpts));
            walls.push(Bodies.rectangle(width, height / 2, 60, height, wallOpts));
        } else {
            walls.push(Bodies.rectangle(50, 127, 65, 2, wallOpts));
            walls.push(Bodies.rectangle(15, 85, 2, 90, { ...wallOpts, friction: 0.5 }));
            walls.push(Bodies.rectangle(85, 85, 2, 90, { ...wallOpts, friction: 0.5 }));
        }

        const starBodies = starData.map((star) => {
            const radius = isContainer ? 20 : 6;
            const body = Bodies.polygon(star.initialX, star.initialY, 5, radius, {
                angle: (star.rotate * Math.PI) / 180,
                restitution: 0.2,
                friction: 0.2,
                density: 0.002,
                frictionAir: 0.02,
                slop: 0.05,
                render: { fillStyle: star.color, strokeStyle: "#d4a373", lineWidth: 1 }
            });
            body.starData = star;
            return body;
        });

        bodiesRef.current = starBodies;
        World.add(engine.world, [...walls, ...starBodies]);

        const mouse = Mouse.create(render.canvas);
        mouse.pixelRatio = window.devicePixelRatio || 1;
        const mouseConstraint = MouseConstraint.create(engine, {
            mouse: mouse,
            constraint: { stiffness: 0.2, render: { visible: false } }
        });
        World.add(engine.world, mouseConstraint);

        Events.on(engine, 'afterUpdate', () => {
            if (!engineRef.current) return;
            const positions = starBodies.map(body => ({
                x: body.position.x,
                y: body.position.y,
                angle: body.angle
            }));
            setStarPositions(positions);
        });

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

    // Handle Device Sensors (Gravity + Shake)
    useEffect(() => {
        const handleOrientation = (event) => {
            if (!engineRef.current) return;
            const baseGravityY = isContainer ? 1.2 : 0.8;
            if (event.beta !== null && event.gamma !== null) {
                const gravityX = (event.gamma / 45) * 1.8;
                const gravityY = baseGravityY + (event.beta / 90) * 0.5;
                engineRef.current.gravity.x = Math.max(-2, Math.min(2, gravityX));
                engineRef.current.gravity.y = Math.max(0.2, Math.min(3, gravityY));
            }
        };

        const handleMotion = (event) => {
            let x, y, z;
            if (event.acceleration && event.acceleration.x !== null) {
                x = event.acceleration.x;
                y = event.acceleration.y;
                z = event.acceleration.z;
            } else if (event.accelerationIncludingGravity) {
                x = event.accelerationIncludingGravity.x;
                y = event.accelerationIncludingGravity.y;
                z = event.accelerationIncludingGravity.z;
            }

            if (!engineRef.current || x === undefined || x === null) return;

            const magnitude = Math.sqrt(x * x + y * y + z * z);
            const threshold = (event.acceleration && event.acceleration.x !== null) ? 5 : 20;

            if (magnitude > threshold) {
                setShakeCount(prev => prev + 1);
                const bodies = Matter.Composite.allBodies(engineRef.current.world);
                bodies.forEach(body => {
                    if (!body.isStatic) {
                        const forceMagnitude = 0.002 * magnitude;
                        Matter.Body.applyForce(body, body.position, {
                            x: (Math.random() - 0.5) * forceMagnitude,
                            y: -(Math.random() * forceMagnitude)
                        });
                    }
                });
            }
        };

        // CRITICAL: Request Permission Response Handler
        const onEnableSensors = (e) => {
            // Remove listeners immediately to prevent multiple calls
            window.removeEventListener('click', onEnableSensors, true);
            window.removeEventListener('touchstart', onEnableSensors, true);

            // iOS 13+ Check
            if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
                // Motion Permission - DIRECT CHAIN
                DeviceMotionEvent.requestPermission()
                    .then(response => {
                        if (response === 'granted') {
                            setSensorStatus('Active');
                            window.addEventListener('devicemotion', handleMotion);
                        } else {
                            setSensorStatus(`Denied: ${response}`);
                        }
                    })
                    .catch(err => {
                        // setSensorStatus(`Err: ${err}`);
                        // Squelch error if not user interaction related to keep clean UI
                    });

                // Orientation Permission - Parallel Request
                if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
                    DeviceOrientationEvent.requestPermission()
                        .then(response => {
                            if (response === 'granted') {
                                window.addEventListener('deviceorientation', handleOrientation);
                            }
                        }).catch(e => { });
                }

            } else {
                // Non-iOS / Standard API
                setSensorStatus('Active');
                window.addEventListener('devicemotion', handleMotion);
                window.addEventListener('deviceorientation', handleOrientation);
            }
        };

        // Attach listeners using CAPTURE phase to ensure we catch the first interaction
        window.addEventListener('click', onEnableSensors, true);
        window.addEventListener('touchstart', onEnableSensors, true);

        return () => {
            window.removeEventListener('deviceorientation', handleOrientation);
            window.removeEventListener('devicemotion', handleMotion);
            window.removeEventListener('click', onEnableSensors, true);
            window.removeEventListener('touchstart', onEnableSensors, true);
        };
    }, [isContainer]);

    // Falling stars logic
    useEffect(() => {
        const currentPoints = Math.floor(points);
        const prevPoints = Math.floor(prevPointsRef.current);
        if (currentPoints > prevPoints) {
            const count = Math.min(currentPoints - prevPoints, 5);
            const batchSeed = Date.now();
            const newStars = Array.from({ length: count }).map((_, i) => ({
                id: batchSeed + i, delay: i * 0.15
            }));
            setFallingStars(prev => [...prev, ...newStars]);
        }
        prevPointsRef.current = points;
    }, [points]);

    const removeFallingStar = (id) => setFallingStars(prev => prev.filter(s => s.id !== id));

    return (
        <div className={`relative ${isContainer ? 'w-full h-full' : 'w-24 h-32'} flex justify-center items-end`}>
            {/* Minimal Status Text */}
            {isContainer && sensorStatus !== 'Active' && (
                <div className="absolute top-2 left-2 z-[100] bg-black/50 text-white text-[10px] px-2 py-1 rounded pointer-events-none font-mono">
                    {sensorStatus}
                </div>
            )}

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
                        <div key={star.id} style={{
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            transform: `translate(${pos.x}px, ${pos.y}px) rotate(${pos.angle}rad) scale(${star.scale})`,
                            transformOrigin: 'center center',
                            width: '1px',
                            height: '1px',
                        }}>
                            <div className="transform -translate-x-1/2 -translate-y-1/2 text-[color:var(--star-color)]" style={{ '--star-color': star.color }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="#d4a373" strokeWidth="1" strokeLinejoin="round" strokeLinecap="round">
                                    <path d="M12 2c.6 0 1.1.4 1.4.9l2.5 5.7 6.2.7c1 .1 1.4 1.3.6 2l-4.7 4.3 1.3 6.1c.2 1-.9 1.8-1.7 1.3L12 19.9l-5.6 3.1c-.9.5-1.9-.3-1.7-1.3l1.3-6.1-4.7-4.3c-.8-.7-.4-1.9.6-2l6.2-.7 2.5-5.7c.3-.5.8-.9 1.4-.9z" />
                                </svg>
                            </div>
                        </div>
                    );
                })}
            </div>

            {!isContainer && (
                <div className={`relative w-full h-full flex items-end ${isDoodle ? '' : 'filter drop-shadow-[0_0_20px_rgba(34,211,238,0.2)]'}`}>
                    <svg viewBox="0 0 100 140" className="absolute inset-0 w-full h-full overflow-visible z-10">
                        <defs><mask id="jarMask"><path d="M20,38 L80,38 Q92,38 92,55 L90,112 Q88,128 70,128 L30,128 Q12,128 10,112 L8,55 Q8,38 20,38 Z" fill="white" /></mask></defs>
                        <path d="M20,38 L80,38 Q92,38 92,55 L90,112 Q88,128 70,128 L30,128 Q12,128 10,112 L8,55 Q8,38 20,38 Z" fill={isDoodle ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.4)"} mask="url(#jarMask)" />
                        <path d="M20,38 L80,38 Q92,38 92,55 L90,112 Q88,128 70,128 L30,128 Q12,128 10,112 L8,55 Q8,38 20,38 Z" fill="none" stroke={isDoodle ? "#4a4a4a" : "cyan"} strokeWidth="2" />
                    </svg>
                </div>
            )}
        </div>
    );
}
