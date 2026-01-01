import React, { useEffect, useRef, useState, useCallback } from 'react';

const FlappyBird = () => {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);

    // Game State
    const [gameState, setGameState] = useState('PLAYING');
    const [score, setScore] = useState(0);

    // Bird & Physics settings
    const birdY = useRef(200);
    const birdVelocity = useRef(0);
    const birdWidth = 45;
    const birdHeight = 35;

    const gravity = 0.5;
    const jumpStrength = -7;
    const pipeSpeed = 1.8;
    const pipeSpawnRate = 3000;

    const pipes = useRef([]);
    const lastPipeTime = useRef(0);

    // --- 1. NEW IMAGE STATE ---
    // We store all loaded images here
    const [images, setImages] = useState({
        background: null,
        bird: null,
        pipe: null
    });
    const [areImagesLoaded, setAreImagesLoaded] = useState(false);

    // --- 2. LOAD ALL IMAGES ---
    useEffect(() => {
        const birdImg = new Image();
        const pipeImg = new Image();
        const bgImg = new Image();

        // Set sources (Assuming files are in public/assets/)
        birdImg.src = "/assets/bird.png";
        pipeImg.src = "/assets/pipe.png";
        bgImg.src = "/assets/background.jpg";

        let loadedCount = 0;
        const handleLoad = () => {
            loadedCount++;
            if (loadedCount === 3) {
                setImages({
                    bird: birdImg,
                    pipe: pipeImg,
                    background: bgImg
                });
                setAreImagesLoaded(true);
            }
        };

        birdImg.onload = handleLoad;
        pipeImg.onload = handleLoad;
        bgImg.onload = handleLoad;
    }, []);

    // Resize Handler
    useEffect(() => {
        const handleResize = () => {
            if (containerRef.current && canvasRef.current) {
                const { clientWidth, clientHeight } = containerRef.current;
                canvasRef.current.width = clientWidth;
                canvasRef.current.height = clientHeight;

                if (gameState === 'PLAYING' && birdY.current === 200) {
                    birdY.current = clientHeight / 2;
                }
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize();
        return () => window.removeEventListener('resize', handleResize);
    }, [gameState]);

    // Controls
    const resetGame = useCallback(() => {
        if (canvasRef.current) {
            birdY.current = canvasRef.current.height / 2;
        }
        birdVelocity.current = 0;
        pipes.current = [];
        setScore(0);
        setGameState('PLAYING');
    }, []);

    const handleJump = useCallback(() => {
        if (gameState === 'PLAYING') {
            birdVelocity.current = jumpStrength;
        } else {
            resetGame();
        }
    }, [gameState, jumpStrength, resetGame]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                handleJump();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleJump]);

    // --- 3. GAME LOOP WITH NEW DRAWING LOGIC ---
    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        const loop = (timestamp) => {
            if (gameState !== 'PLAYING') return;

            const width = canvas.width;
            const height = canvas.height;

            // Physics Update
            birdVelocity.current += gravity;
            birdY.current += birdVelocity.current;

            if (timestamp - lastPipeTime.current > pipeSpawnRate) {
                const gapSize = 150;
                const minPipeHeight = 50;
                const maxPipeHeight = height - gapSize - minPipeHeight;
                const randomHeight = Math.floor(Math.random() * (maxPipeHeight - minPipeHeight + 1) + minPipeHeight);

                pipes.current.push({
                    x: width,
                    topHeight: randomHeight,
                    gap: gapSize,
                    passed: false
                });
                lastPipeTime.current = timestamp;
            }

            pipes.current.forEach(pipe => {
                pipe.x -= pipeSpeed;
                const birdLeft = 250;
                const birdRight = 250 + birdWidth;
                const birdTop = birdY.current;
                const birdBottom = birdY.current + birdHeight;
                const pipeLeft = pipe.x;
                const pipeRight = pipe.x + 101;

                if (birdRight > pipeLeft && birdLeft < pipeRight) {
                    if (birdTop < pipe.topHeight || birdBottom > pipe.topHeight + pipe.gap) {
                        setGameState('GAME_OVER');
                    }
                }

                if (!pipe.passed && birdLeft > pipeRight) {
                    setScore(prev => prev + 1);
                    pipe.passed = true;
                }
            });

            pipes.current = pipes.current.filter(pipe => pipe.x + 101 > 0);

            if (birdY.current + birdHeight > height || birdY.current < 0) {
                setGameState('GAME_OVER');
            }

            // --- DRAWING SECTION ---

            ctx.clearRect(0, 0, width, height);

            // A. Draw Background
            if (areImagesLoaded && images.background) {
                // Draws image to fill the entire canvas
                ctx.drawImage(images.background, 0, 0, width, height);
            } else {
                ctx.fillStyle = '#70c5ce';
                ctx.fillRect(0, 0, width, height);
            }

            // B. Draw Pipes
            pipes.current.forEach(pipe => {
                const pipeW = 101;

                if (areImagesLoaded && images.pipe) {
                    // 1. Top Pipe (Needs to be flipped upside down)
                    ctx.save();
                    // Move context to the bottom-left of the top pipe area
                    ctx.translate(pipe.x, pipe.topHeight);
                    // Flip vertically
                    ctx.scale(1, -1);
                    // Draw image at (0,0) which is now physically (pipe.x, pipe.topHeight)
                    ctx.drawImage(images.pipe, 0, 0, pipeW, pipe.topHeight + 20);
                    ctx.restore();

                    // 2. Bottom Pipe (Normal)
                    const bottomPipeY = pipe.topHeight + pipe.gap;
                    const bottomPipeHeight = height - bottomPipeY;
                    ctx.drawImage(images.pipe, pipe.x, bottomPipeY, pipeW, bottomPipeHeight);

                } else {
                    // Fallback if images fail
                    ctx.fillStyle = '#228b22';
                    ctx.fillRect(pipe.x, 0, pipeW, pipe.topHeight);
                    ctx.fillRect(pipe.x, pipe.topHeight + pipe.gap, pipeW, height - (pipe.topHeight + pipe.gap));
                }
            });

            // C. Draw Bird

            if (areImagesLoaded && images.bird) {
                ctx.drawImage(images.bird, 250, birdY.current, birdWidth, birdHeight);
                // ... inside the loop where you draw the bird ...

                // 2. DEBUG: Draw a red box around it to see the "real" size
                // ctx.strokeStyle = "red";
                // ctx.lineWidth = 2;
                // ctx.strokeRect(50, birdY.current, birdWidth, birdHeight);
            } else {
                ctx.fillStyle = 'yellow';
                ctx.fillRect(250, birdY.current, birdWidth, birdHeight);
            }

            // D. Draw Score
            ctx.fillStyle = 'white';
            ctx.font = '24px Arial';
            // Add a text shadow so score is visible on any background
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 3;
            ctx.strokeText(`Score: ${score}`, 20, 40);
            ctx.fillText(`Score: ${score}`, 20, 40);

            animationFrameId = requestAnimationFrame(loop);
        };

        animationFrameId = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(animationFrameId);
    }, [gameState, areImagesLoaded, images, score]);

    return (
        <div
            ref={containerRef}
            className="w-full h-full relative overflow-hidden focus:outline-none"
        >
            <canvas ref={canvasRef} className="block" />

            {gameState === 'GAME_OVER' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-white">
                    <h2 className="text-4xl font-bold mb-4">Game Over</h2>
                    <p className="text-xl mb-4">Score: {score}</p>
                    <p className="mb-6 text-sm">Press Space to Restart</p>
                    <button
                        onClick={resetGame}
                        className="px-6 py-2 bg-orange-500 rounded-full font-bold hover:bg-orange-600 transition"
                    >
                        Play Again
                    </button>
                </div>
            )}
        </div>
    );
};

export default function App() {
    return (
        <div className="h-screen w-screen bg-gray-100 overflow-hidden">
            <FlappyBird />
        </div>
    );
}