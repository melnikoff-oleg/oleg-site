import Link from "next/link";
import type { ReactNode } from "react";

// Oleg's training program for the first eight-week cycle, written out as a
// page he can open in the gym. A server component with no client JavaScript:
// the whole thing is prose, lists and cards on the site's tokens, and the
// first screen is the finished hero. Source: Desktop/Fitness/program_oct_2026.md.

type Exercise = {
  name: string;
  sets: string;
  /** Starting weight or load, when the program names one. */
  start?: string;
  rest?: string;
  note?: string;
};

type Workout = {
  id: string;
  day: string;
  title: string;
  focus: string;
  duration: string;
  exercises: Exercise[];
  /** Lines after the numbered list (cardio day, rest day). */
  extra?: ReactNode;
};

const WEEK: { day: string; title: string; time: string; rest?: boolean }[] = [
  { day: "Вт", title: "Тяги A: ширина спины, задние дельты, бицепс, предплечья", time: "65-70 мин" },
  { day: "Ср", title: "Жимы A: дельты в приоритете, верх груди, трицепс", time: "60-70 мин" },
  { day: "Чт", title: "Ноги + становая + пресс", time: "65 мин" },
  { day: "Пт", title: "Тяги B: толщина спины, задние дельты, бицепс, предплечья", time: "65 мин" },
  { day: "Сб", title: "Жимы B: верх груди в приоритете, дельты, трицепс", time: "60 мин" },
  { day: "Вс", title: "Кардио + пресс + предплечья + длинная растяжка", time: "60-75 мин" },
  { day: "Пн", title: "Отдых. Кайт, если есть ветер", time: "", rest: true },
];

const WARMUP: string[] = [
  "велик или дорожка в наклоне: 3-4 мин",
  "наружная ротация плеча с резинкой или на нижнем блоке, локоть прижат к боку: 2×15 легко, 30 с между",
  "разведения резинки перед собой (pull-aparts): 2×20, 30 с",
  "face pull легко: 2×15, 30 с",
  "chin tucks (подбородок назад, затылок вверх): 10 раз",
  "грудной отдел на ролике или через край скамьи: 45-60 с",
  "подводящие к первому упражнению: 50% ×10, 70% ×5, 85% ×2, по 45-60 с между",
];

