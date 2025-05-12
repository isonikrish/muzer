"use client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link2, ArrowBigUp } from "lucide-react";
import axios from "axios";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";

interface Stream {
    id: number;
    type: string;
    url: string;
    extractedId: string;
    title: string;
    thumbnail: string;
    active: boolean;
    userId: number;
    upvotes: any[];
}

export default function StreamView({
    creatorId,
    playVideo,
}: {
    creatorId: number;
    playVideo: boolean;
}) {
    const [streams, setStreams] = useState<Stream[]>([]);
    const [queue, setQueue] = useState<Stream[]>([]);
    const [url, setUrl] = useState("");
    const [currentVideo, setCurrentVideo] = useState<any>(null);
    const session = useSession();

    async function refreshStreams() {
        try {
            const res = await axios.get(`/api/streams?creatorId=${creatorId}`);
            if (res.status === 200 && Array.isArray(res.data.streams)) {
                setStreams(res.data?.streams);
                setCurrentVideo(res.data?.activeStream);
            } else {
                setStreams([]);
            }
        } catch (err) {
            console.error(err);
        }
    }

    useEffect(() => {
        const sortedQueue = [...streams].sort(
            (a, b) => b.upvotes.length - a.upvotes.length
        );
        setQueue(sortedQueue);
    }, [streams]);

    useEffect(() => {
        refreshStreams();
    }, [session, session?.data?.user]);

    async function handleUpvote(streamId: number) {
        try {
            const res = await axios.post("/api/streams/upvote", { streamId });
            if (res.status === 200) refreshStreams();
        } catch (error) {
            console.error(error);
        }
    }

    async function handleDownvote(streamId: number) {
        try {
            const res = await axios.post("/api/streams/downvote", { streamId });
            if (res.status === 200) refreshStreams();
        } catch (error) {
            console.error(error);
        }
    }

    async function handleAddQueue() {
        try {
            const res = await axios.post("/api/streams", { url, creatorId });
            if (res.status === 200) {
                refreshStreams();
                setUrl("");
            }
        } catch (error) {
            console.error(error);
        }
    }
    const playNext = async () => {
        try {
            const res = await axios.get("/api/next");
            if (res.status === 200) {
                await refreshStreams();
            }
        } catch (error) {
            console.error("Error playing next video:", error);
        }
    };

    return (
        <div className="px-5 py-5">
            <div className="flex justify-between p-3 gap-2">
                <Input
                    placeholder="Enter music URL..."
                    className="bg-zinc-800/50"
                    onChange={(e) => setUrl(e.target.value)}
                    value={url}
                />
                <div className="flex gap-2">
                    <Button onClick={handleAddQueue}>
                        <Link2 /> Add to Queue
                    </Button>
                    <Button>
                        <Link2 /> Share
                    </Button>
                </div>
            </div>

            <div className="flex justify-between gap-3">
                <Card className="w-full max-w-xl p-6 bg-zinc-800/70 rounded-2xl shadow-md flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <Label className="text-sm text-muted-foreground">Now Playing</Label>
                        {currentVideo?.stream ? (
                            playVideo ? (
                                <iframe
                                    src={`https://www.youtube.com/embed/${currentVideo.stream.extractedId}?autoplay=1`}
                                    allow="autoplay"
                                    width="100%"
                                    height={300}
                                ></iframe>
                            ) : (
                                <div className="text-lg font-medium text-white">
                                    <img
                                        src={currentVideo.stream.thumbnail}
                                        className="h-72  object-cover rounded"
                                    />
                                    <p className="mt-2 text-center font-semibold text-white">
                                        {currentVideo.stream.title}
                                    </p>
                                </div>
                            )
                        ) : (
                            <p className="text-xl font-semibold">No video playing</p>
                        )}


                    </div>

                    {playVideo && (
                        <Button
                            onClick={playNext}
                        >
                            Play Next
                        </Button>
                    )}
                </Card>

                <Card className="w-1/2 p-[24px] bg-zinc-800/50">
                    <Label>Queue</Label>
                    <div className="space-y-4">
                        {queue.length === 0 ? (
                            <div className="text-center text-gray-400 py-4">
                                No streams found
                            </div>
                        ) : (
                            queue.map((stream) => (
                                <div
                                    key={stream.id}
                                    className="flex items-center justify-between p-4 border-b border-zinc-600"
                                >
                                    <img
                                        src={stream.thumbnail}
                                        alt={stream.title}
                                        className="rounded-md h-28"
                                    />
                                    <div className="flex-1 ml-4">
                                        <h4 className="text-sm font-semibold text-white">
                                            {stream.title}
                                        </h4>
                                        <div className="mt-2 flex items-center gap-2">
                                            {stream.upvotes.some(
                                                (upvote: any) =>
                                                    upvote.user.email === session?.data?.user?.email
                                            ) ? (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="text-sm text-white border-white"
                                                    onClick={() => handleDownvote(stream.id)}
                                                >
                                                    <ArrowBigUp className="fill-white" />
                                                    {stream.upvotes.length}
                                                </Button>
                                            ) : (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="text-sm"
                                                    onClick={() => handleUpvote(stream.id)}
                                                >
                                                    <ArrowBigUp />
                                                    {stream.upvotes.length}
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                    <Button variant="outline" size="sm" className="text-sm">
                                        Remove
                                    </Button>
                                </div>
                            ))
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
}
