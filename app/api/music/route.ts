import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const S3 = new S3Client({
  region: process.env.YANDEX_REGION,
  endpoint: "https://storage.yandexcloud.net",
  credentials: {
    accessKeyId: process.env.YANDEX_CLOUD_ACCESS_KEY!,
    secretAccessKey: process.env.YANDEX_CLOUD_SECRET_KEY!,
  },
});

export const GET = async () => {
  try {
    const tracks = await prisma.track.findMany({
      orderBy: { id: "asc" },
    });
    return NextResponse.json(tracks);
  } catch (error) {
    console.error("Ошибка получения треков:", error);
    return NextResponse.json({ error: "Не удалось загрузить треки" }, { status: 500 });
  }
};

export const POST = async (req: Request) => {
  try {
    const formData = await req.formData();
    const title = formData.get("title") as string;
    const file = formData.get("file") as File;

    if (!title || !file) {
      return NextResponse.json({ error: "Название и файл обязательны" }, { status: 400 });
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const fileName = `${Date.now()}-${file.name}`;
    const bucketName = process.env.YANDEX_CLOUD_BUCKET_NAME!;
    const filePath = `music/${fileName}`;

    await S3.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: filePath,
        Body: fileBuffer,
        ContentType: file.type || "audio/mpeg",
        ACL: "public-read", 
      })
    );

    const url = `https://storage.yandexcloud.net/${bucketName}/${filePath}`;

    const track = await prisma.track.create({
      data: { title, url },
    });

    return NextResponse.json(track, { status: 201 });
  } catch (error) {
    console.error("Ошибка загрузки трека:", error);
    return NextResponse.json({ error: "Не удалось загрузить трек" }, { status: 500 });
  }
};