const WORKOUTS: Workout[] = [
  {
    id: "vt",
    day: "Вторник",
    title: "Тяги A",
    focus: "ширина спины, задние дельты, бицепс, предплечья",
    duration: "65-70 мин",
    exercises: [
      { name: "Подтягивания с весом, хват чуть шире плеч", sets: "4×6-10", start: "+5 кг", rest: "2.5-3 мин" },
      {
        name: "Тяга гантелей лёжа грудью на скамье 30-45° или тяга в тренажёре с упором",
        sets: "4×8-12",
        start: "25-30 кг",
        rest: "2 мин",
        note: "Вместо тяги штанги в наклоне: убирает поясницу и слабый хват из уравнения.",
      },
      { name: "Пуловер на блоке с прямыми руками", sets: "3×12-15", rest: "60-90 с", note: "Широчайшие, которые плохо чувствуются." },
      { name: "Разведения на задние дельты на блоке, руки крест-накрест на уровне лица", sets: "4×15-20", rest: "60-90 с" },
      { name: "Y-raise лёжа на наклонной скамье, большие пальцы вверх", sets: "3×12-15", start: "2-4 кг", rest: "60 с", note: "Нижние трапеции, осанка." },
      { name: "Сгибания с гантелями сидя на наклонной скамье", sets: "3×8-12", note: "Суперсет с обратными сгибаниями." },
      { name: "Обратные сгибания с EZ-грифом", sets: "3×10-15", rest: "90 с после пары" },
      { name: "Вис на турнике", sets: "2× до отказа", rest: "60-90 с" },
    ],
  },
  {
    id: "sr",
    day: "Среда",
    title: "Жимы A",
    focus: "дельты в приоритете, верх груди, трицепс",
    duration: "около 70 мин",
    exercises: [
      {
        name: "Жим гантелей сидя",
        sets: "3×6-10 (потом 4)",
        start: "18 кг",
        rest: "2.5-3 мин",
        note: "Подводящие: 10 кг ×10, 14 кг ×5, 16 кг ×3. Спинка 80-85°, не строго вертикально. Опускать до уровня подбородка-ушей, не ниже, плечу так спокойнее. Если первый подход вышел 10 с запасом 3+, второй на 20.",
      },
      {
        name: "Махи гантелями в стороны",
        sets: "3×10-15 (потом 4)",
        start: "8 кг",
        rest: "60-90 с",
        note: "Локти чуть согнуты, до уровня плеч, без раскачки корпусом. Если 8 кг строго на 15+, брать 10.",
      },
      {
        name: "Жим гантелей 30°",
        sets: "3×8-12",
        start: "22 кг",
        rest: "2-2.5 мин",
        note: "Подводящие: 14 кг ×8, 18 кг ×3, по 45-60 с между. Лопатки свёл и опустил, в нижней точке гантели на уровне груди, без глубокого растяжения.",
      },
      {
        name: "Face pull",
        sets: "3×12-15",
        start: "тяжелее разминочного",
        rest: "60-90 с",
        note: "Канат на уровне лица, тянуть к глазам, локти в стороны и вверх, в конце пауза 1 с.",
      },
      {
        name: "Трицепс, суперсет: разгибания из-за головы с канатом на блоке 10-15, сразу разгибания с канатом вниз 12-15",
        sets: "3 круга",
        rest: "90 с после пары",
        note: "Между двумя упражнениями отдыха нет. Третий круг обоих почти до отказа.",
      },
      {
        name: "Наружная ротация на блоке",
        sets: "2×12-15 на каждую руку, легко",
        rest: "45-60 с",
        note: "12-15 одной рукой, сразу без паузы 12-15 другой, это один подход. Вес совсем маленький, первая-вторая плитка; последние повторы в контроле, а не в борьбе. Локоть всё время у бока, можно зажать свёрнутое полотенце между локтем и рёбрами. Амплитуда: предплечье в начале лежит поперёк живота, кисть у противоположного бока; поворот наружу через положение «прямо вперёд» и ещё градусов на 20-40, пока комфортно, всего примерно 110-120°, без дожима в конце. Темп: 2 секунды туда, 2 обратно.",
      },
    ],
    extra: (
      <p>
        Тайминг первой тренировки цикла: 0:00 разминка, 0:12 жим сидя, 0:22 махи, 0:28 жим 30°, 0:38 face pull, 0:44
        трицепс, 0:53 ротация, 0:57 растяжка 8-10 мин.
      </p>
    ),
  },
  {
    id: "cht",
    day: "Четверг",
    title: "Ноги + становая + пресс",
    focus: "ноги для поддержания, становая, нижний пресс",
    duration: "65 мин",
    exercises: [
      { name: "Присед со штангой, глубоко", sets: "4×6-10", start: "65-70 кг", rest: "2.5-3 мин" },
      {
        name: "Становая классика",
        sets: "3×5-8",
        start: "ориентир 90-100 кг",
        rest: "2.5-3 мин",
        note: "Вес с запасом 2-3 повтора, техника идеальная. Раз в 2 недели менять на румынскую 3×8-12.",
      },
      { name: "Болгарские выпады или выпады в смите", sets: "3×8-12 на ногу", rest: "2 мин" },
      { name: "Сгибания ног в тренажёре", sets: "3×10-15", rest: "60-90 с", note: "Если нет тренажёра, румынская с гантелями." },
      { name: "Икры стоя", sets: "3×12-20", rest: "60 с" },
      {
        name: "Подъём ног в висе",
        sets: "3×10-15",
        rest: "60-90 с",
        note: "В верхней точке подкручивать таз вверх, иначе работают сгибатели бедра, а не пресс.",
      },
      { name: "Обратные скручивания", sets: "3×12-15", rest: "60 с" },
    ],
  },
  {
    id: "pt",
    day: "Пятница",
    title: "Тяги B",
    focus: "толщина спины, задние дельты, бицепс, предплечья",
    duration: "65 мин",
    exercises: [
      { name: "Тяга в тренажёре или с упором грудью, тяжело", sets: "4×6-10", rest: "2.5-3 мин" },
      { name: "Тяга верхнего блока нейтральным хватом", sets: "4×8-12", rest: "2 мин" },
      { name: "Разведения на задние дельты с гантелями лёжа на скамье 30°", sets: "4×12-20", start: "6-8 кг", rest: "60-90 с" },
      { name: "Face pull", sets: "3×12-15", rest: "60-90 с" },
      { name: "Сгибания с EZ-грифом или на блоке", sets: "3×8-12", note: "Суперсет с молотками." },
      { name: "Молотки", sets: "3×10-12", rest: "90 с после пары" },
      { name: "Сгибания запястий со штангой", sets: "3×15-20", note: "Суперсет с прогулкой фермера." },
      { name: "Прогулка фермера с гантелями или гирями", sets: "2×40 с", rest: "90 с после пары" },
    ],
  },
  {
    id: "sb",
    day: "Суббота",
    title: "Жимы B",
    focus: "верх груди в приоритете, дельты, трицепс",
    duration: "60 мин",
    exercises: [
      {
        name: "Жим штанги или гантелей 30°",
        sets: "4×6-10",
        start: "штанга 45-50 кг",
        rest: "2.5-3 мин",
        note: "Если плечо напряжено, гантели.",
      },
      { name: "Махи в стороны на блоке одной рукой", sets: "4×12-20", rest: "60-90 с" },
      {
        name: "Сведения на блоке снизу вверх",
        sets: "3×12-15",
        rest: "60-90 с",
        note: "Лёгкий вес, без глубокого растяжения. Если плечо ноет, замена на жим гантелей 15° 3×8-12.",
      },
      { name: "Разведения на задние дельты на блоке", sets: "3×15-20", rest: "60-90 с" },
      { name: "Махи гантелями в стороны", sets: "3×12-15", rest: "60-90 с" },
      { name: "Французский жим лёжа с EZ-грифом", sets: "3×8-12", note: "Суперсет с разгибаниями." },
      { name: "Разгибания на блоке", sets: "2×12-15", rest: "90 с после пары" },
    ],
  },
  {
    id: "vs",
    day: "Воскресенье",
    title: "Кардио + пресс + предплечья + растяжка",
    focus: "ходьба в гору, пресс кругами, предплечья, длинная растяжка",
    duration: "60-75 мин",
    exercises: [
      {
        name: "Ходьба в гору",
        sets: "35-40 мин",
        note: "Наклон 10-15%, 5.5-6.5 км/ч, пульс 125-145, можно говорить. Велик на том же пульсе тоже ок. Бег сам по себе для коленей не вреден, травма голеностопа была от полумарафона без подготовки; для набора он не нужен, но 20-25 мин лёгкого бега раз в неделю вместо дорожки не навредят.",
      },
      {
        name: "Пресс, 3 круга: подъём ног в висе 10-15, обратные скручивания 15, dead bug 10 на сторону, планка с напряжением всего тела 30 с",
        sets: "3 круга",
        rest: "60-90 с между кругами",
      },
      { name: "Предплечья: сгибания и разгибания запястий", sets: "3×15-20" },
      { name: "Вис на турнике", sets: "2× до отказа" },
      { name: "Растяжка, всё из списка по 2 подхода", sets: "15-20 мин" },
    ],
  },
];

