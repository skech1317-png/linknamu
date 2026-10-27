// 프로필·링크 데이터 (data/profile.json) 읽기/쓰기
import { readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

export type Link = {
  id: string;
  title: string;
  url: string;
  emoji?: string;
  clicks: number;
};

export type Profile = {
  name: string;
  bio: string;
  avatar: string;
  links: Link[];
};

const DATA_FILE = path.join(process.cwd(), "data", "profile.json");

export const NAME_MAX = 40;
export const BIO_MAX = 120;

export async function readProfile(): Promise<Profile> {
  return JSON.parse(await readFile(DATA_FILE, "utf8"));
}

// 클릭이 동시에 들어와도 읽기→쓰기가 겹치지 않게 순서대로 처리
let queue: Promise<unknown> = Promise.resolve();

export function addClick(id: string): Promise<string | null> {
  const task = queue.then(async () => {
    const profile = await readProfile();
    const link = profile.links.find((l) => l.id === id);
    const url = link && normalizeUrl(link.url);
    if (!link || !url) return null;

    link.clicks = (link.clicks || 0) + 1;
    // 임시 파일에 쓴 뒤 바꿔치기해서, 저장 도중 꺼져도 파일이 깨지지 않게 한다
    const tmp = DATA_FILE + ".tmp";
    await writeFile(tmp, JSON.stringify(profile, null, 2) + "\n");
    await rename(tmp, DATA_FILE);
    return url;
  });
  queue = task.catch(() => {});
  return task;
}

// 'instagram.com/abc'처럼 적어도 https://를 붙이고, http/https/mailto가 아니면 null
export function normalizeUrl(raw: string): string | null {
  let url = String(raw || "").trim();
  if (!url) return null;
  if (!/^[a-z][a-z0-9+.-]*:/i.test(url)) url = "https://" + url;
  try {
    const u = new URL(url);
    if (u.protocol === "mailto:") return u.pathname.includes("@") ? u.href : null;
    return u.protocol === "http:" || u.protocol === "https:" ? u.href : null;
  } catch {
    return null;
  }
}

// 카드 아래 작은 글씨: 웹 주소는 도메인, 메일은 주소
export function domainOf(url: string): string {
  try {
    const u = new URL(url);
    if (u.protocol === "mailto:") return decodeURIComponent(u.pathname);
    return u.hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}
