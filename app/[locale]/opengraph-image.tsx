import { ImageResponse } from "next/og";

export const alt = "CHRONO — Fine Timepieces";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Sadə brend kartı: tünd fon + qızılı CHRONO yazısı (xarici şrift/şəkil yoxdur)
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#171717",
          color: "#D5B47B",
        }}
      >
        <div style={{ fontSize: 150, letterSpacing: 24, fontWeight: 700 }}>CHRONO</div>
        <div style={{ marginTop: 24, fontSize: 32, letterSpacing: 10, color: "#B08D57" }}>
          FINE TIMEPIECES
        </div>
      </div>
    ),
    size
  );
}
