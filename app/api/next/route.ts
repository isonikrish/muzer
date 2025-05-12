import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession();
  const user = await prisma.user.findUnique({
    where: {
      email: session?.user?.email ?? "",
    },
  });

  if (!user) {
    return NextResponse.json({ msg: "Unauthorized" }, { status: 400 });
  }

  const mostUpvotedStream = await prisma.stream.findFirst({
    where: {
      userId: user.id,
      active: true,
    },
    orderBy: {
      upvotes: {
        _count: "desc",
      },
    },
  });

  if (!mostUpvotedStream) {
    return NextResponse.json({ msg: "No stream found" }, { status: 404 });
  }

  await prisma.currentStream.upsert({
    where: {
      userId: user.id,
    },
    update: {
      streamId: mostUpvotedStream.id,
    },
    create: {
      userId: user.id,
      streamId: mostUpvotedStream.id,
    },
  });

  await prisma.stream.update({
    where: {
      id: mostUpvotedStream.id,
    },
    data: {
      active: false, // Mark as inactive instead of deleting
    },
  });

  return NextResponse.json(mostUpvotedStream, { status: 200 });
}

