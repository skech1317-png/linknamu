// 메인(공개 프로필) 페이지 — wireframe.png: 원형 사진 → 이름 → 한 줄 소개 → 링크 카드 목록
import type { Metadata } from "next";
import { Suspense } from "react";
import { BIO_MAX, NAME_MAX, domainOf, normalizeUrl, readProfile } from "@/lib/profile";

export async function generateMetadata(): Promise<Metadata> {
  const profile = await readProfile();
  const name = profile.name.slice(0, NAME_MAX);
  const bio = profile.bio.slice(0, BIO_MAX);
  return {
    title: name,
    description: bio,
    openGraph: { title: name, description: bio },
  };
}

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-[460px] px-6 pt-16 pb-20 sm:pt-24">
      {/* profile.json은 요청마다 새로 읽으므로 Suspense로 감싼다 */}
      <Suspense fallback={<ProfileSkeleton />}>
        <ProfileView />
      </Suspense>
    </main>
  );
}

async function ProfileView() {
  const profile = await readProfile();
  const name = profile.name.slice(0, NAME_MAX);
  const bio = profile.bio.slice(0, BIO_MAX);
  const links = profile.links.flatMap((l) => {
    const url = normalizeUrl(l.url);
    return url ? [{ ...l, domain: domainOf(url) }] : [];
  });

  return (
    <>
      <header className="mb-12 text-center">
        <div
          className="relative mx-auto mb-6 grid size-[150px] place-items-center overflow-hidden rounded-full bg-accent-soft text-[52px] font-bold text-accent shadow-lift ring-4 ring-ring"
          aria-hidden={profile.avatar ? undefined : true}
        >
          {profile.avatar ? (
            // 사용자가 넣은 임의 경로/주소를 그대로 쓰기 위해 일반 img 사용
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatar}
              alt={`${name} 프로필 사진`}
              width={150}
              height={150}
              className="size-full object-cover"
            />
          ) : (
            name.trim().charAt(0) || "?"
          )}
          {/* 위는 밝게, 아래는 살짝 어둡게 — 둥근 입체감 */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-b from-white/25 to-transparent shadow-[inset_0_-10px_18px_rgb(0_0_0/0.06)]"
          />
        </div>
        <h1 className="text-[26px] leading-tight font-bold tracking-[-0.02em] [overflow-wrap:anywhere]">{name}</h1>
        {bio && (
          <p className="mx-auto mt-2.5 text-[15px] leading-relaxed break-keep text-balance text-muted [overflow-wrap:anywhere]">
            {bio}
          </p>
        )}
      </header>

      <nav aria-label="링크 목록" className="flex flex-col gap-4">
        {links.length ? (
          links.map((link) => (
            <a
              key={link.id}
              href={`/go/${encodeURIComponent(link.id)}`}
              className="group flex items-center gap-3 rounded-3xl border border-glass-border bg-glass p-3 shadow-soft backdrop-blur-xl backdrop-saturate-150 transition duration-300 ease-out hover:bg-glass-hover hover:shadow-lift focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent motion-safe:hover:-translate-y-0.5"
            >
              {/* 이모지 칸과 오른쪽 화살표 칸을 같은 폭으로 두어 제목이 정가운데 오게 한다 */}
              <span
                aria-hidden="true"
                className="grid size-12 shrink-0 place-items-center rounded-2xl bg-surface/70 text-[22px] shadow-soft"
              >
                {link.emoji}
              </span>
              <span className="flex min-w-0 flex-1 flex-col items-center text-center">
                <span className="max-w-full truncate text-[16px] font-semibold">{link.title}</span>
                <span className="max-w-full truncate text-[13px] text-muted">{link.domain}</span>
              </span>
              <span
                aria-hidden="true"
                className="grid size-12 shrink-0 place-items-center text-muted opacity-40 transition duration-300 group-hover:opacity-80 motion-safe:group-hover:translate-x-0.5"
              >
                <svg viewBox="0 0 20 20" fill="none" className="size-4">
                  <path d="M7 4l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </a>
          ))
        ) : (
          <p className="text-center text-muted">아직 등록된 링크가 없어요.</p>
        )}
      </nav>
    </>
  );
}

function ProfileSkeleton() {
  return (
    <div aria-busy="true" aria-label="불러오는 중" className="animate-pulse">
      <div className="mb-12 flex flex-col items-center">
        <div className="mb-6 size-[150px] rounded-full bg-glass ring-4 ring-ring" />
        <div className="h-7 w-32 rounded-full bg-glass" />
        <div className="mt-3 h-4 w-52 rounded-full bg-glass" />
      </div>
      <div className="flex flex-col gap-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-[74px] rounded-3xl border border-glass-border bg-glass" />
        ))}
      </div>
    </div>
  );
}
