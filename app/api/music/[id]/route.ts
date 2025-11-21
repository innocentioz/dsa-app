import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";

const S3 = new S3Client({
  region: process.env.YANDEX_REGION,
  endpoint: "https://storage.yandexcloud.net",
  credentials: {
    accessKeyId: process.env.YANDEX_CLOUD_ACCESS_KEY!,
    secretAccessKey: process.env.YANDEX_CLOUD_SECRET_KEY!,
  },
});

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = Number(idParam);

    const track = await prisma.track.findUnique({ where: { id } });
    if (!track) {
      return NextResponse.json({ error: "Трек не найден" }, { status: 404 });
    }

    const bucket = process.env.YANDEX_CLOUD_BUCKET_NAME!;

    // URL → Key
    const key = track.url.replace(`https://storage.yandexcloud.net/${bucket}/`, "");

    // Удаляем из S3
    await S3.send(
      new DeleteObjectCommand({
        Bucket: bucket,
        Key: key,
      })
    );

    // Удаляем из БД
    await prisma.track.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Ошибка удаления:", error);
    return NextResponse.json(
      { error: "Не удалось удалить трек" },
      { status: 500 }
    );
  }
}