import Link from "next/link";
import type { ReactNode } from "react";

// Oleg's grocery list, in English, laid out for use in the shop: the Tuesday and Friday
// runs at the top as tick lists, everything else in native <details> folds.
// A server component with no client React; two small inline scripts, one at
// the top of <body> that stamps the weekday on <html> (the "today" badge,
// same ids as /fitness) and one at the end that keeps the ticks in
// localStorage so a reloaded tab in the shop does not lose them.
// Source: Desktop/Fitness/groceries.md (built with Oleg on 2026-11-03), which
// stays in Russian, so a change there gets translated here by hand.

type Item = {
  /**
   * Stable key for the saved tick. Never reuse one for another product. The
   * vt-/pt- prefixes date from the page's Russian weekday ids; they stay so
   * ticks already saved on the phone survive.
   */
  id: string;
  name: string;
  qty?: string;
  note?: string;
};

// JavaScript's Date#getDay() order, Sunday first, as on /fitness.
const DAY_IDS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;

const TUESDAY: Item[] = [
  { id: "vt-milk", name: "2% milk", qty: "2 L" },
  {
    id: "vt-chicken",
    name: "Boneless chicken, cut up",
    qty: "600 g",
    note: "diced chicken, chicken cubes, stir-fry strips",
  },
  { id: "vt-banana", name: "Bananas", qty: "6", note: "yellow" },
  { id: "vt-avocado", name: "Avocados", qty: "3", note: "2 soft, 1 nearly soft" },
  { id: "vt-salad", name: "Salad leaves", qty: "2 bags" },
  { id: "vt-yogurt", name: "Plain Greek yogurt", qty: "1 kg" },
];

const FRIDAY_FRESH: Item[] = [
  {
    id: "pt-milk",
    name: "2% milk",
    qty: "2 L",
    note: "enough for Monday morning's coffee too",
  },
  {
    id: "pt-chicken",
    name: "Boneless chicken, cut up",
    qty: "600 g",
    note: "diced chicken, chicken cubes, stir-fry strips",
  },
  { id: "pt-banana", name: "Bananas", qty: "6", note: "4 yellow, 2 greenish" },
  { id: "pt-avocado", name: "Avocados", qty: "3", note: "2 soft, 1 nearly soft" },
  { id: "pt-salad", name: "Salad leaves", qty: "2 bags" },
  { id: "pt-yogurt", name: "Plain Greek yogurt", qty: "1 kg" },
];

const FRIDAY_WEEK: Item[] = [
  { id: "wk-eggs", name: "Eggs", qty: "18" },
  { id: "wk-cheese", name: "Cheese", qty: "~250 g" },
  {
    id: "wk-rice",
    name: "Microwave rice pouches",
    qty: "3",
    note: "plain basmati or jasmine. Plain only: flavored rice can contain wheat",
  },
  { id: "wk-choc", name: "Lindt Excellence 78%", qty: "3 bars" },
  {
    id: "wk-nuts",
    name: "Nuts",
    qty: "~250 g",
    note: "pistachios, almonds, macadamia",
  },
  {
    id: "wk-salmon",
    name: "Smoked salmon",
    qty: "~200 g",
    note: "with eggs at breakfast",
  },
  { id: "wk-lemon", name: "Lemons", qty: "3" },
];

const HOME_CHECK: Item[] = [
  { id: "home-protein", name: "Dymatize ISO 100 protein", qty: "12 scoops a week" },
  { id: "home-creatine", name: "Creatine monohydrate", qty: "5 g a day" },
  {
    id: "home-coffee",
    name: "Coffee capsules",
    qty: "~14 a week",
    note: "2 a day, Monday morning too",
  },
  {
    id: "home-decaf",
    name: "Decaf capsules",
    qty: "12 a week",
    note: "2 a day, except Monday",
  },
  { id: "home-honey", name: "Honey" },
  { id: "home-oil", name: "Olive oil" },
  { id: "home-salt", name: "Salt" },
  {
    id: "home-pepper",
    name: "Black pepper",
    note: "plain ground or whole: seasoning blends can contain wheat",
  },
  { id: "home-water", name: "Water", qty: "~18 L a week", note: "if bottled" },
];