const STRETCH: string[] = [
  "грудные в дверном проёме или у стойки: 2×40 с",
  "широчайшие, вис за стойку одной рукой: 40 с на сторону",
  "сгибатели бедра, couch stretch (колено у стены): 45 с на сторону. Главное после 12 часов сидения",
  "задняя поверхность бедра: 45 с на сторону",
  "грудной отдел на ролике: 1 мин",
  "шея, наклон головы в сторону и вперёд-вниз: 30 с на сторону",
];

const TOC: { href: string; label: string }[] = [
  { href: "#week", label: "Неделя" },
  { href: "#warmup", label: "Разминка" },
  { href: "#workouts", label: "Тренировки" },
  { href: "#stretch", label: "Растяжка" },
  { href: "#rules", label: "Правила" },
  { href: "#food", label: "Питание" },
  { href: "#log", label: "Учёт" },
];

function SectionTitle({ id, eyebrow, children }: { id: string; eyebrow: string; children: ReactNode }) {
  return (
    <div id={id} className="scroll-mt-24">
      <p className="eyebrow font-body text-[13px] text-vivid-blue">{eyebrow}</p>
      <h2 className="mt-3 font-display text-2xl font-semibold leading-[1.15] tracking-tight text-silver md:text-3xl">
        {children}
      </h2>
    </div>
  );
}

