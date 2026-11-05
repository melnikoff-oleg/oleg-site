"use client";

import { useEffect } from "react";
import { firstTouch, withoutUtm } from "@/lib/attribution";

export function Plausible() {
  useEffect(() => {
    firstTouch(); // Before the tags leave the address bar below.
    import("@plausible-analytics/tracker").then(({ init }) => {
      init({
        domain: "oleg.ae",
        outboundLinks: true,
        transformRequest(event) {
          if (event.n === "pageview") {
            // The pageview carrying the tags is on its way, and Plausible keeps them for the whole
            // visit. So clean the address bar: a copied or shared link must not credit the video
            // with whoever opens it next. Replacing history is not a new pageview.
            queueMicrotask(() => {
              const clean = withoutUtm(location.href);
              if (clean !== location.href) history.replaceState(history.state, "", clean);
            });
          } else if (event.p?.url) {
            // One row per destination in Plausible, not one per visitor's tags.
            event.p = { ...event.p, url: withoutUtm(event.p.url) };
          }
          return event;
        },
      });
    });
  }, []);
  return null;
}
