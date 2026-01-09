'use client';
import { useEffect, useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Matter from 'matter-js';



const RisingStar = ({ x, y, color, scale, onComplete }) => (
    <motion.div
        initial={{ x, y, opacity: 1, scale, rotate: Math.random() * 360 }}
        animate={{
            y: y - 100,
            opacity: 0,
            scale: scale * 0.5,
            rotate: Math.random() * 360
        }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        onAnimationComplete={onComplete}
        style={{ position: 'absolute', left: 0, top: 0, color: color, zIndex: 40, pointerEvents: 'none' }}
    >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="#d4a373" strokeWidth="1" strokeLinejoin="round" strokeLinecap="round">
            <path d="M12 2c.6 0 1.1.4 1.4.9l2.5 5.7 6.2.7c1 .1 1.4 1.3.6 2l-4.7 4.3 1.3 6.1c.2 1-.9 1.8-1.7 1.3L12 19.9l-5.6 3.1c-.9.5-1.9-.3-1.7-1.3l1.3-6.1-4.7-4.3c-.8-.7-.4-1.9.6-2l6.2-.7 2.5-5.7c.3-.5.8-.9 1.4-.9z" />
        </svg>
    </motion.div>
);

export default function StarJar({ points, theme, seed = 0, starSize = 5, t }) {
    const isDoodle = theme === 'doodle';
    const isContainer = theme === 'container';

    const [exitStars, setExitStars] = useState([]);
    const [stablePoints, setStablePoints] = useState(points);
    // Debounce points to prevent rapid fluctuations triggering double animations
    useEffect(() => {
        const timer = setTimeout(() => {
            setStablePoints(points);
        }, 100);
        return () => clearTimeout(timer);
    }, [points]);

    const prevPointsRef = useRef(stablePoints);
    const ignoreGlitchRef = useRef(0);
    const prevCountRef = useRef(0);

    const sceneRef = useRef(null);
    const engineRef = useRef(null);
    const renderRef = useRef(null);
    const bodiesRef = useRef([]);
    const [starPositions, setStarPositions] = useState([]);

    // Sensor State
    const [hasPermission, setHasPermission] = useState(false);
    const [showPermissionButton, setShowPermissionButton] = useState(false);
    const [debugMsg, setDebugMsg] = useState('');

    // Track container size for responsive physics
    const [containerSize, setContainerSize] = useState({ width: 100, height: 150 });
    const [isVisible, setIsVisible] = useState(false);

    // Visibility Observer (90% threshold)
    useEffect(() => {
        if (!sceneRef.current) return;
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                }
            });
        }, { threshold: 0.9 }); // 90% visible

        // Observe the parent container for better context
        const target = sceneRef.current.parentElement || sceneRef.current;
        observer.observe(target);

        return () => observer.disconnect();
    }, []);

    // Auto-resize observer
    useEffect(() => {
        if (!isContainer || !sceneRef.current) return;

        const currentRef = sceneRef.current; // access ref in effect

        const updateSize = () => {
            if (!currentRef) return;
            const parent = currentRef.parentElement;
            if (parent) {
                const { offsetWidth, offsetHeight } = parent;
                if (Math.abs(offsetWidth - containerSize.width) > 5 || Math.abs(offsetHeight - containerSize.height) > 5) {
                    setContainerSize({ width: offsetWidth, height: offsetHeight });
                }
            }
        };
        updateSize();

        // Safety check before observing
        if (currentRef.parentElement) {
            const observer = new ResizeObserver(updateSize);
            observer.observe(currentRef.parentElement);
            return () => observer.disconnect();
        }
    }, [isContainer, containerSize.width, containerSize.height]);

    const visualStarCount = useMemo(() => {
        // Hard Cap to prevent crash on massive points (e.g. 9999999)
        const MAX_VISUAL_STARS = 300;

        if (stablePoints <= MAX_VISUAL_STARS) return stablePoints;

        return MAX_VISUAL_STARS;
    }, [stablePoints]);

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
            ? ["#ffb5a7", "#ffc8a2", "#ffd5ba", "#ffe5d9"] // Doodle Pink/Peach
            : isContainer
                ? ["#fbbf24", "#f59e0b", "#fde047", "#ffffff", "#fef3c7"] // Jar Gold/Yellow/Dreamy
                : ["#22d3ee", "#38bdf8", "#fbbf24", "#fcd34d"]; // Neon Blue/Gold

        const stars = [];
        const { width, height } = isContainer ? containerSize : { width: 100, height: 140 };
        const startY = isContainer ? height - 80 : 124;

        // Mobile Star Size Adjustment (80% of desktop)
        const isMobileWidth = width < 600;

        // Scale based on starSize (1-10, default 5)
        const userScaleFactor = Math.max(0.2, starSize / 5.0);
        const scaleBase = (isContainer ? (isMobileWidth ? 1.6 : 2.0) : 0.65) * userScaleFactor;
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
    }, [visualStarCount, isDoodle, isContainer, numericSeed, containerSize.width, containerSize.height, starSize]);

    // Initialize Matter.js Engine & Walls (Run once or on layout change)
    useEffect(() => {
        if (!sceneRef.current) return;
        const { Engine, Render, World, Bodies, Mouse, MouseConstraint, Events, Runner } = Matter;
        const { width, height } = isContainer ? containerSize : { width: 100, height: 140 };

        // 1. Setup Engine
        const engine = Engine.create({
            gravity: { x: 0, y: isContainer ? 1.0 : 0.8 },
            enableSleeping: true,
            positionIterations: 24,
            velocityIterations: 16,
            constraintIterations: 4
        });
        engineRef.current = engine;

        // 2. Setup Render
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

        // Render Style
        render.canvas.style.position = 'absolute';
        render.canvas.style.top = '0';
        render.canvas.style.left = '0';
        render.canvas.style.width = '100%';
        render.canvas.style.height = '100%';
        render.canvas.style.pointerEvents = 'auto';
        render.canvas.style.zIndex = '20';
        render.canvas.style.opacity = '0';

        // 3. Setup Walls
        const wallOpts = { isStatic: true, friction: 0.8, render: { fillStyle: 'transparent' }, label: 'wall' };
        const walls = [];

        if (isContainer) {
            walls.push(Bodies.rectangle(width / 2, height, width, 60, wallOpts)); // Floor
            walls.push(Bodies.rectangle(0, height / 2, 60, height, wallOpts)); // Left
            walls.push(Bodies.rectangle(width, height / 2, 60, height, wallOpts)); // Right
            walls.push(Bodies.rectangle(width / 2, 0, width, 60, wallOpts)); // Ceiling

            // Central Obstacle
            // Central Obstacle REMOVED to prevent stars from getting stuck
            // walls.push(Bodies.rectangle(width / 2, 110, 180, 80, {
            //     isStatic: true,
            //     render: { visible: false },
            //     chamfer: { radius: 10 },
            //     label: 'wall'
            // }));
        } else {
            walls.push(Bodies.rectangle(50, 127, 65, 2, wallOpts));
            walls.push(Bodies.rectangle(15, 85, 2, 90, { ...wallOpts, friction: 0.5 }));
            walls.push(Bodies.rectangle(85, 85, 2, 90, { ...wallOpts, friction: 0.5 }));
        }

        World.add(engine.world, walls);

        // 4. Interaction
        const mouse = Mouse.create(render.canvas);
        mouse.pixelRatio = window.devicePixelRatio || 1;
        const mouseConstraint = MouseConstraint.create(engine, {
            mouse: mouse,
            constraint: { stiffness: 0.2, render: { visible: false } }
        });
        World.add(engine.world, mouseConstraint);

        // 5. Update Loop
        Events.on(engine, 'afterUpdate', () => {
            if (!engineRef.current) return;
            // Only sync dynamic bodies (stars)
            const bodies = Matter.Composite.allBodies(engine.world).filter(b => b.label === 'star');
            const positions = bodies.map(body => {
                // Caps
                if (body.speed > 15) Matter.Body.setSpeed(body, 15);
                if (Math.abs(body.angularVelocity) > 0.5) Matter.Body.setAngularVelocity(body, Math.sign(body.angularVelocity) * 0.5);

                return {
                    id: body.starId, // Map back to starData via ID attached to body
                    x: body.position.x,
                    y: body.position.y,
                    angle: body.angle
                };
            });
            // We need to map positions back to index order? 
            // setStarPositions expects array matching starData index? 
            // Actually previous implementation used map(body => ...). bodiesRef was ordered.
            // Now bodies might be unordered.
            // But starData is ordered by ID (0..N).
            // Let's store a map of id -> pos.
            // Or just update specific indices.
            // For simplicity, let's use a dict or find by ID.
            // But React state needs array.
            // We'll fix this in the state usage.
            setStarPositions(positions);
        });

        // 6. Run
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
    }, [isContainer, isDoodle, containerSize.width, containerSize.height]);

    // Sync Stars (Run when points change)
    useEffect(() => {
        if (!engineRef.current) return;

        const { World, Bodies } = Matter;
        // Check current bodies to decide if this is an initial load or an update
        const currentBodies = Matter.Composite.allBodies(engineRef.current.world).filter(b => b.label === 'star');

        // Gate: ONLY return if invisible AND we already have stars (meaning this is an update animation)
        // If currentBodies.length is 0, we MUST run creating stars so the jar isn't empty initially.
        if (!isVisible && currentBodies.length > 0) return;

        const engine = engineRef.current;
        const currentIds = new Set(currentBodies.map(b => b.starId));

        // Find stars to add
        const starsToAdd = starData.filter(s => !currentIds.has(s.id));

        // Find stars to remove
        const targetIds = new Set(starData.map(s => s.id));
        const bodiesToRemove = currentBodies.filter(b => !targetIds.has(b.starId));

        // Check for net decrease in star count
        const isNetDecrease = starData.length < prevCountRef.current;
        prevCountRef.current = starData.length;

        // Execute Remove
        const isAdding = starsToAdd.length > 0;
        const isRemoving = bodiesToRemove.length > 0;

        if (isRemoving) {
            // Only animate exit if we strictly have fewer stars than before
            // AND we are not adding (double safety, though isNetDecrease should handle it)
            if (isNetDecrease && !isAdding) {
                // Trigger exit animation
                const exiting = bodiesToRemove.map(b => ({
                    id: b.starId + '_' + Date.now(), // Ensure unique key for animation
                    x: b.position.x,
                    y: b.position.y,
                    color: b.render.fillStyle,
                    scale: (b.bounds.max.x - b.bounds.min.x) / 18 // Approx scale recovery
                }));
                setExitStars(prev => [...prev, ...exiting]);
            }
            // Always remove the bodies from physics even if silent
            World.remove(engine.world, bodiesToRemove);
        }

        // Execute Add
        if (isAdding) {
            const newBodies = starsToAdd.map(star => {
                const radius = 9 * star.scale;
                const body = Bodies.polygon(star.initialX, star.initialY, 5, radius, {
                    angle: (star.rotate * Math.PI) / 180,
                    restitution: 0.4,
                    friction: 0.2,
                    density: 0.002,
                    frictionAir: 0.04,
                    slop: 0.05,
                    label: 'star',
                    render: { fillStyle: star.color, strokeStyle: "#d4a373", lineWidth: 1 }
                });
                body.starId = star.id;
                // Add initial velocity? No, let them fall.
                return body;
            });
            World.add(engine.world, newBodies);
        }

    }, [starData]);

    // Handle Device Sensors (Gravity + Shake)
    useEffect(() => {
        // Only attach if permission granted or non-iOS
        if (!hasPermission && typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
            setShowPermissionButton(true);
            return;
        }

        const handleOrientation = (event) => {
            if (!engineRef.current) return;
            const baseGravityY = isContainer ? 1.2 : 0.8; // Reverted to 1.2 for better shake response
            if (event.beta !== null && event.gamma !== null) {
                // gamma: 左右傾斜 (-90 到 90)
                // beta: 前後傾斜 (-180 到 180)
                const gravityX = (event.gamma / 45) * 2.0;
                const gravityY = baseGravityY + (event.beta / 45) * 2.5; // Increased sensitivity to allow strong negative gravity (upside down)

                engineRef.current.gravity.x = Math.max(-3, Math.min(3, gravityX));
                engineRef.current.gravity.y = Math.max(-3, Math.min(4, gravityY)); // Allow stronger negative gravity to fall to mouth
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
                const bodies = Matter.Composite.allBodies(engineRef.current.world);
                bodies.forEach(body => {
                    if (!body.isStatic) {
                        // 增加力道，讓星星被晃動時更明顯
                        const forceMagnitude = 0.0015 * magnitude; // 增加5倍力道
                        Matter.Body.applyForce(body, body.position, {
                            x: (Math.random() - 0.5) * forceMagnitude * 3, // 水平方向力道更大
                            y: (Math.random() - 0.5) * forceMagnitude * 2 // 垂直方向也增加
                        });
                    }
                });
            }
        };

        window.addEventListener('devicemotion', handleMotion);
        window.addEventListener('deviceorientation', handleOrientation);

        return () => {
            window.removeEventListener('deviceorientation', handleOrientation);
            window.removeEventListener('devicemotion', handleMotion);
        };
    }, [isContainer, hasPermission]);

    // Explicit Permission Request Handler
    const requestPermission = () => {
        if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
            DeviceMotionEvent.requestPermission()
                .then(response => {
                    if (response === 'granted') {
                        setHasPermission(true);
                        setShowPermissionButton(false);
                    } else {
                        setDebugMsg('Permission Denied. Check Settings > Safari > Motion');
                    }
                })
                .catch(err => {
                    setDebugMsg(err.message);
                });

            // Also try orientation
            if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
                DeviceOrientationEvent.requestPermission().catch(() => { });
            }
        } else {
            // Non-iOS
            setHasPermission(true);
            setShowPermissionButton(false);
        }
    };

    // Falling stars logic (Triggered by STABLE points increase)
    // Falling stars logic REMOVED.
    // We strictly use physics simulation for adding stars now.
    useEffect(() => {
        const currentPoints = Math.floor(stablePoints);
        prevPointsRef.current = currentPoints;
    }, [stablePoints]);



    return (
        <div className={`relative ${isContainer ? 'w-full h-full' : 'w-24 h-32'} flex justify-center items-end`}>

            {/* Explicit Permission Button for iOS */}
            {isContainer && showPermissionButton && (
                <div className="absolute inset-0 z-[60] flex flex-col items-center justify-end pb-32 bg-black/20 backdrop-blur-[2px] rounded-3xl">
                    <button
                        onClick={requestPermission}
                        className="bg-white/90 text-amber-600 px-4 py-2 rounded-full font-bold shadow-lg active:scale-95 transition-transform text-sm border-2 border-amber-200"
                    >
                        {t?.enable_shake || '開啟搖晃感應 (Enable Shake)'}
                    </button>
                    {debugMsg && <div className="mt-2 text-[10px] text-white bg-red-500/80 px-2 py-1 rounded">{debugMsg}</div>}
                </div>
            )}

            <div ref={sceneRef} className="absolute inset-0" style={{ zIndex: 20 }} />

            <div className="absolute inset-0 overflow-visible pointer-events-none z-40">
                <AnimatePresence>
                    {exitStars.map(star => (
                        <RisingStar key={star.id} {...star} onComplete={() => setExitStars(prev => prev.filter(s => s.id !== star.id))} />
                    ))}
                </AnimatePresence>
            </div>



            <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden rounded-[inherit]">
                {starData.map((star) => {
                    const pos = starPositions.find(p => p.id === star.id);
                    if (!pos) return null;
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
