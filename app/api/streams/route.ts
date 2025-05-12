import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { z } from "zod";
import youtubesearchapi from "youtube-search-api";
// import { getServerSession } from "next-auth";

const YT_REGEX = new RegExp(
  "^https:\\/\\/www\\.youtube\\.com\\/watch\\?v=([\\w-]{11})"
);

const createStreamSchema = z.object({
  url: z.string(),
  creatorId: z.number(),
});

const fallbackImg =
  "https://media.istockphoto.com/id/1409329028/vector/no-picture-available-placeholder-thumbnail-icon-illustration-design.jpg?s=170667a&w=0&k=20&c=Q7gLG-xfScdlTlPGFohllqpNqpxsU1jy8feD_fob87U=";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const validatedData = createStreamSchema.safeParse(data);
    if (!validatedData.success) {
      return NextResponse.json({ msg: "invalid inputs" }, { status: 400 });
    }
    const { url, creatorId } = validatedData.data;
    const isYT = YT_REGEX.test(url);
    if (!isYT) {
      return NextResponse.json(
        { msg: "Incorrect youtube url" },
        { status: 400 }
      );
    }

    const extractedId = url.split("?v=")[1];
    const res = await youtubesearchapi.GetListByKeyword(extractedId, false, 1);
    const item = res.items[0];
    const thumbnail = item.thumbnail.thumbnails[0].url;
    const newStream = await prisma.stream.create({
      data: {
        userId: creatorId,
        url,
        extractedId,
        type: "Youtube",
        title: item.title ?? "can't find video",
        thumbnail: thumbnail ?? fallbackImg,
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

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const creatorId = searchParams.get("creatorId");

  if (!creatorId) {
    return NextResponse.json(
      { msg: "No creator id provided" },
      { status: 400 }
    );
  }

  const parsedCreatorId = parseInt(creatorId);
  const [streams, activeStream] = await Promise.all([
    await prisma.stream.findMany({
      where: {
        userId: parsedCreatorId,
        active: true
      },
      include: {
        upvotes: {
          include: {
            user: true,
          },
        },
      },
    }),
    prisma.currentStream.findFirst({
      where: {
        userId: parsedCreatorId,
      },
      include: {
        stream: true
      }
    }),
  ]);

  return NextResponse.json({streams, activeStream}, { status: 200 });
}
