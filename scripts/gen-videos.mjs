/**
 * Builds a short original mp4 for every lesson.
 * Draws a pale stage, the lesson code, and the title. Does not fetch or embed reference media.
 */
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { mkdirSync, writeFileSync, existsSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { readFileSync } from "node:fs";

const require = createRequire(import.meta.url);
const ffmpeg = require(join(process.env.TEMP || tmpdir(), "ffbin/node_modules/ffmpeg-static"));
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const catalog = JSON.parse(readFileSync(join(root, "data/catalog.json"), "utf8"));
const font = "C:/Windows/Fonts/arialbd.ttf";
const scratch = join(tmpdir(), "smxvid-jobs");
mkdirSync(scratch, { recursive: true });

function escPath(path) {
  return path.replace(/\\/g, "/").replace(/:/g, "\\:");
}

function phase(slug) {
  let n = 0;
  for (const ch of slug) n = (n + ch.charCodeAt(0) * 17) % 360;
  return (n / 360) * Math.PI * 2;
}

function jobs() {
  const list = [];
  for (const course of catalog.courses) {
    for (const mod of course.modules) {
      for (const lesson of mod.lessons) {
        list.push({ course: course.id, slug: lesson.slug, code: lesson.code, title: lesson.title });
      }
    }
  }
  return list;
}

function encode(job) {
  const dir = join(root, "public/media", job.course);
  mkdirSync(dir, { recursive: true });
  const out = join(dir, `${job.slug}.mp4`);
  const textPath = join(scratch, `${job.course}--${job.slug}.txt`);
  const title = job.title.replace(/[%\\]/g, " ").slice(0, 72);
  writeFileSync(textPath, title, "utf8");
  const p = phase(job.slug).toFixed(3);
  const vf = [
    `drawbox=x='48+170*sin(t+${p})':y=214:w=132:h=32:color=0x3FE9A0:t=fill`,
    `drawbox=x='360+80*sin(t*1.3+${p})':y=168:w=28:h=78:color=0xC6F25A:t=fill`,
    `drawbox=x=36:y=36:w=180:h=28:color=0x2F2C45:t=fill`,
    `drawtext=fontfile='${escPath(font)}':text='${job.code.replace(/'/g, "")}':fontsize=16:fontcolor=0xC6F25A:x=48:y=42`,
    `drawtext=fontfile='${escPath(font)}':textfile='${escPath(textPath)}':fontsize=26:fontcolor=0x2F2C45:x=36:y=92`,
  ].join(",");
  return new Promise((resolve, reject) => {
    const child = spawn(ffmpeg, [
      "-y",
      "-f", "lavfi",
      "-i", "color=c=0xe7eefb:s=854x480:r=8:d=8",
      "-vf", vf,
      "-c:v", "libx264",
      "-preset", "ultrafast",
      "-crf", "34",
      "-pix_fmt", "yuv420p",
      "-movflags", "+faststart",
      "-an",
      out,
    ], { stdio: ["ignore", "ignore", "pipe"] });
    let err = "";
    child.stderr.on("data", (chunk) => { err += chunk.toString(); });
    child.on("exit", (code) => {
      if (code === 0 && existsSync(out)) resolve(out);
      else reject(new Error(`${job.course}/${job.slug} failed\n${err.slice(-400)}`));
    });
  });
}

const list = jobs();
const limit = Number(process.env.LIMIT || list.length);
const queue = list.slice(0, limit);
let cursor = 0;
let done = 0;
const failures = [];
const workers = Number(process.env.WORKERS || 6);

async function worker() {
  while (cursor < queue.length) {
    const job = queue[cursor];
    cursor += 1;
    try {
      await encode(job);
    } catch (error) {
      failures.push(error.message);
    }
    done += 1;
    if (done % 25 === 0 || done === queue.length) console.log(`${done}/${queue.length}`);
  }
}

await Promise.all(Array.from({ length: workers }, () => worker()));
rmSync(scratch, { recursive: true, force: true });
if (failures.length) {
  console.error(failures.slice(0, 8).join("\n"));
  process.exit(1);
}
console.log(`wrote ${queue.length} videos`);
