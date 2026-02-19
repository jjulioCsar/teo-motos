"use client";
import { useParams } from 'next/navigation';

export default function TestPath() {
    const { slug } = useParams();
    return <div className="p-20 bg-white text-black text-4xl">Route matches! Slug: {slug}</div>;
}
