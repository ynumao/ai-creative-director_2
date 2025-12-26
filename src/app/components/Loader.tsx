"use client";

import { useEffect, useState } from "react";

export default function Loader() {
    const [progress, setProgress] = useState(0);
    const [text, setText] = useState("INITIALIZING");

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) return 100;
                return prev + 1;
            });
        }, 50); // 5 seconds total approx

        const textInterval = setInterval(() => {
            const texts = ["ANALYZING LP STRUCTURE", "DETECTING TARGET AUDIENCE", "EVALUATING DESIGN TOKENS", "GENERATING CREATIVE BRIEFS", "FINALIZING OUTPUT"];
            setText(texts[Math.floor(Math.random() * texts.length)]);
        }, 1200);

        return () => {
            clearInterval(interval);
            clearInterval(textInterval);
        };
    }, []);

    return (
        <div className="flex flex-col items-center justify-center p-12 space-y-8 w-full">
            <div className="w-full max-w-md space-y-2">
                <div className="flex justify-between text-xs font-bold tracking-widest">
                    <span>{text}</span>
                    <span>{progress}%</span>
                </div>
                <div className="h-[2px] w-full bg-gray-200 overflow-hidden">
                    <div
                        className="h-full bg-black transition-all duration-100 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>
        </div>
    );
}
