import Link from "next/link";
import type { ReactNode } from "react";

// Oleg's grocery list, laid out for use in the shop: the Tuesday and Friday
// runs at the top as tick lists, everything else in native <details> folds.
// A server component with no client React; two small inline scripts, one at
// the top of <body> that stamps the weekday on <html> (the "Сегодня" badge,
// same ids as /fitness) and one at the end that keeps the ticks in
// localStorage so a reloaded tab in the shop does not lose them.
// Source: Desktop/Fitness/groceries.md (built with Oleg on 2026-11-03).

type Item = {
  /** Stable key for the saved tick. Never reuse one for another product. */
  id: string;
  name: string;
  qty?: string;
  note?: string;
};

// JavaScript's Date#getDay() order, Sunday first, as on /fitness.
const DAY_IDS = ["vs", "pn", "vt", "sr", "cht", "pt", "sb"] as const;

const TUESDAY: Item[] = [
  { id: "vt-milk", name: "Молоко 2%", qty: "2 л" },
  {
    id: "vt-chicken",
    name: "Курица без кости, нарезанная",
    qty: "600 г",
    note: "diced chicken, chicken cubes, stir-fry strips",
  },
  { id: "vt-banana", name: "Бананы", qty: "6", note: "жёлтые" },
  { id: "vt-avocado", name: "Авокадо", qty: "3", note: "2 мягких, 1 почти мягкое" },
  { id: "vt-salad", name: "Салатные листья", qty: "2 пакета" },
  {
    id: "vt-yogurt",
    name: "Греческий йогурт без добавок",
    qty: "1 кг",
    note: "plain Greek yogurt",
  },
];

const FRIDAY_FRESH: Item[] = [
  {
    id: "pt-milk",
    name: "Молоко 2%",
    qty: "2 л",
    note: "хватит и на кофе в понедельник утром",
  },
  {
    id: "pt-chicken",
    name: "Курица без кости, нарезанная",
    qty: "600 г",
    note: "diced chicken, chicken cubes, stir-fry strips",
  },
  { id: "pt-banana", name: "Бананы", qty: "6", note: "4 жёлтых, 2 зеленоватых" },
  { id: "pt-avocado", name: "Авокадо", qty: "3", note: "2 мягких, 1 почти мягкое" },
  { id: "pt-salad", name: "Салатные листья", qty: "2 пакета" },
  {
    id: "pt-yogurt",
    name: "Греческий йогурт без добавок",
    qty: "1 кг",
    note: "plain Greek yogurt",
  },
];

const FRIDAY_WEEK: Item[] = [
  { id: "wk-eggs", name: "Яйца", qty: "18" },
  { id: "wk-cheese", name: "Сыр", qty: "~250 г" },
  {
    id: "wk-rice",
    name: "Рис в пакетах для микроволновки",
    qty: "3",
    note: "microwave rice, plain basmati или jasmine. Только простой: в рисе со вкусом бывает пшеница",
  },
  { id: "wk-choc", name: "Lindt Excellence 78%", qty: "3 плитки" },
  {
    id: "wk-nuts",
    name: "Орехи",
    qty: "~250 г",
    note: "фисташки, миндаль, макадамия",
  },
  {
    id: "wk-salmon",
    name: "Копчёный лосось",
    qty: "~200 г",
    note: "smoked salmon, к яйцам на завтрак",
  },
  { id: "wk-lemon", name: "Лимоны", qty: "3" },
];

const HOME_CHECK: Item[] = [
  { id: "home-protein", name: "Протеин Dymatize ISO 100", qty: "12 скупов в неделю" },
  { id: "home-creatine", name: "Креатин моногидрат", qty: "5 г в день" },
  {
    id: "home-coffee",
    name: "Кофе в капсулах",
    qty: "~14 в неделю",
    note: "2 в день, в понедельник утром тоже",
  },
  {
    id: "home-decaf",
    name: "Декаф в капсулах",
    qty: "12 в неделю",
    note: "2 в день, кроме понедельника",
  },
  { id: "home-honey", name: "Мёд" },
  { id: "home-oil", name: "Оливковое масло" },
  { id: "home-salt", name: "Соль" },
  {
    id: "home-pepper",
    name: "Чёрный перец",
    note: "простой молотый или горошком: в смесях приправ бывает пшеница",
  },
  { id: "home-water", name: "Вода", qty: "~18 л в неделю", note: "если бутилированная" },
];

