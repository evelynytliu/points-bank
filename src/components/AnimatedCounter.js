import { useState, useEffect } from 'react';

export default function AnimatedCounter({ value }) {
    const [display, setDisplay] = useState(value);

    useEffect(() => {
        const start = display;
        if (start === value) return;

        const duration = 1000;
        let startTime = null;
        let reqId;

        const animate = (time) => {
            if (!startTime) startTime = time;
            const progress = Math.min((time - startTime) / duration, 1);
            const ease = 1 - Math.pow(1 - progress, 3); // Cubic ease out

            const current = start + (value - start) * ease;

            if (Number.isInteger(value)) {
                setDisplay(Math.floor(current));
            } else {
                setDisplay(parseFloat(current.toFixed(1)));
            }

            if (progress < 1) {
                reqId = requestAnimationFrame(animate);
            } else {
                setDisplay(value);
            }
        };
        reqId = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(reqId);
    }, [value]);

    return <>{display}</>;
}
