import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { z } from "zod";
const YT_REGEX = new RegExp("^https://www.youtube.com/watch?v=([w-]{11})");
const createStreamSchema = z.object({
  creatorId: z.number(),
  url: z.string(),
});
export async function POST(req: Request) {
  try {
    const data = await req.json();
    const validatedData = createStreamSchema.safeParse(data);
    if (!validatedData.success) {
      return NextResponse.json({ msg: "invalid inputs" }, { status: 400 });
    }

    const { creatorId, url } = validatedData.data;
    const isYT = YT_REGEX.test(url);
    if (!isYT) {
      return NextResponse.json(
        { msg: "Incorrect youtube url" },
        { status: 400 }
      );
    }
    const extractedId = url.split("?v=")[1];
    const newStream = await prisma.stream.create({
      data: {
        userId: creatorId,
        url,
        extractedId,
        type: "Youtube",
      },
    });
    if (!newStream) {
      return NextResponse.json(
        { msg: "Failed to add new stream" },
        { status: 400 }
      );
    }
    return NextResponse.json({ msg: "Stream Added" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ msg: "Internal Server Error" }, { status: 500 });
  }
}
