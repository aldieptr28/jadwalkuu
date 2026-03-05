/**
 * generateId.js
 * Uses the browser's built-in crypto API for collision-free IDs.
 * Fixes: original app used sequential counters causing ID collisions on reload.
 */
export const generateId = () => crypto.randomUUID();