const OPTIONAL: Item[] = [
  {
    id: "opt-skyr",
    name: "Skyr без добавок",
    qty: "1 банка",
    note: "вместо части греческого йогурта: белка больше (~11 г на 100 г), жира почти нет",
  },
  {
    id: "opt-tvorog",
    name: "Творог",
    qty: "~400 г",
    note: "cottage cheese, 100 г вечером, если хочется",
  },
  {
    id: "opt-dates",
    name: "Финики Medjool",
    qty: "~250 г",
    note: "2-3 перед залом, ~65 ккал штука",
  },
  {
    id: "opt-batat",
    name: "Батат",
    qty: "2-3",
    note: "sweet potato. Помыть, проколоть вилкой 6-8 раз, 6-8 минут в микроволновке, перевернуть на середине. Кожуру можно есть",
  },
  {
    id: "opt-salmon",
    name: "Филе лосося",
    qty: "2",
    note: "salmon fillets, для разнообразия вместо курицы",
  },
  {
    id: "opt-cucumber",
    name: "Огурцы",
    qty: "2-3",
    note: "к салату. Почти одна вода: свежесть есть, калорий нет",
  },
  {
    id: "opt-ricecakes",
    name: "Рисовые хлебцы",
    qty: "1 пачка",
    note: "rice cakes, проверить пометку gluten-free",
  },
];

const HOUSEHOLD: Item[] = [
  {
    id: "hh-freezer-bags",
    name: "Пакеты zip для заморозки",
    note: "курица порциями по 200 г в морозилку",
  },
  { id: "hh-paper-towels", name: "Бумажные полотенца" },
  { id: "hh-dish-soap", name: "Средство для мытья посуды" },
  { id: "hh-sponges", name: "Губки" },
  { id: "hh-trash-bags", name: "Мешки для мусора" },
  { id: "hh-toilet-paper", name: "Туалетная бумага" },
];

const OTHER_OPTIONS: { name: string; note: string }[] = [
  {
    name: "Кукурузные лепёшки (corn tortillas)",
    note: "только из 100% кукурузы: кукурузная мука, вода, известь. Многие смешаны с пшеничной мукой. ~50-60 ккал маленькая, 30 секунд на сковороде",
  },
  {
    name: "Кефир или лабан (laban)",
    note: "стакан кефира 2.5% ~130 ккал и 8 г белка, жидкость почти не насыщает",
  },
  { name: "Готовая курица-гриль (rotisserie chicken)", note: "на дни без сковороды" },
  { name: "Сушёное манго или изюм", note: "горсть в йогурт, +100 ккал" },
  { name: "Апельсиновый сок", note: "250 мл ~110 ккал, после зала" },
  { name: "Воздушный рис (puffed rice)", note: "хруст в йогурт, проверить gluten-free" },
  { name: "Какао без сахара", note: "ложка в шейк" },
  { name: "Замороженные ягоды", note: "в шейк или йогурт" },
];