const OPTIONAL: Item[] = [
  {
    id: "opt-skyr",
    name: "Plain skyr",
    qty: "1 tub",
    note: "replaces some of the Greek yogurt: more protein (~11 g per 100 g), almost no fat",
  },
  {
    id: "opt-tvorog",
    name: "Cottage cheese (tvorog)",
    qty: "~400 g",
    note: "100 g in the evening, if I feel like it",
  },
  {
    id: "opt-dates",
    name: "Medjool dates",
    qty: "~250 g",
    note: "2-3 before the gym, ~65 kcal each",
  },
  {
    id: "opt-batat",
    name: "Sweet potatoes",
    qty: "2-3",
    note: "Wash, prick with a fork 6-8 times, microwave for 6-8 minutes, turning halfway. The skin is edible",
  },
  {
    id: "opt-salmon",
    name: "Salmon fillets",
    qty: "2",
    note: "for variety instead of chicken",
  },
  {
    id: "opt-cucumber",
    name: "Cucumbers",
    qty: "2-3",
    note: "for the salad. Almost all water: freshness, no calories",
  },
  {
    id: "opt-ricecakes",
    name: "Rice cakes",
    qty: "1 pack",
    note: "check for the gluten-free label",
  },
];

const HOUSEHOLD: Item[] = [
  {
    id: "hh-freezer-bags",
    name: "Zip freezer bags",
    note: "chicken in 200 g portions for the freezer",
  },
  { id: "hh-paper-towels", name: "Paper towels" },
  { id: "hh-dish-soap", name: "Dish soap" },
  { id: "hh-sponges", name: "Sponges" },
  { id: "hh-trash-bags", name: "Trash bags" },
  { id: "hh-toilet-paper", name: "Toilet paper" },
];

const OTHER_OPTIONS: { name: string; note: string }[] = [
  {
    name: "Corn tortillas",
    note: "100% corn only: corn flour, water, lime. Many are mixed with wheat flour. ~50-60 kcal for a small one, 30 seconds in a pan",
  },
  {
    name: "Kefir or laban",
    note: "a glass of 2.5% kefir is ~130 kcal and 8 g of protein, and liquid barely fills me up",
  },
  { name: "Rotisserie chicken", note: "for days without the pan" },
  { name: "Dried mango or raisins", note: "a handful in yogurt, +100 kcal" },
  { name: "Orange juice", note: "250 ml ~110 kcal, after the gym" },
  { name: "Puffed rice", note: "crunch in yogurt, check for gluten-free" },
  { name: "Unsweetened cocoa", note: "a spoonful in the shake" },
  { name: "Frozen berries", note: "in a shake or yogurt" },
];

/** One home day, as Oleg listed it on 2026-11-03. */
const DAY: { food: string; kcal: string; protein: string }[] = [
  { food: "2% milk, 600 ml (protein and coffee)", kcal: "300", protein: "20" },
  { food: "Eggs, 3", kcal: "215", protein: "19" },
  { food: "Chicken, 200 g (raw breast)", kcal: "240", protein: "45" },
  { food: "Rice, 100 g cooked", kcal: "130", protein: "3" },
  { food: "Bananas, 2", kcal: "210", protein: "3" },
  { food: "Lindt 78% chocolate, 50 g", kcal: "285", protein: "5" },
  { food: "Salad, 70% of a bag", kcal: "15", protein: "1" },
  { food: "Avocado, 1", kcal: "230", protein: "3" },
  { food: "Greek yogurt 2%, 300 g", kcal: "220", protein: "30" },
  { food: "Nuts, 40 g", kcal: "240", protein: "7" },
  { food: "ISO 100 protein, 2 scoops", kcal: "230", protein: "50" },
  { food: "Cheese, 40 g", kcal: "160", protein: "10" },
  { food: "Coffee 2 capsules and decaf 2 capsules", kcal: "~0", protein: "0" },
  { food: "Water, 3 L", kcal: "0", protein: "0" },
];

const RANKED = [
  "Dymatize ISO 100 protein (check at home)",
  "2% milk",
  "Eggs",
  "Boneless chicken, cut up",
  "Bananas",
  "Microwave rice pouches",
  "Creatine monohydrate (check at home)",
  "Plain Greek yogurt",
  "Cheese",
  "Avocados",
  "Honey",
  "Coffee capsules",
  "Decaf capsules",
  "Nuts",
  "Lindt 78%",
  "Salad leaves",
  "Smoked salmon",
  "Olive oil",
  "Salt",
  "Black pepper",
  "Lemons",
  "Water (if bottled)",
];

