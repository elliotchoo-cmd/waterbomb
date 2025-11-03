
import React from 'react';

interface TutorialOverlayProps {
    step: number;
    onNext: () => void;
}

const TUTORIAL_TEXT = [
    '', // Step 0 is inactive
    "WELCOME TO WATERBOMB! It's your turn. Click your catapult, drag to aim, and release to fire. Try to hit the AI's flag!",
    "INCOMING! Click anywhere on your screen to launch an Air Shield. It costs 25 Charge. Try to intercept their bomb!",
    "GREAT INTERCEPT! You've 'caught' their bomb and added it to your ammo! Defense is the best way to get more bombs.",
    "Get their flag to 0% or have the drier flag after 20 rounds. Good luck!"
];

export const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ step, onNext }) => {
    if (step === 0 || step >= TUTORIAL_TEXT.length) {
        return null;
    }

    const text = TUTORIAL_TEXT[step];
    const buttonText = step === 4 ? "Start Game!" : "Continue";

    return (
        <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-50 p-8" style={{ animation: 'fade-in 0.5s' }}>
            <div className="bg-slate-800/80 border-2 border-cyan-400 p-8 rounded-xl shadow-2xl max-w-2xl text-center text-white backdrop-blur-sm">
                <p className="text-2xl leading-relaxed">{text}</p>
                <button
                    onClick={onNext}
                    className="mt-8 px-8 py-4 bg-cyan-600 text-white rounded-lg text-2xl font-bold hover:bg-cyan-500 transition-all duration-200 transform hover:scale-105 shadow-lg border-2 border-cyan-400"
                >
                    {buttonText}
                </button>
            </div>
        </div>
    );
};