/**
 * An h3 subsection. The heading sits outside `.prose-guide` and the body gets a
 * block of its own, because the prose rules zero every list's margin with more
 * specificity than an `mt-*` utility carries, so a list right after an h3
 * would otherwise touch it.
 */
function Sub({ title, children }: { title: string; children: ReactNode }) {
  return (
    <>
      <h3 className="mt-10 font-display text-xl font-semibold leading-[1.15] tracking-tight text-silver">{title}</h3>
      <div className="prose-guide mt-4">{children}</div>
    </>
  );
}

function Section({ children, lazy = true }: { children: ReactNode; lazy?: boolean }) {
  return (
    <section className={`${lazy ? "offscreen-lazy " : ""}mx-auto max-w-3xl px-6 pb-16 md:pb-20`}>{children}</section>
  );
}

function WorkoutCard({ w }: { w: Workout }) {
  return (
    <article id={w.id} className="surface-card scroll-mt-24 p-6 md:p-8">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <p className="eyebrow font-body text-[13px] text-vivid-blue">{w.day}</p>
        <p className="font-body text-sm text-silver-muted">{w.duration}</p>
      </div>
      <h3 className="mt-2 font-display text-xl font-semibold leading-[1.15] tracking-tight text-silver md:text-2xl">
        {w.title}
      </h3>
      <p className="mt-1 font-body text-sm text-silver-muted">{w.focus}</p>
      <ol className="mt-6 flex flex-col gap-5">
        {w.exercises.map((e, i) => (
          <li key={e.name} className="flex gap-4">
            <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full border border-hairline bg-vivid-blue/10 font-body text-xs font-semibold text-vivid-blue">
              {i + 1}
            </span>
            <div className="min-w-0">
              <p className="font-body text-base text-silver">
                <strong className="font-semibold text-white">{e.name}</strong>
              </p>
              <p className="mt-1 flex flex-wrap gap-x-3 gap-y-1 font-body text-sm text-silver-muted">
                <span className="whitespace-nowrap text-silver">{e.sets}</span>
                {e.start ? <span className="whitespace-nowrap">старт {e.start}</span> : null}
                {e.rest ? <span className="whitespace-nowrap">отдых {e.rest}</span> : null}
              </p>
              {e.note ? <p className="mt-1.5 font-body text-sm leading-relaxed text-silver-muted">{e.note}</p> : null}
            </div>
          </li>
        ))}
      </ol>
      {w.extra ? <div className="mt-6 border-t border-hairline pt-5 font-body text-sm text-silver-muted">{w.extra}</div> : null}
    </article>
  );
}