const TOC: { href: string; label: string }[] = [
  { href: "#tue", label: "Tuesday" },
  { href: "#fri", label: "Friday" },
  { href: "#optional", label: "Optional" },
  { href: "#household", label: "Household" },
  { href: "#day", label: "Calories" },
  { href: "#storage", label: "Storage" },
];

const h3Class =
  "font-display text-xl font-semibold leading-[1.15] tracking-tight text-silver";

// Restores the saved ticks, saves each change, and wires the reset buttons.
// Plain DOM: the page ships no client React of its own.
const TICKS_SCRIPT = `(function(){var K="grocery-ticks";var s={};try{s=JSON.parse(localStorage.getItem(K)||"{}")}catch(e){}function save(){try{localStorage.setItem(K,JSON.stringify(s))}catch(e){}}document.querySelectorAll("input[data-k]").forEach(function(i){if(s[i.dataset.k])i.checked=true;i.addEventListener("change",function(){if(i.checked)s[i.dataset.k]=1;else delete s[i.dataset.k];save()})});document.querySelectorAll("button[data-reset]").forEach(function(b){b.addEventListener("click",function(){var r=b.closest("[data-list]");if(!r)return;r.querySelectorAll("input[data-k]").forEach(function(i){i.checked=false;delete s[i.dataset.k]});save()})})})()`;

function Chevron() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className="gr-chev size-5 shrink-0 text-silver-muted"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

/** A tick list: each row is one label, so the whole row is the tap target. */
function Checklist({ items }: { items: Item[] }) {
  return (
    <ul className="divide-y divide-hairline">
      {items.map((it) => (
        <li key={it.id}>
          <label className="gr-item flex min-h-12 cursor-pointer items-start gap-3 py-3">
            <input type="checkbox" data-k={it.id} className="gr-box mt-0.5 shrink-0" />
            <span className="gr-text min-w-0 flex-1">
              <span className="flex items-baseline justify-between gap-3">
                <span className="min-w-0 font-body text-base text-silver">{it.name}</span>
                {it.qty ? (
                  <span className="shrink-0 whitespace-nowrap font-body text-sm font-semibold text-white">
                    {it.qty}
                  </span>
                ) : null}
              </span>
              {it.note ? (
                <span className="mt-0.5 block font-body text-sm leading-relaxed text-silver-muted">
                  {it.note}
                </span>
              ) : null}
            </span>
          </label>
        </li>
      ))}
    </ul>
  );
}

function ResetButton() {
  return (
    <button
      type="button"
      data-reset
      className="gr-reset mt-4 min-h-11 items-center rounded-full border border-hairline px-4 py-2.5 font-body text-sm font-semibold text-silver-muted transition-colors hover:border-vivid-blue/50 hover:text-white"
    >
      Clear ticks
    </button>
  );
}

function SubHead({ children }: { children: ReactNode }) {
  return (
    <h3 className="eyebrow mt-7 font-body text-[13px] text-vivid-blue">{children}</h3>
  );
}

/** A shopping run at the top of the page, always open. */
function RunCard({
  dayId,
  day,
  title,
  children,
}: {
  dayId: "tue" | "fri";
  day: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section
      id={dayId}
      data-day={dayId}
      data-list
      className="surface-card scroll-mt-24 p-6 md:p-8"
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <p className="eyebrow font-body text-[13px] text-vivid-blue">{day}</p>
        <span className="gr-today eyebrow items-center rounded-full bg-vivid-blue px-2.5 py-0.5 font-body text-[11px] text-white">
          today
        </span>
      </div>
      <h2 className="mt-2 font-display text-2xl font-semibold leading-[1.15] tracking-tight text-silver md:text-3xl">
        {title}
      </h2>
      {children}
      <ResetButton />
    </section>
  );
}

