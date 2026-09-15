import { ImageResponse } from "next/og";

export const size = {
  width: 512,
  height: 512,
};
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#059669",
          borderRadius: "128px",
        }}
      >
        <svg
          viewBox="0 0 100 100"
          width="280"
          height="280"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            x="18"
            y="10"
            width="64"
            height="80"
            rx="8"
            fill="white"
            fillOpacity="0.95"
          />
          <line x1="30" y1="30" x2="70" y2="30" stroke="#059669" strokeWidth="3" strokeLinecap="round" />
          <line x1="30" y1="44" x2="62" y2="44" stroke="#059669" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
          <line x1="30" y1="58" x2="66" y2="58" stroke="#059669" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
          <line x1="30" y1="72" x2="54" y2="72" stroke="#059669" strokeWidth="3" strokeLinecap="round" opacity="0.3" />
          <circle cx="72" cy="72" r="20" fill="#10b981" />
          <rect
            x="50"
            y="58"
            width="22"
            height="4"
            rx="2"
            transform="rotate(-20 61 60)"
            fill="white"
          />
          <rect
            x="60"
            y="62"
            width="22"
            height="4"
            rx="2"
            transform="rotate(-20 71 64)"
            fill="white"
          />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}