export default function FitnessPage() {
  return (
    <>
      <header className="px-2">
        <div className="mx-auto mt-2 flex max-w-3xl items-center justify-between px-6 py-4">
          <Link href="/" className="brand-wordmark font-display text-lg tracking-tight">
            Oleg Melnikov
          </Link>
          <span className="font-body text-sm text-silver-muted">личная страница</span>
        </div>
      </header>

      <main>
        <section className="pt-12 pb-10 md:pt-20 md:pb-14">
          <div className="mx-auto max-w-3xl px-6">
            <span className="eyebrow inline-block align-top rounded-full border border-hairline bg-vivid-blue/10 px-4 py-1.5 font-body text-xs text-vivid-blue/90">
              цикл 1 · с 28 октября 2026
            </span>
            <h1 className="text-metallic mt-8 font-display text-3xl font-semibold leading-[1.1] tracking-tight sm:text-4xl md:text-5xl">
              Программа набора мышц
            </h1>
            <p className="mt-4 font-body text-lg text-silver-muted md:text-xl">
              Первый цикл 8 недель, потом пересмотр по логу и графику веса. Шесть тренировок в неделю до 90 минут,
              понедельник отдых, кардио раз в неделю, растяжка в конце каждой силовой.
            </p>
            <nav aria-label="Разделы" className="mt-8 flex flex-wrap gap-2">
              {TOC.map((t) => (
                <a
                  key={t.href}
                  href={t.href}
                  className="inline-flex min-h-[44px] items-center rounded-full border border-hairline px-4 py-2.5 font-body text-sm font-semibold text-silver transition-colors hover:border-vivid-blue/50 hover:text-white"
                >
                  {t.label}
                </a>
              ))}
            </nav>
          </div>
        </section>

        <Section lazy={false}>
          <SectionTitle id="goals" eyebrow="Цели">
            Что растим и в каком порядке
          </SectionTitle>
          <div className="prose-guide mt-6">
            <ul>
              <li>
                Набрать мышечную массу. Приоритеты по порядку: задние дельты, средние и передние дельты, спина, осанка
                (голова вперёд), нижний пресс, верх груди, бицепс и трицепс, предплечья. Ноги только для поддержания.
              </li>
              <li>
                Здоровье и техника важнее веса на штанге. Плечо хорошо разминать, два упражнения на передние дельты
                подряд не ставить.
              </li>
              <li>Еда: очень постепенно, без насилия над аппетитом.</li>
              <li>Ориентир по весу: +0.5-1 кг в месяц после первого скачка воды.</li>
            </ul>
            <p>
              <strong>Почему стояло 5 лет.</strong> По логу: одно-два упражнения за тренировку, на каждую мышцу 5-7
              рабочих подходов в неделю, между тренировками дыры по 5-9 дней. Это объём поддержания, и еда ровно на
              поддержание. Программа поднимает объём на приоритетные группы примерно в 3 раза, еда добавляется маленькими
              шагами. Ноги раз в неделю для поддержания достаточно: тестостерон от отдельной тренировки ног не растёт,
              это миф, но присед и становая всё равно нужны.
            </p>
          </div>
        </Section>

        <Section>
          <SectionTitle id="week" eyebrow="Структура недели">
            Шесть дней, один отдых
          </SectionTitle>
          <ol className="surface-card mt-6 divide-y divide-hairline">
            {WEEK.map((d) => (
              <li key={d.day} className="flex items-start gap-4 px-5 py-4 md:px-6">
                <span
                  className={`mt-0.5 flex w-9 shrink-0 items-center justify-center rounded-full border border-hairline py-1 font-body text-xs font-semibold ${
                    d.rest ? "text-silver-muted" : "bg-vivid-blue/10 text-vivid-blue"
                  }`}
                >
                  {d.day}
                </span>
                <div className="flex min-w-0 flex-1 flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <p className={`font-body text-base ${d.rest ? "text-silver-muted" : "text-silver"}`}>{d.title}</p>
                  {d.time ? <span className="whitespace-nowrap font-body text-sm text-silver-muted">{d.time}</span> : null}
                </div>
              </li>
            ))}
          </ol>
          <div className="prose-guide mt-6">
            <p>
              Кардио отдельным днём: туда же уезжают пресс, предплечья и длинная растяжка. Альтернатива на будущее: 6
              силовых, кардио 20 минут после субботы, воскресенье под пресс и растяжку. Начинаем с варианта в списке.
            </p>
            <p>
              <strong>Первые 2 недели везде 3 подхода вместо 4.</strong> Плечи и локти не привыкли к такому объёму.
            </p>
          </div>
        </Section>

        <Section>
          <SectionTitle id="warmup" eyebrow="Разминка">
            Каждый силовой день, 10-12 мин
          </SectionTitle>
          <div className="prose-guide mt-6">
            <ul>
              {WARMUP.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
          </div>
        </Section>

        <Section>
          <SectionTitle id="workouts" eyebrow="Тренировки">
            Шесть дней по упражнениям
          </SectionTitle>
          <div className="mt-6 flex flex-col gap-6">
            {WORKOUTS.map((w) => (
              <WorkoutCard key={w.id} w={w} />
            ))}
          </div>
        </Section>

        <Section>
          <SectionTitle id="stretch" eyebrow="Растяжка">
            В конце каждой силовой, 8-10 мин
          </SectionTitle>
          <div className="prose-guide mt-6">
            <ul>
              {STRETCH.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
            <p>
              <strong>Отдых между подходами.</strong> Подводящие 45-60 с. Тяжёлая база (жим сидя, присед, становая,
              подтягивания, тяжёлые тяги) 2.5-3 мин. Второй жим или вторая тяга в тренировке 2 мин. Изоляция (махи,
              задние дельты, face pull, бицепс, трицепс, предплечья, пресс) 60-90 с. Суперсет: ноль между
              упражнениями, 90 с после пары.
            </p>
            <p>
              Между упражнениями столько, сколько уходит на переход, обычно 2-3 мин. Это не отдых по таймеру: переставил
              скамью, взял вес, сделал подводящий, и в рабочий. Перед изоляцией можно начинать через 1.5-2 мин. Дольше 3
              минут не сидеть, иначе тренировка расползается за 90.
            </p>
          </div>
        </Section>

        <Section>
          <SectionTitle id="rules" eyebrow="Правила">
            Прогрессия и техника
          </SectionTitle>
          <div className="prose-guide mt-6">
            <ul>
              <li>Первые 2 недели везде 3 подхода вместо 4. Плечи и локти не привыкли к такому объёму.</li>
              <li>
                Вес: на первой тренировке искать такой, с которым делаешь нижнюю границу диапазона с запасом 2 повтора.
                Когда во всех подходах дошёл до верхней границы, на следующей добавлять: штанга +2.5 кг, гантели
                следующий размер, блок одна плитка.
              </li>
              <li>Запас: база 1-3 повтора в запасе, изоляция последний подход почти до отказа.</li>
              <li>
                Два жимовых никогда подряд: между ними всегда махи или задние дельты. Брусьев и горизонтального жима в
                программе нет намеренно.
              </li>
              <li>Острая боль в плече: упражнение в этот день пропускается, в следующий раз гантели или тренажёр.</li>
              <li>Каждая 7-я неделя разгрузка: те же упражнения, половина подходов, вес минус 15%.</li>
              <li>
                Лямки (петли на запястья, которые цепляются за гриф, чтобы хват не ограничивал тягу) пока не нужны,
                предплечья в целях. На становой разнохват. Вернуться к вопросу через 2 месяца, если хват начнёт
                тормозить спину.
              </li>
              <li>Осталось время в зале: не добавлять упражнения, растянуться дольше.</li>
            </ul>
            <p>
              <strong>Осанка вне зала.</strong> Телефон и экран на уровне глаз, ноут на подставке. Каждый час сидения 2
              минуты стоя и 10 chin tucks. 7-8 тысяч шагов в день, сейчас сильно меньше; это ещё и аппетит поднимет.
            </p>
            <p>
              <strong>Нижний пресс.</strong> Виден примерно с 8-10% жира, сейчас 12 и впереди набор. Генетика влияет на
              форму кубиков, а не на то, видно их или нет. В этом цикле пресс утолщаем (подъёмы ног в висе, обратные
              скручивания, dead bug), покажется на сушке через несколько месяцев. В зеркале в ближайшие 2-3 месяца его
              не ждать.
            </p>
          </div>
        </Section>

        <Section>
          <SectionTitle id="food" eyebrow="Питание">
            Очень постепенно
          </SectionTitle>
          <div className="prose-guide mt-6">
            <ul>
              <li>
                Аппетит маленький, поэтому калории добавляются там, где нет объёма: жидкость (молоко, протеин с бананом и
                мёдом) и плотная еда (хлеб, рис, мёд, банан), а не тарелки.
              </li>
              <li>Шаги по 150-200 ккал раз в 1-2 недели. Насильно не есть, отвращение сломает набор.</li>
              <li>
                Завтрак (яйца, авокадо, сыр, салат) это самые сытные калории из возможных. Хлеб, мёд, банан, молоко, рис
                дают те же калории в разы меньшим объёмом.
              </li>
              <li>Жиры (сыр, орехи, авокадо, шоколад) не увеличивать, расти должны углеводы.</li>
              <li>
                Через 2-3 недели на таком объёме тренировок аппетит обычно приходит сам. Подстраиваемся под него, не
                бежим впереди.
              </li>
            </ul>
          </div>
          <Sub title="Лесенка">
            <ul>
              <li>
                <strong>Недели 1-2.</strong> Сразу после зала протеин в 300 мл молока + банан + ложка мёда, просто выпить
                (около 400 ккал, через полчаса сытости нет). В завтраке 2 хлебца заменить на 2 ломтика хлеба, та же
                сытость, +100 ккал. В обычном приёме после зала половину салата заменить на горсть риса или гречки, или
                2 ломтика хлеба. Вечером по желанию стакан молока или 100 г творога, не хочется, пропускать.
              </li>
              <li>
                <strong>Недели 3-4.</strong> Перекус в 11 перед залом, банан с мёдом или 40 г овсянки в молоке.
              </li>
              <li>
                <strong>Дальше по весам.</strong> Среднее за неделю не растёт, ещё один шаг на 150-200. Растёт, стоим.
              </li>
            </ul>
          </Sub>
          <Sub title="Пример тренировочного дня">
            <p>Конец тренировки 15:00, еда до 19:30, отбой 23:00.</p>
            <ul>
              <li>15:15: протеин в 300 мл молока + банан + ложка мёда</li>
              <li>
                17:30: обычный приём в обычном объёме, вместо половины салата горсть риса или гречки, или 2 ломтика хлеба
                вместо хлебцев
              </li>
              <li>19:15: если хочется, стакан молока или 100 г творога</li>
            </ul>
            <p>
              Это +300-400 ккал к обычному дню без единого лишнего куска. Не есть после 19:30 при отбое в 23 на набор не
              влияет, если дневная сумма набрана.
            </p>
          </Sub>
          <Sub title="Белок, креатин, вода">
            <ul>
              <li>
                Белок ориентир 130-150 г в день, без форсирования. Шейк и творог закрывают дыры. Мясо, рыба, курица, если
                ешь, упрощают задачу.
              </li>
              <li>
                Креатин моногидрат 5 г каждый день с любой едой, без загрузки. Через 2-3 недели +1-1.5 кг воды в мышцах,
                это нормально.
              </li>
              <li>Вода 2.5-3 л в день, на углеводах и креатине будет тянуть пить больше.</li>
              <li>Кофе утром норм, не трогать.</li>
            </ul>
          </Sub>
          <Sub title="Контроль">
            <ul>
              <li>Взвешивание каждое утро после туалета, смотреть среднее за неделю.</li>
              <li>Первые 2 недели вес прыгнет на 1-2 кг от углеводов и креатина, это вода.</li>
              <li>
                Дальше цель +0.5-1 кг в месяц. За 2 недели среднее не растёт: ещё шаг +150-200 ккал. Растёт быстрее 1 кг
                за 2 недели: шаг назад.
              </li>
            </ul>
          </Sub>
        </Section>

        <Section>
          <SectionTitle id="log" eyebrow="Учёт">
            Формат записи в заметках
          </SectionTitle>
          <div className="prose-guide mt-6">
            <pre className="surface-card whitespace-pre-wrap p-5 font-mono text-sm leading-relaxed text-silver">
              {"вт 28.10 тяги A\nподтяг +5: 9 8 7 6\nтяга упор 27.5: 12 11 10 9\n..."}
            </pre>
            <p>
              Когда везде верхняя граница, ставить ↑ и в следующий раз добавлять вес. Где в последнем подходе остался запас
              3+, вес выше. Где не дотянул до нижней границы, вес ниже.
            </p>
            <p>
              <strong>Чего ждать.</strong> Первые 2-3 недели крепатура. Силовые должны пойти вверх через 4-6 недель.
              Контрольная точка через 8 недель: лог тренировок и график веса, перестройка программы.
            </p>
          </div>
        </Section>
      </main>

      <footer className="mx-auto max-w-3xl px-6 pb-12 font-body text-sm text-silver-muted">
        Составлено 28 октября 2026. Пересмотр после восьмой недели.
      </footer>
    </>
  );
}