/** A fold: a native <details> on a surface card, shut by default. */
function Fold({
  id,
  eyebrow,
  title,
  meta,
  list,
  children,
}: {
  id?: string;
  eyebrow?: string;
  title: string;
  meta?: string;
  /** The fold holds a tick list, so its reset button clears only this fold. */
  list?: boolean;
  children: ReactNode;
}) {
  return (
    <details
      id={id}
      data-list={list ? "" : undefined}
      className="gr-fold surface-card scroll-mt-24"
    >
      <summary className="flex min-h-14 items-center justify-between gap-4 px-5 py-4 md:px-6">
        <span className="min-w-0">
          {eyebrow ? (
            <span className="eyebrow block font-body text-[13px] text-vivid-blue">
              {eyebrow}
            </span>
          ) : null}
          <h2 className={`${eyebrow ? "mt-1 " : ""}${h3Class}`}>{title}</h2>
        </span>
        <span className="flex shrink-0 items-center gap-3">
          {meta ? (
            <span className="whitespace-nowrap font-body text-sm text-silver-muted">
              {meta}
            </span>
          ) : null}
          <Chevron />
        </span>
      </summary>
      <div className="border-t border-hairline px-5 pt-3 pb-6 md:px-6">
        {children}
      </div>
    </details>
  );
}

