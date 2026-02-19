"use client";

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function GestaoRedirect() {
    const router = useRouter();
    const { slug } = useParams();

    useEffect(() => {
        // Redirect to the dashboard which manages this slug or the global dashboard
        // For now, redirecting to the root dashboard
        router.push('/dashboard');
    }, [router, slug]);

    return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );
}
