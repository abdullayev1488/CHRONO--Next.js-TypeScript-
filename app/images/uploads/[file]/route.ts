import { readUploadedImage } from "@/backend/lib/imageStorage";

type Context = { params: Promise<{ file: string }> };

/** Admin tərəfindən yüklənmiş şəkilləri diskdən verir (fayl adı sərt yoxlanılır). */
export async function GET(_request: Request, { params }: Context): Promise<Response> {
  const { file } = await params;
  const image = await readUploadedImage(file);

  if (!image) return new Response("Not found", { status: 404 });

  return new Response(new Uint8Array(image.data), {
    headers: {
      "Content-Type": image.contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
