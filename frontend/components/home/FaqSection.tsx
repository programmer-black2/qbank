import Link from "next/link";

const faqs = [
  {
    question: "بانک سوال چه ویژگی‌هایی دارد؟",
    answer:
      "بانک سوال دنتست شامل سوالات طبقه‌بندی‌شده، دسترسی به درس‌ها و مبحث‌ها، امکان تمرین هدفمند و مسیر ورود به سوالات آزمونی است تا دانش‌آموز بتواند راحت‌تر درس موردنظرش را پیدا کند.",
  },
  {
    question: "آیا مشاهده درس‌ها نیاز به ورود دارد؟",
    answer:
      "خیر. لیست درس‌ها و دسته‌بندی‌ها برای همه کاربران قابل مشاهده است تا قبل از ورود یا خرید اشتراک، ساختار بانک سوال را بررسی کنند.",
  },
  {
    question: "برای مشاهده سوالات باید چه کاری انجام دهم؟",
    answer:
      "برای دیدن سوالات باید وارد حساب کاربری شوید. اگر سوالات مربوط به بخش اشتراکی باشد، داشتن اشتراک فعال هم لازم است.",
  },
  {
    question: "اشتراک چه امکاناتی را فعال می‌کند؟",
    answer:
      "با اشتراک فعال می‌توانید به محتوای سوالات دسترسی داشته باشید و از امکاناتی استفاده کنید که برای کاربران عادی یا مهمان باز نیست.",
  },
  {
    question: "از چه دستگاه‌هایی می‌توانم استفاده کنم؟",
    answer:
      "طراحی سایت واکنش‌گراست و می‌توانید با موبایل، تبلت، لپ‌تاپ یا کامپیوتر از بخش‌های مختلف دنتست استفاده کنید.",
  },
];

function FaqItem({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) {
  return (
    <details className="group rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 open:border-blue-200 open:bg-blue-50/40 open:shadow-lg open:shadow-blue-100/50">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-5 text-right marker:hidden md:px-6 [&::-webkit-details-marker]:hidden">
        <span className="flex items-center gap-4">
          <span className="text-sm font-black leading-7 text-slate-800 md:text-base">
            {question}
          </span>
        </span>

        <span className="relative h-9 w-9 shrink-0 rounded-xl border border-slate-200 bg-white text-blue-600 transition-colors group-open:border-blue-200 group-open:bg-white">
          <span className="absolute left-1/2 top-1/2 h-0.5 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-current"></span>
          <span className="absolute left-1/2 top-1/2 h-4 w-0.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-current transition-transform duration-300 group-open:rotate-90"></span>
        </span>
      </summary>

      <div className="px-5 pb-5 md:px-6">
        <div className="border-t border-blue-100 pt-4">
          <p className="text-justify text-sm font-medium leading-8 text-slate-500 md:text-base">
            {answer}
          </p>
        </div>
      </div>
    </details>
  );
}

export default function FaqSection() {
  return (
    <section className="bg-white py-20" dir="rtl">
      <div className="mx-auto max-w-5xl px-6">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <span className="inline-flex rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-xs font-black text-blue-700">
            پرسش‌های پرتکرار
          </span>

          <h2 className="mt-5 text-3xl font-black leading-tight text-slate-900 md:text-4xl">
            سوالات <span className="text-blue-600">متداول</span>
          </h2>

          <p className="mt-4 text-sm font-medium leading-7 text-slate-500 md:text-base">
            پاسخ کوتاه و روشن به سوال‌هایی که معمولاً قبل از شروع استفاده از
            بانک سوال دنتست پیش می‌آید.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq) => (
            <FaqItem key={faq.question} {...faq} />
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 rounded-3xl border border-blue-100 bg-blue-50 p-6 text-center md:flex-row md:text-right">
          <div>
            <p className="text-base font-black text-blue-900">
              پاسخ سوال خود را پیدا نکردید؟
            </p>
            <p className="mt-2 text-sm font-medium text-blue-700">
              وارد حساب کاربری شوید و مسیر استفاده از بانک سوال را ادامه دهید.
            </p>
          </div>

          <Link
            href="/login"
            className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-blue-600 px-8 text-sm font-black text-white shadow-lg shadow-blue-200 transition-all hover:bg-blue-700 active:scale-95"
          >
            ورود به حساب
          </Link>
        </div>
      </div>
    </section>
  );
}
