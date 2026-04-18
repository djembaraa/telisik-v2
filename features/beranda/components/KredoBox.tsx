import React from "react";

export interface KredoBoxProps {
  heading?: string;
  lead?: string;
  body?: React.ReactNode;
}

export default function KredoBox({ heading, lead, body }: KredoBoxProps) {
  if (!heading && !lead) return null;

  return (
    <section className="mt-0 mb-2 rounded-2xl bg-transparent px-0 py-2 md:mt-1 md:mb-2">
      {heading ? (
        <h1
          className="mb-2 w-full max-w-none font-extrabold text-[#555333]"
          style={{
            fontSize: "clamp(1.9rem, 3.2vw, 3rem)",
            lineHeight: 1.04,
            letterSpacing: "-0.02em",
          }}
        >
          {heading}
        </h1>
      ) : null}

      {lead ? (
        <p className="mb-2 max-w-6xl text-[1.125rem] font-semibold leading-[1.3334] text-[#f26532] md:text-[1.375rem] md:leading-[1.2728]">
          {lead}
        </p>
      ) : null}

      {body ? (
        <div className="max-w-6xl space-y-2 text-neutral-700">{body}</div>
      ) : null}
    </section>
  );
}
