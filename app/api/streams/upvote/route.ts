import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";

const upvoteSchema = z.object({
  streamId: z.number(),
});
export async function POST(req: Request) {
  const data = await req.json();
  const session = await getServerSession();
  try {
    const validatedData = upvoteSchema.safeParse(data);
    if (!validatedData.data) {
      return NextResponse.json({ msg: "Invalid inputs" }, { status: 400 });
    }
    if (!session?.user?.email) {
      return NextResponse.json({ msg: "unauthorized" }, { status: 400 });
    }
    const { streamId } = validatedData.data;
    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
    });
    if (!user) {
      return NextResponse.json({ msg: "unauthorized" }, { status: 400 });
    }
    const newUpvote = await prisma.upvote.create({
      data: {
        userId: user?.id,
        streamId,
      },
    });
    if (!newUpvote) {
      return NextResponse.json({ msg: "Failed to upvote" }, { status: 400 });
    }
    return NextResponse.json({ msg: "Upvoted" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ msg: "Internal Server Error" }, { status: 500 });
  }
}
