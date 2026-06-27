import Image from "next/image";
import Link from "next/link";

const storySections = [
  {
    eyebrow: "هدف دنتست",
    title: "بانک سوالی برای مطالعه دقیق‌تر، سریع‌تر و مطمئن‌تر",
    description:
      "دنتست برای دانشجویان و داوطلبان حوزه پزشکی ساخته شده تا مسیر پیدا کردن درس، مبحث و سوال مناسب ساده‌تر شود. به جای جست‌وجوی پراکنده بین منابع مختلف، همه چیز در یک ساختار منظم و قابل پیگیری کنار هم قرار می‌گیرد.",
    image: "/images/about/medical-study.png",
    alt: "دانشجویان پزشکی در حال مطالعه با تبلت",
  },
  {
    eyebrow: "ساختار آموزشی",
    title: "از دسته‌بندی درس‌ها تا تمرین هدفمند",
    description:
      "در دنتست، سوالات فقط یک فهرست ساده نیستند. هر سوال در مسیر درست خودش قرار می‌گیرد: درس، مبحث، سطح، آزمون و وضعیت یادگیری. این ساختار کمک می‌کند دانشجو بداند دقیقاً کجا ایستاده و قدم بعدی چیست.",
    image: "/images/about/question-bank-dashboard.png",
    alt: "داشبورد بانک سوال پزشکی",
    reverse: true,
  },
  {
    eyebrow: "تحلیل و پیشرفت",
    title: "یادگیری وقتی ارزشمند است که قابل اندازه‌گیری باشد",
    description:
      "هدف ما فقط نمایش سوال نیست؛ دنتست باید به دانشجو کمک کند روند پیشرفت، نقاط ضعف و مسیر مرور را بهتر ببیند. تحلیل عملکرد و دسترسی سریع به تمرین‌ها، مطالعه را از حالت پراکنده به یک برنامه قابل اجرا تبدیل می‌کند.",
    image: "/images/about/exam-analytics.png",
    alt: "تحلیل آزمون و پیشرفت تحصیلی",
  },
];

const values = [
  "دسترسی ساده به درس‌ها و دسته‌بندی‌ها",
  "تمرکز روی سوالات پزشکی و دندان‌پزشکی",
  "طراحی مناسب برای مطالعه روزانه",
  "آماده‌سازی برای توسعه آزمون و تحلیل هوشمند",
];

