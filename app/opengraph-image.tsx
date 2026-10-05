import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt = "IRONFIT, palestra a Ribera: sala pesi con macchinari Panatta";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const asset = (p: string) => readFile(join(process.cwd(), "assets", p));

export default async function Image() {
  const [photo, barlow, inter] = await Promise.all([
    asset("og-source.jpg"),
    asset("fonts/BarlowCondensed-ExtraBold.ttf"),
    asset("fonts/Inter-SemiBold.otf"),
  ]);
  const photoSrc = `data:image/jpeg;base64,${photo.toString("base64")}`;

  return new ImageResponse(
    (
      <div style={{ position: "relative", display: "flex", width: "100%", height: "100%", background: "#0A0A0A" }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- rendered by Satori, not the browser */}
        <img src={photoSrc} width={1200} height={630} alt="" style={{ position: "absolute", inset: 0, objectFit: "cover" }} />
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            background:
              "linear-gradient(to top right, rgba(10,10,10,0.95) 0%, rgba(10,10,10,0.78) 45%, rgba(10,10,10,0.35) 100%)",
          }}
        />
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            height: "100%",
            padding: "64px 72px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <svg width="72" height="72" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="49" fill="#0A0A0A" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
              <path d="M67.06 69.62A26 26 0 0 1 27.71 36.61" fill="none" stroke="#fff" strokeWidth="13" />
              <path d="M32.94 30.38A26 26 0 0 1 72.29 63.39" fill="none" stroke="#fff" strokeWidth="13" />
            </svg>
            <div style={{ fontFamily: "Barlow", fontSize: 52, letterSpacing: 4, color: "#fff" }}>IRONFIT</div>
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ width: 120, height: 8, background: "#D7192A", marginBottom: 28 }} />
            <div
              style={{
                fontFamily: "Barlow",
                fontSize: 128,
                lineHeight: 0.9,
                textTransform: "uppercase",
                color: "#fff",
              }}
            >
              Palestra a Ribera
            </div>
            <div style={{ fontFamily: "Inter", fontSize: 30, color: "rgba(255,255,255,0.82)", marginTop: 22 }}>
              Sala pesi Panatta · Functional · Personal trainer
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Barlow", data: barlow, weight: 800, style: "normal" },
        { name: "Inter", data: inter, weight: 600, style: "normal" },
      ],
    },
  );
}
