import React from 'react';

export default function Logo({ className = "w-10 h-10" }) {
    return (
        <img
            src="/logo.png"
            alt="Points Bank Logo"
            className={`object-contain ${className}`}
        />
    );
}
