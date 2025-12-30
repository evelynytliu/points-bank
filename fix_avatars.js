const fs = require('fs');
const path = require('path');

const filePath = path.join('d:', 'Projects', 'screen_points', 'points-v3', 'src', 'app', 'dashboard', 'page.js');
let content = fs.readFileSync(filePath, 'utf8');

const newAvatars = `const AVATARS = [
    '🦊', '🐱', '🐶', '🦁', '🐼', '🐨', '🐷', '🐯', 
    '🐸', '🐙', '🦖', '🦄', '🐝', '🦋', '⚽', '🏀', 
    '🎨', '🚀', '🚁', '🚃', '🌈', '🍦', '🍩', '🍕', 
    '🍓', '🥑', '🎮', '🍎', '🧩', '🎸', '🛹', '🎻', 
    '🎭', '🎬', '🧬', '💎', '🔥', '⚡', '🍀', '🌸'
];`;

content = content.replace(/const AVATARS = \[[\s\S]*?\];/, newAvatars);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully fixed AVATARS array');
