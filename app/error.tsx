
'use client';

import { useEffect } from 'react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4 p-8 text-center bg-black/90 text-white z-[9999]">
            <h2 className="text-2xl font-bold text-red-500">Something went wrong!</h2>
            <p className="text-gray-400 font-mono text-sm max-w-md">
                {error.message || "An unexpected error occurred."}
            </p>
            {error.stack && (
                <pre className="text-[10px] text-red-400/60 max-w-2xl overflow-auto p-4 bg-black/50 rounded-lg text-left whitespace-pre-wrap font-mono">
                    {error.stack}
                </pre>
            )}
            <button
                onClick={() => reset()}
                className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full border border-white/20 transition-all"
            >
                Try again
            </button>
        </div>
    );
}

