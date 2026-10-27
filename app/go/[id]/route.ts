// 링크 카드 클릭: 클릭 수 +1 후 실제 링크로 이동 (PRD 5.3)
import { addClick } from "@/lib/profile";

export async function GET(_req: Request, ctx: RouteContext<"/go/[id]">) {
  const { id } = await ctx.params;
  const url = await addClick(id);

  if (!url) {
    return new Response("링크를 찾을 수 없어요.", {
      status: 404,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  return new Response(null, {
    status: 302,
    headers: { Location: url, "Cache-Control": "no-store" },
  });
}
