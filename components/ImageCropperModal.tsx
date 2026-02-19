"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, ZoomIn, Loader2, RefreshCw } from 'lucide-react';
import { storeService } from '@/lib/services/storeService';
import { useToast } from '@/lib/context/ToastContext';

interface ImageCropperModalProps {
    isOpen: boolean;
    onClose: () => void;
    imageFile: File | null;
    aspectRatio: number; // e.g., 21/9, 16/9
    onCropComplete: (url: string) => void;
}

export default function ImageCropperModal({ isOpen, onClose, imageFile, aspectRatio, onCropComplete }: ImageCropperModalProps) {
    const { addToast } = useToast();
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [zoom, setZoom] = useState(1);
    const [loading, setLoading] = useState(false);

    // Drag state (simple offset)
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const startPan = useRef({ x: 0, y: 0 });

    const containerRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);

    // Load file preview
    useEffect(() => {
        if (imageFile) {
            const url = URL.createObjectURL(imageFile);
            setImageSrc(url);
            setZoom(1);
            setOffset({ x: 0, y: 0 });
            return () => URL.revokeObjectURL(url);
        }
    }, [imageFile]);

    // Pan Handlers
    const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
        setIsDragging(true);
        const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
        startPan.current = { x: clientX - offset.x, y: clientY - offset.y };
    };

    const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDragging) return;
        const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
        setOffset({
            x: clientX - startPan.current.x,
            y: clientY - startPan.current.y
        });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    // Crop Generation
    const handleSave = async () => {
        if (!imageRef.current || !containerRef.current) return;
        setLoading(true);

        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            // Define output resolution (High Quality)
            const OUTPUT_WIDTH = 1200;
            const OUTPUT_HEIGHT = OUTPUT_WIDTH / aspectRatio;

            canvas.width = OUTPUT_WIDTH;
            canvas.height = OUTPUT_HEIGHT;

            // Calculate mapping
            // The container view is strictly aspect-ratio'd.
            // We need to map the visible pixels of the image in the container to the canvas.

            const containerRect = containerRef.current.getBoundingClientRect();
            // How many output pixels per screen pixel?
            const pixelRatio = OUTPUT_WIDTH / containerRect.width;

            // Draw image with transforms
            // Translate to center of canvas
            ctx.translate(canvas.width / 2, canvas.height / 2);

            // Apply Offset (scaled)
            ctx.translate(offset.x * pixelRatio, offset.y * pixelRatio);

            // Apply Zoom
            ctx.scale(zoom, zoom);

            // Draw Image centered
            const img = imageRef.current;
            // The image is drawn at its natural size? No, we need to know how it's rendered.
            // In CSS, we usually 'object-fit' or just set width. 
            // Here, we render the image 'style={{ width: "100%", height: "auto" }}' inside the container?
            // Actually, best to render Image at natural size scaled to fit container "cover" logic initially?
            // Let's assume the image is rendered natural size * some base scale.

            // Simpler Logic: 
            // We are mirroring the CSS transform onto the canvas.
            // In CSS: transform-origin: center. 
            // Image width in CSS is currently: containerWidth (100%).

            // So on Canvas:
            // Image Width should be OUTPUT_WIDTH.
            // Image Height should be (naturalHeight / naturalWidth) * OUTPUT_WIDTH.

            const drawWidth = OUTPUT_WIDTH;
            const drawHeight = (img.naturalHeight / img.naturalWidth) * drawWidth;

            ctx.translate(-drawWidth / 2, -drawHeight / 2);
            ctx.drawImage(img, 0, 0, drawWidth, drawHeight);

            // Convert to Blob
            canvas.toBlob(async (blob) => {
                if (blob) {
                    const file = new File([blob], "cropped.jpg", { type: "image/jpeg" });
                    const url = await storeService.uploadImage(file);
                    if (url) {
                        onCropComplete(url);
                        onClose();
                    } else {
                        addToast("Erro no upload da imagem.", "error");
                    }
                }
                setLoading(false);
            }, 'image/jpeg', 0.9);

        } catch (err) {
            console.error(err);
            addToast("Erro ao processar imagem.", "error");
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-2xl space-y-6">

                {/* Header */}
                <div className="flex justify-between items-center text-white">
                    <h3 className="text-lg font-black uppercase italic">Ajustar Imagem</h3>
                    <button onClick={onClose}><X className="w-6 h-6" /></button>
                </div>

                {/* Crop Area */}
                <div
                    className="relative w-full bg-zinc-900 overflow-hidden cursor-move border-2 border-white/20 rounded-xl shadow-2xl"
                    style={{ aspectRatio: aspectRatio }}
                    ref={containerRef}
                    onMouseDown={handleMouseDown}
                    onTouchStart={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onTouchMove={handleMouseMove}
                    onMouseUp={handleMouseUp}

                    onMouseLeave={handleMouseUp}
                    onTouchEnd={handleMouseUp}
                >
                    {imageSrc && (
                        <div
                            className="w-full h-full flex items-center justify-center pointer-events-none"
                            style={{
                                transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
                                transformOrigin: 'center center',
                                transition: isDragging ? 'none' : 'transform 0.1s ease-out'
                            }}
                        >
                            {/* Render image at 100% width of container initially */}
                            <img
                                ref={imageRef}
                                src={imageSrc}
                                className="w-full h-auto max-w-none select-none"
                                draggable={false}
                            />
                        </div>
                    )}

                    {/* Grid Overlay */}
                    <div className="absolute inset-0 pointer-events-none opacity-30">
                        <div className="w-full h-full border border-white/50" />
                        <div className="absolute left-1/3 top-0 bottom-0 w-px bg-white/30" />
                        <div className="absolute right-1/3 top-0 bottom-0 w-px bg-white/30" />
                        <div className="absolute top-1/3 left-0 right-0 h-px bg-white/30" />
                        <div className="absolute bottom-1/3 left-0 right-0 h-px bg-white/30" />
                    </div>
                </div>

                {/* Controls */}
                <div className="bg-zinc-900 border border-white/10 p-6 rounded-2xl space-y-4">
                    <div className="flex items-center gap-4">
                        <ZoomIn className="w-5 h-5 text-white/50" />
                        <input
                            type="range"
                            min="1"
                            max="3"
                            step="0.1"
                            value={zoom}
                            onChange={(e) => setZoom(Number(e.target.value))}
                            className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                        />
                        <span className="text-xs font-bold text-white w-8">{Math.round(zoom * 100)}%</span>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={() => { setZoom(1); setOffset({ x: 0, y: 0 }); }}
                            className="flex-1 py-3 rounded-xl font-bold uppercase tracking-wide border border-white/10 hover:bg-white/5 text-white text-xs flex items-center justify-center gap-2"
                        >
                            <RefreshCw className="w-4 h-4" /> Resetar
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={loading}
                            className="flex-[2] py-3 rounded-xl font-black uppercase tracking-widest bg-indigo-500 hover:bg-indigo-600 text-white text-xs flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirmar & Upload'}
                        </button>
                    </div>
                </div>

                <p className="text-center text-[10px] text-white/30 uppercase tracking-widest">
                    Arraste para mover • Use o slider para zoom
                </p>
            </div>
        </div>
    );
}