export default function GroceryPage() {
  return (
    <>
      {/* Stamps the device's weekday on <html> before the rest of the body is
          parsed, so the "today" badge is right in the first painted frame. */}
      <script
        dangerouslySetInnerHTML={{
          __html: `document.documentElement.setAttribute("data-today",${JSON.stringify(DAY_IDS)}[new Date().getDay()])`,
        }}
      />

      <header className="px-2">
        <div className="mx-auto mt-2 flex max-w-3xl items-center justify-between px-6 py-4">
          <Link href="/" className="brand-wordmark font-display text-lg tracking-tight">
            Oleg Melnikov
          </Link>
          <span className="font-body text-sm text-silver-muted">personal page</span>
        </div>
      </header>

      <main>
        <section className="pt-8 pb-8 md:pt-14 md:pb-10">
          <div className="mx-auto max-w-3xl px-6">
            <span className="eyebrow inline-block align-top rounded-full border border-hairline bg-vivid-blue/10 px-4 py-1.5 font-body text-xs text-vivid-blue/90">
              Tue and Fri · 6 home days
            </span>
            <h1 className="text-metallic mt-6 font-display text-3xl font-semibold leading-[1.1] tracking-tight md:text-4xl">
              Groceries
            </h1>
            <p className="mt-4 font-body text-base leading-relaxed text-silver-muted">
              Shopping twice a week. On Monday I eat out, and at home it's just
              the morning coffee with milk. Everything is gluten-free.
            </p>
          </div>
        </section>

        <div className="mx-auto flex max-w-3xl flex-col gap-4 px-6 pb-10">
          <RunCard dayId="tue" day="Tuesday" title="For 3 days: Tue, Wed, Thu">
            <div className="mt-4">
              <Checklist items={TUESDAY} />
            </div>
          </RunCard>

          <RunCard dayId="fri" day="Friday" title="For 3 days: Fri, Sat, Sun, plus the week">
            <SubHead>Fresh, for 3 days</SubHead>
            <div className="mt-2">
              <Checklist items={FRIDAY_FRESH} />
            </div>
            <SubHead>Long-life, for the week</SubHead>
            <div className="mt-2">
              <Checklist items={FRIDAY_WEEK} />
            </div>
            <SubHead>Check at home, top up if running low</SubHead>
            <div className="mt-2">
              <Checklist items={HOME_CHECK} />
            </div>
          </RunCard>
        </div>

        <nav
          aria-label="Sections"
          className="mx-auto flex max-w-3xl flex-wrap gap-2 px-6 pb-10"
        >
          {TOC.map((t) => (
            <a
              key={t.href}
              href={t.href}
              className="inline-flex min-h-11 items-center rounded-full border border-hairline px-4 py-2.5 font-body text-sm font-semibold text-silver transition-colors hover:border-vivid-blue/50 hover:text-white"
            >
              {t.label}
            </a>
          ))}
        </nav>

        <div className="offscreen-lazy mx-auto flex max-w-3xl flex-col gap-4 px-6 pb-16 md:pb-20">
          <Fold id="optional" eyebrow="Any day" title="Optional" list>
            <Checklist items={OPTIONAL} />
            <ResetButton />
          </Fold>

          <Fold
            id="household"
            eyebrow="The basics, check at home"
            title="Household"
            list
          >
            <Checklist items={HOUSEHOLD} />
            <ResetButton />
          </Fold>

          <Fold id="day" eyebrow="A typical day" title="What I eat, and the calories" meta="~2475 kcal">
            <div className="mt-2 grid grid-cols-[1fr_auto_auto] font-body text-sm">
              <span className="py-2 text-silver-muted">Food</span>
              <span className="py-2 pl-4 text-right text-silver-muted">kcal</span>
              <span className="py-2 pl-4 text-right text-silver-muted">protein, g</span>
              {DAY.map((r) => (
                <div key={r.food} className="contents">
                  <span className="border-t border-hairline py-2.5 text-silver">{r.food}</span>
                  <span className="border-t border-hairline py-2.5 pl-4 text-right whitespace-nowrap text-silver">
                    {r.kcal}
                  </span>
                  <span className="border-t border-hairline py-2.5 pl-4 text-right whitespace-nowrap text-silver">
                    {r.protein}
                  </span>
                </div>
              ))}
              <span className="border-t border-hairline py-2.5 font-semibold text-white">Total</span>
              <span className="border-t border-hairline py-2.5 pl-4 text-right font-semibold whitespace-nowrap text-white">
                ~2475
              </span>
              <span className="border-t border-hairline py-2.5 pl-4 text-right font-semibold whitespace-nowrap text-white">
                ~195
              </span>
            </div>
            <div className="prose-guide mt-6">
              <ul>
                <li>
                  Not counted: oil for the chicken and salad (1 tbsp ~120 kcal)
                  and honey (1 tbsp ~65 kcal). With them, ~2650 kcal.
                </li>
                <li>
                  About 43% of calories come from fat (chocolate, avocado, nuts,
                  cheese, eggs), 31% from protein, 26% from carbs. By the program,
                  carbs (rice, bananas, honey) should be what grows, not fats.
                </li>
                <li>Protein is ~195 g, above the program's target (130-150 g), so no need to add more.</li>
                <li>
                  Assumptions: rice is cooked, not dry (100 g dry ~350 kcal);
                  chicken is breast (thigh ~320 kcal and 38 g of protein); yogurt
                  is 2%.
                </li>
                <li>
                  The week counts 6 home days: on Monday I eat out.
                </li>
              </ul>
            </div>
          </Fold>

          <Fold id="storage" eyebrow="So nothing goes off" title="How to store it">
            <div className="prose-guide mt-2">
              <ul>
                <li>
                  Chicken: whatever I won't eat by the date on the pack goes
                  straight in the freezer, in 200 g portions. Defrost in the
                  fridge overnight. 10 minutes in the pan.
                </li>
                <li>
                  Rice: finish an open pouch the next day, and don't keep cooked
                  rice longer than a day. So half a pouch (125 g) a day, one pouch
                  per 2 days: Tue-Wed, Thu-Fri, Sat-Sun. Tear a corner, 2 minutes
                  in the microwave.
                </li>
                <li>
                  Bananas and avocados: the ripe ones for the first days, the
                  greenish and nearly soft ones will ripen by the end.
                </li>
                <li>
                  Yogurt and milk: Tuesday leaves about 100 g of yogurt and 200 ml
                  of milk, which carry over to Friday.
                </li>
              </ul>
            </div>
          </Fold>

          <Fold id="ranked" eyebrow="If short on time" title="In order of importance">
            <ol className="mt-2 list-decimal space-y-1.5 pl-6 font-body text-base text-silver marker:text-silver-muted">
              {RANKED.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ol>
          </Fold>

          <Fold id="ideas" eyebrow="Not chosen yet" title="Other options">
            <ul className="divide-y divide-hairline">
              {OTHER_OPTIONS.map((o) => (
                <li key={o.name} className="py-3">
                  <p className="font-body text-base text-silver">{o.name}</p>
                  <p className="mt-0.5 font-body text-sm leading-relaxed text-silver-muted">
                    {o.note}
                  </p>
                </li>
              ))}
            </ul>
          </Fold>

          <Fold id="no-gluten" eyebrow="Not buying" title="Gluten">
            <div className="prose-guide mt-2">
              <p>
                Bread, wheat and rye crispbread, oatmeal, pasta, pastries: gluten
                gives me brain fog. Rice, rice cakes, bananas and honey replace
                them. Rice itself has no gluten, not even "glutinous rice"; it
                only turns up in additives, so I buy plain rice.
              </p>
            </div>
          </Fold>
        </div>
      </main>

      <footer className="mx-auto max-w-3xl px-6 pb-12 font-body text-sm text-silver-muted">
        Put together Nov 3, 2026. Ticks are remembered on this phone.
      </footer>

      <script dangerouslySetInnerHTML={{ __html: TICKS_SCRIPT }} />
    </>
  );
}
