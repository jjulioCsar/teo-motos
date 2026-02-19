
import { NextResponse } from 'next/server';
import archiver from 'archiver';
import path from 'path';
import fs from 'fs';
import { Readable } from 'stream';

// Helper to convert Node stream to Web stream
function nodeStreamToWebStream(nodeStream: Readable) {
    return new ReadableStream({
        start(controller) {
            nodeStream.on('data', (chunk) => controller.enqueue(chunk));
            nodeStream.on('end', () => controller.close());
            nodeStream.on('error', (err) => controller.error(err));
        },
    });
}

export async function GET() {
    try {
        const archive = archiver('zip', {
            zlib: { level: 9 } // Sets the compression level.
        });

        // Pipe archive data to a pass-through stream which we can convert to Web Stream
        // Actually, we can just pipe to a simplified stream logic if needed, 
        // but Next.js App Router expects a Blob, Buffer, or Stream.
        // `archiver` is a writable/readable stream.

        const stream = new Readable();
        stream._read = () => { }; // No-op

        archive.on('data', (chunk) => stream.push(chunk));
        archive.on('end', () => stream.push(null));
        archive.on('error', (err) => { throw err; });

        // Start archiving
        const cwd = process.cwd();

        // Add files/folders to zip
        // Exclude node_modules, .next, .git, .env*
        archive.glob('**/*', {
            cwd: cwd,
            ignore: ['node_modules/**', '.next/**', '.git/**', '.env*', 'backup/**']
        });

        archive.finalize();

        // Convert the Node stream to a Web Stream for NextResponse
        const webStream = nodeStreamToWebStream(stream);

        return new NextResponse(webStream, {
            headers: {
                'Content-Type': 'application/zip',
                'Content-Disposition': `attachment; filename="loja-motos-source-code.zip"`
            }
        });

    } catch (err: any) {
        console.error("Zip error:", err);
        return NextResponse.json({ error: 'Failed to create zip' }, { status: 500 });
    }
}
