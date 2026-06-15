import Image from "next/image";
import Link from "next/link";
import HomeStats from "@/components/home/HomeStats";

const features = [
  {
    title: "حل تمرین",
    description:
      "سوالات هر مبحث درسی را پس از تدریس دبیر جواب بده و آنقدر تمرین کن تا مسلط شوی. با ویژگی حل تمرین، نیازی به کتاب‌های تستی حجیم نداری!",
    image: "/images/1.png",
    alt: "حل تمرین",
  },
  {
    title: "حل آزمون",
    description:
      "به راحتی آزمون‌های زمان‌دار بساز و خودت را به چالش بکش. بلافاصله پس از اتمام، تحلیل دقیق و مشاوره هوشمند دریافت کن.",
    image: "/images/2.png",
    alt: "حل آزمون",
  },
  {
    title: "آزمون‌های من",
    description:
      "دسترسی به تمام آزمون‌هایی که خودت ساختی یا دبیرت ارسال کرده است. آرشیو کامل سوالات گزینه دو در دستان شماست.",
    image: "/images/3.png",
    alt: "آزمون‌های من",
  },
  {
    title: "سوال‌های من",
    description:
      "سوالات دشوار یا اشتباهاتت را علامت‌گذاری کن. اینجا لیست شخصی‌سازی شده از نقاط ضعف و علایق تستی تو قرار دارد.",
    image: "/images/4.png",
    alt: "سوال‌های من",
  },
  {
    title: "کارنامه‌های من",
    description:
      "تحلیل دقیق هر آزمون به تفکیک درس و مبحث. روند پیشرفت خود را در آزمون‌های مدرسه و کشوری مقایسه و بررسی کنید.",
    image: "/images/5.png",
    alt: "کارنامه‌ها",
  },
  {
    title: "وضعیت من",
    description:
      "گزارش آماری هوشمند از روند تحصیلی شما. نقاط قوت و ضعف خود را بر اساس نمودارهای پیشرفت به دقت شناسایی کنید.",
    image: "/images/6.png",
    alt: "وضعیت تحصیلی",
  },
];

type FeatureCardProps = {
  title: string;
  description: string;
  image: string;
  alt: string;
};

function FeatureCard({ title, description, image, alt }: FeatureCardProps) {
  return (
    <div className="h-full p-4" style={{ perspective: "1000px" }}>
      <div
        className="group relative flex h-full min-h-[280px] flex-col items-center overflow-hidden rounded-[35px] border border-slate-100 bg-white/70 p-8 text-center shadow-sm backdrop-blur-lg transition-all duration-500 ease-out hover:shadow-2xl hover:shadow-blue-100/50"
        style={{
          transformStyle: "preserve-3d",
          transform: "translate(0px, 0px) rotateX(0deg) rotateY(0deg)",
        }}
      >
        <div className="absolute -inset-24 rounded-full bg-gradient-to-br from-blue-50/40 to-transparent opacity-0 blur-3xl transition-opacity duration-700 group-hover:opacity-100"></div>

        <div className="relative z-10 mb-6 transform transition-transform duration-500 group-hover:-translate-y-2 group-hover:scale-110">
          <div className="drop-shadow-xl">
            <Image
              src={image}
              alt={alt}
              width={180}
              height={180}
              className="object-contain"
            />
          </div>
        </div>

        <h3 className="relative z-10 mb-4 text-xl font-black text-slate-800 transition-colors group-hover:text-blue-600">
          {title}
        </h3>

        <div className="relative z-10 mb-4 h-1 w-12 rounded-full bg-blue-100 transition-all duration-500 group-hover:w-24 group-hover:bg-blue-400"></div>

        <p className="relative z-10 line-clamp-4 text-justify text-sm font-medium leading-7 text-slate-500 transition-colors group-hover:text-slate-600">
          {description}
        </p>

        <div className="absolute -bottom-2 -left-2 h-12 w-12 scale-0 rounded-full bg-blue-50 opacity-0 transition-all duration-500 group-hover:scale-100 group-hover:opacity-100"></div>
      </div>
    </div>
  );
}

function FeaturesSection() {
  return (
    <section className="dir-rtl bg-slate-50/50 py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16 space-y-4 text-center">
          <h2 className="text-3xl font-black text-slate-800 md:text-4xl">
            امکانات و ویژگی‌ها
          </h2>

          <p className="text-slate-500">
            هر آنچه برای موفقیت در آزمون‌ها نیاز دارید، یکجا در اختیار شماست
          </p>
        </div>

        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>

        <div className="mt-20 flex translate-y-0 justify-center opacity-100 transition-all duration-1000">
          <Link
            href="/category"
            className="group relative overflow-hidden rounded-[20px] bg-blue-600 px-12 py-5 text-lg font-black text-white shadow-xl shadow-blue-200 transition-all hover:bg-blue-700 active:scale-95"
          >
            <span className="relative z-10 flex items-center gap-2">
              ورود به بانک سوالات هوشمند

              <svg
                className="h-5 w-5 transition-transform group-hover:-translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                ></path>
              </svg>
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <>
      <header className="dir-rtl relative overflow-hidden bg-[#f8fafc] py-16 md:py-24">
        <div className="absolute right-0 top-0 -mr-20 -mt-20 h-1/3 w-1/3 rounded-full bg-blue-100/50 blur-[120px]"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 h-1/4 w-1/4 rounded-full bg-yellow-100/50 blur-[100px]"></div>

        <div className="relative z-10 mx-auto max-w-7xl px-6">
          <div className="flex flex-col items-center justify-between gap-12 md:flex-row">
            <div className="w-full space-y-8 text-center md:w-1/2 md:text-right">
              <div className="space-y-4">
                <h1 className="max-w-xl text-4xl font-black leading-[1.5] text-slate-950 md:text-6xl">
                  بانک سوال{" "}
                  <span className="relative mr-3 inline-block text-blue-700">
                    دنتست
                    <span className="absolute -bottom-2 right-0 h-1 w-full rounded-full bg-blue-500"></span>
                  </span>
                </h1>

                <p className="mx-auto max-w-lg text-lg font-medium text-slate-500 md:mx-0 md:text-xl">
                  با دسترسی به بزرگ‌ترین مجموعه‌ی سوالات طبقه‌بندی شده، مسیر
                  موفقیت تحصیلی‌تان را هوشمندانه هموار کنید.
                </p>
              </div>

              <HomeStats />

              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row md:justify-start">
                <Link href="/category">
                  <span className="inline-flex justify-center rounded-2xl bg-blue-600 px-8 py-4 text-lg font-black text-white shadow-lg shadow-blue-200 transition-all hover:bg-blue-700 md:justify-start">
                    مشاهده دروس
                  </span>
                </Link>
              </div>
            </div>

            <div className="relative flex w-full justify-center md:w-1/2">
              <div className="absolute inset-0 scale-75 rounded-full bg-blue-600/5 blur-3xl"></div>

              <div className="relative">
                <Image
                  src="/images/math-header.png"
                  alt="هوشمندسازی آموزش"
                  width={500}
                  height={500}
                  priority
                  className="w-full max-w-[500px] drop-shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      <FeaturesSection />
    </>
  );
}