/** One home day, as Oleg listed it on 2026-11-03. */
const DAY: { food: string; kcal: string; protein: string }[] = [
  { food: "Молоко 2%, 600 мл (протеин и кофе)", kcal: "300", protein: "20" },
  { food: "Яйца, 3", kcal: "215", protein: "19" },
  { food: "Курица, 200 г (сырая грудка)", kcal: "240", protein: "45" },
  { food: "Рис, 100 г готового", kcal: "130", protein: "3" },
  { food: "Бананы, 2", kcal: "210", protein: "3" },
  { food: "Шоколад Lindt 78%, 50 г", kcal: "285", protein: "5" },
  { food: "Салат, 70% пакета", kcal: "15", protein: "1" },
  { food: "Авокадо, 1", kcal: "230", protein: "3" },
  { food: "Греческий йогурт 2%, 300 г", kcal: "220", protein: "30" },
  { food: "Орехи, 40 г", kcal: "240", protein: "7" },
  { food: "Протеин ISO 100, 2 скупа", kcal: "230", protein: "50" },
  { food: "Сыр, 40 г", kcal: "160", protein: "10" },
  { food: "Кофе 2 капсулы и декаф 2 капсулы", kcal: "~0", protein: "0" },
  { food: "Вода, 3 л", kcal: "0", protein: "0" },
];

const RANKED = [
  "Протеин Dymatize ISO 100 (проверить дома)",
  "Молоко 2%",
  "Яйца",
  "Курица без кости, нарезанная",
  "Бананы",
  "Рис в пакетах для микроволновки",
  "Креатин моногидрат (проверить дома)",
  "Греческий йогурт без добавок",
  "Сыр",
  "Авокадо",
  "Мёд",
  "Кофе в капсулах",
  "Декаф в капсулах",
  "Орехи",
  "Lindt 78%",
  "Салатные листья",
  "Копчёный лосось",
  "Оливковое масло",
  "Соль",
  "Чёрный перец",
  "Лимоны",
  "Вода (если бутилированная)",
];