export default function AboutPage() {
  return (
    <div className="bg-white text-right" dir="rtl">
      <section className="relative overflow-hidden bg-blue-50/60 py-20 md:py-28">
        <div className="absolute inset-x-0 top-0 h-24 bg-white" />
        <div className="absolute -right-28 top-20 h-72 w-72 rounded-full bg-blue-200/40 blur-3xl" />
        <div className="absolute -left-24 bottom-10 h-64 w-64 rounded-full bg-blue-100/70 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div>
            <span className="inline-flex rounded-full border border-blue-100 bg-white px-4 py-2 text-xs font-black text-blue-700 shadow-sm">
              درباره دنتست
            </span>
            <h1 className="mt-6 max-w-3xl text-4xl font-black leading-[1.45] text-blue-950 md:text-6xl">
              بانک سوال پزشکی، برای مطالعه‌ای منظم و قابل اعتماد
            </h1>
            <p className="mt-6 max-w-2xl text-base font-medium leading-9 text-blue-950/70 md:text-lg">
              دنتست یک مسیر متمرکز برای مشاهده درس‌ها، دسترسی به سوالات و آماده‌سازی آزمون‌های پزشکی است. ما تلاش می‌کنیم تجربه مطالعه، از انتخاب درس تا تحلیل عملکرد، روشن‌تر و حرفه‌ای‌تر باشد.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/category"
                className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-blue-600 px-7 text-sm font-black text-white shadow-lg shadow-blue-100 transition-colors hover:bg-blue-700"
              >
                مشاهده دروس
              </Link>
              <Link
                href="/subscription"
                className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-blue-200 bg-white px-7 text-sm font-black text-blue-700 transition-colors hover:bg-blue-50"
              >
                مشاهده قیمت‌ها
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-6 rounded-[36px] bg-blue-200/30 blur-3xl" />
            <div className="relative overflow-hidden rounded-[32px] border border-blue-100 bg-white p-3 shadow-2xl shadow-blue-100">
              <Image
                src="/images/about/medical-study.png"
                alt="مطالعه پزشکی با بانک سوال دنتست"
                width={1536}
                height={1024}
                priority
                className="aspect-[4/3] w-full rounded-[24px] object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-xs font-black text-blue-700">
              چرا ساخته شد؟
            </span>
            <h2 className="mt-5 text-3xl font-black leading-tight text-blue-950 md:text-4xl">
              چون مطالعه پزشکی به نظم، سرعت و انتخاب درست نیاز دارد
            </h2>
            <p className="mt-4 text-sm font-medium leading-8 text-blue-950/65 md:text-base">
              بانک سوال خوب فقط تعداد زیادی سوال نیست؛ باید سوال‌ها را قابل جست‌وجو، قابل تمرین و قابل تحلیل کند.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-4">
            {values.map((value) => (
              <div
                key={value}
                className="rounded-[24px] border border-blue-100 bg-blue-50/50 p-5 text-center shadow-sm shadow-blue-100/50"
              >
                <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-white text-blue-600 shadow-sm">
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m5 12 4 4 10-10" />
                  </svg>
                </div>
                <p className="text-sm font-black leading-7 text-blue-950">
                  {value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-16 bg-blue-50/40 py-20">
        {storySections.map((section) => (
          <div key={section.title} className="mx-auto max-w-7xl px-6">
            <div
              className={`grid grid-cols-1 items-center gap-10 lg:grid-cols-2 ${
                section.reverse ? "lg:[&>*:first-child]:order-2" : ""
              }`}
            >
              <div className="relative">
                <div className="absolute inset-5 rounded-[32px] bg-blue-200/30 blur-3xl" />
                <div className="relative overflow-hidden rounded-[32px] border border-blue-100 bg-white p-3 shadow-xl shadow-blue-100">
                  <Image
                    src={section.image}
                    alt={section.alt}
                    width={1536}
                    height={1024}
                    className="aspect-[4/3] w-full rounded-[24px] object-cover"
                  />
                </div>
              </div>

              <div className="rounded-[32px] border border-blue-100 bg-white p-7 shadow-sm shadow-blue-100/60 md:p-9">
                <span className="inline-flex rounded-full bg-blue-50 px-4 py-2 text-xs font-black text-blue-700">
                  {section.eyebrow}
                </span>
                <h2 className="mt-5 text-3xl font-black leading-[1.45] text-blue-950 md:text-4xl">
                  {section.title}
                </h2>
                <p className="mt-5 text-sm font-medium leading-9 text-blue-950/70 md:text-base">
                  {section.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="overflow-hidden rounded-[36px] border border-blue-100 bg-blue-600 p-8 text-white shadow-2xl shadow-blue-100 md:p-10">
            <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-[1fr_auto]">
              <div>
                <h2 className="text-3xl font-black leading-tight md:text-4xl">
                  آماده‌ای مسیر مطالعه‌ات را منظم‌تر کنی؟
                </h2>
                <p className="mt-4 max-w-2xl text-sm font-medium leading-8 text-blue-50 md:text-base">
                  از مشاهده درس‌ها شروع کن، ساختار بانک سوال را ببین و بعد با حساب کاربری خودت وارد مسیر تمرین و آزمون شو.
                </p>
              </div>
              <Link
                href="/category"
                className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-white px-8 text-sm font-black text-blue-700 transition-colors hover:bg-blue-50"
              >
                شروع از درس‌ها
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
