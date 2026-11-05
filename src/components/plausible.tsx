"use client";

import { useEffect } from "react";
import { firstTouch, withoutUtm } from "@/lib/attribution";

export function Plausible() {
  useEffect(() => {
    firstTouch(); // Remember the source on every landing, even a page with no link to Boldane.
    import("@plausible-analytics/tracker").then(({ init }) => {
      init({
        domain: "oleg.ae",
        outboundLinks: true,
        transformRequest(event) {
          // One row per destination in Plausible, not one per visitor's tags.
          if (event.p?.url) event.p = { ...event.p, url: withoutUtm(event.p.url) };
          return event;
        },
      });
    });
  }, []);
  return null;
}