const TOC: { href: string; label: string }[] = [
  { href: "#vt", label: "Вторник" },
  { href: "#pt", label: "Пятница" },
  { href: "#optional", label: "По желанию" },
  { href: "#household", label: "Хозяйственное" },
  { href: "#day", label: "Калории" },
  { href: "#storage", label: "Хранение" },
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
      Снять галочки
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
  dayId: "vt" | "pt";
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
          сегодня
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
          parsed, so the "Сегодня" badge is right in the first painted frame. */}
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
          <span className="font-body text-sm text-silver-muted">личная страница</span>
        </div>
      </header>

      <main>
        <section className="pt-8 pb-8 md:pt-14 md:pb-10">
          <div className="mx-auto max-w-3xl px-6">
            <span className="eyebrow inline-block align-top rounded-full border border-hairline bg-vivid-blue/10 px-4 py-1.5 font-body text-xs text-vivid-blue/90">
              вт и пт · 6 домашних дней
            </span>
            <h1 className="text-metallic mt-6 font-display text-3xl font-semibold leading-[1.1] tracking-tight md:text-4xl">
              Продукты
            </h1>
            <p className="mt-4 font-body text-base leading-relaxed text-silver-muted">
              Закупка два раза в неделю. В понедельник ем вне дома, дома только
              утренний кофе с молоком. Всё без глютена. Английские названия, как
              на полке в магазине.
            </p>
          </div>
        </section>

        <div className="mx-auto flex max-w-3xl flex-col gap-4 px-6 pb-10">
          <RunCard dayId="vt" day="Вторник" title="На 3 дня: вт, ср, чт">
            <div className="mt-4">
              <Checklist items={TUESDAY} />
            </div>
          </RunCard>

          <RunCard dayId="pt" day="Пятница" title="На 3 дня: пт, сб, вс, и на неделю">
            <SubHead>Свежее, на 3 дня</SubHead>
            <div className="mt-2">
              <Checklist items={FRIDAY_FRESH} />
            </div>
            <SubHead>Долгого хранения, на неделю</SubHead>
            <div className="mt-2">
              <Checklist items={FRIDAY_WEEK} />
            </div>
            <SubHead>Проверить дома, докупить если кончается</SubHead>
            <div className="mt-2">
              <Checklist items={HOME_CHECK} />
            </div>
          </RunCard>
        </div>

        <nav
          aria-label="Разделы"
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
          <Fold id="optional" eyebrow="В любой из дней" title="По желанию" list>
            <Checklist items={OPTIONAL} />
            <ResetButton />
          </Fold>

          <Fold
            id="household"
            eyebrow="Базовый набор, проверить дома"
            title="Хозяйственное"
            list
          >
            <Checklist items={HOUSEHOLD} />
            <ResetButton />
          </Fold>

          <Fold id="day" eyebrow="Обычный день" title="Сколько я ем и калории" meta="~2475 ккал">
            <div className="mt-2 grid grid-cols-[1fr_auto_auto] font-body text-sm">
              <span className="py-2 text-silver-muted">Продукт</span>
              <span className="py-2 pl-4 text-right text-silver-muted">ккал</span>
              <span className="py-2 pl-4 text-right text-silver-muted">белок, г</span>
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
              <span className="border-t border-hairline py-2.5 font-semibold text-white">Итого</span>
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
                  Не посчитано: масло для курицы и салата (1 ст. л. ~120 ккал) и
                  мёд (1 ст. л. ~65 ккал). С ними ~2650 ккал.
                </li>
                <li>
                  Примерно 43% калорий из жиров (шоколад, авокадо, орехи, сыр,
                  яйца), 31% из белка, 26% из углеводов. По программе расти должны
                  углеводы (рис, бананы, мёд), а не жиры.
                </li>
                <li>Белок ~195 г, выше цели программы (130-150 г), добирать не нужно.</li>
                <li>
                  Допущения: рис готовый, а не сухой (сухой 100 г ~350 ккал);
                  курица грудка (бедро ~320 ккал и 38 г белка); йогурт 2%.
                </li>
                <li>
                  На неделю считаем 6 домашних дней: в понедельник ем вне дома.
                </li>
              </ul>
            </div>
          </Fold>

          <Fold id="storage" eyebrow="Чтобы не испортилось" title="Как хранить">
            <div className="prose-guide mt-2">
              <ul>
                <li>
                  Курица: что не съешь до даты на упаковке, сразу в морозилку
                  порциями по 200 г. Размораживать в холодильнике с вечера.
                  Сковорода 10 минут.
                </li>
                <li>
                  Рис: открытый пакет доесть на следующий день, дольше суток
                  готовый рис не держать. Поэтому по полпакета (125 г) в день,
                  один пакет на 2 дня: вт-ср, чт-пт, сб-вс. Надорвать уголок, 2
                  минуты в микроволновке.
                </li>
                <li>
                  Бананы и авокадо: спелые на первые дни, зеленоватые и почти
                  мягкие дозреют к концу периода.
                </li>
                <li>
                  Йогурт и молоко: от вторника остаётся ~100 г йогурта и ~200 мл
                  молока, они переходят на пятницу.
                </li>
              </ul>
            </div>
          </Fold>

          <Fold id="ranked" eyebrow="Если некогда" title="По убыванию важности">
            <ol className="mt-2 list-decimal space-y-1.5 pl-6 font-body text-base text-silver marker:text-silver-muted">
              {RANKED.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ol>
          </Fold>

          <Fold id="ideas" eyebrow="Пока не выбраны" title="Другие опции">
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

          <Fold id="no-gluten" eyebrow="Не покупаем" title="Глютен">
            <div className="prose-guide mt-2">
              <p>
                Хлеб, хлебцы из пшеницы и ржи, овсянка, паста, выпечка: после
                глютена туман в голове. Их заменяют рис, рисовые хлебцы, банан и
                мёд. В самом рисе глютена нет, даже в «клейком» (glutinous rice);
                он бывает только в добавках, поэтому рис берём простой.
              </p>
            </div>
          </Fold>
        </div>
      </main>

      <footer className="mx-auto max-w-3xl px-6 pb-12 font-body text-sm text-silver-muted">
        Собрано 3 ноября 2026. Галочки запоминаются на этом телефоне.
      </footer>

      <script dangerouslySetInnerHTML={{ __html: TICKS_SCRIPT }} />
    </>
  );
}
