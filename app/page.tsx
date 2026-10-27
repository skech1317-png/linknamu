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
    <main className="mx-auto w-full max-w-[560px] px-4 pt-10 pb-12 sm:pt-14">
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
      <header className="mb-8 text-center">
        <div
          className="mx-auto mb-4 grid size-28 place-items-center overflow-hidden rounded-full border border-line bg-accent-soft text-[40px] font-bold text-accent sm:size-32 sm:text-[46px]"
          aria-hidden={profile.avatar ? undefined : true}
        >
          {profile.avatar ? (
            // 사용자가 넣은 임의 경로/주소를 그대로 쓰기 위해 일반 img 사용
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.avatar} alt={`${name} 프로필 사진`} className="size-full object-cover" />
          ) : (
            name.trim().charAt(0) || "?"
          )}
        </div>
        <h1 className="text-[22px] font-bold tracking-tight [overflow-wrap:anywhere]">{name}</h1>
        {bio && <p className="mt-1.5 text-[15px] text-muted [overflow-wrap:anywhere]">{bio}</p>}
      </header>

      <nav aria-label="링크 목록" className="flex flex-col gap-3.5">
        {links.length ? (
          links.map((link) => (
            <a
              key={link.id}
              href={`/go/${encodeURIComponent(link.id)}`}
              className="flex flex-col items-center rounded-2xl border border-line bg-surface px-5 py-4 text-center transition hover:-translate-y-0.5 hover:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <span className="max-w-full truncate font-semibold">{link.title}</span>
              <span className="max-w-full truncate text-[13px] text-muted">{link.domain}</span>
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
      <div className="mb-8 flex flex-col items-center">
        <div className="mb-4 size-28 rounded-full bg-line sm:size-32" />
        <div className="h-6 w-32 rounded bg-line" />
        <div className="mt-2.5 h-4 w-48 rounded bg-line" />
      </div>
      <div className="flex flex-col gap-3.5">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-[74px] rounded-2xl border border-line bg-surface" />
        ))}
      </div>
    </div>
  );
}
