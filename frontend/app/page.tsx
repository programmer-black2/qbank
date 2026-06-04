import Image from 'next/image';

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
    <div className="p-4 h-full" style={{ perspective: "1000px" }}>
      <div
        className="group relative h-full min-h-[280px] bg-white/70 backdrop-blur-lg border border-slate-100 rounded-[35px] shadow-sm hover:shadow-2xl hover:shadow-blue-100/50 transition-all duration-500 ease-out p-8 flex flex-col items-center text-center overflow-hidden"
        style={{
          transformStyle: "preserve-3d",
          transform: "translate(0px, 0px) rotateX(0deg) rotateY(0deg)",
        }}
      >
        <div className="absolute -inset-24 bg-gradient-to-br from-blue-50/40 to-transparent rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

        <div className="relative z-10 mb-6 transform transition-transform duration-500 group-hover:scale-110 group-hover:-translate-y-2">
          <div className="drop-shadow-xl">
            <Image
              src={image}
              alt={alt}
              loading="lazy"
              width={180}
              height={180}
              className="object-contain"
              style={{ color: "transparent" }}
            />
          </div>
        </div>

        <h3 className="relative z-10 text-xl font-black text-slate-800 mb-4 group-hover:text-blue-600 transition-colors">
          {title}
        </h3>

        <div className="relative z-10 w-12 h-1 bg-blue-100 rounded-full mb-4 group-hover:w-24 group-hover:bg-blue-400 transition-all duration-500"></div>

        <p className="relative z-10 text-slate-500 text-sm leading-7 font-medium text-justify line-clamp-4 group-hover:text-slate-600 transition-colors">
          {description}
        </p>

        <div className="absolute -bottom-2 -left-2 w-12 h-12 bg-blue-50 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 scale-0 group-hover:scale-100"></div>
      </div>
    </div>
  );
}

function FeaturesSection() {
  return (
    <section className="py-20 bg-slate-50/50 dir-rtl">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl md:text-4xl font-black text-slate-800">
            امکانات و ویژگی‌ها
          </h2>

          <p className="text-slate-500">
            هر آنچه برای موفقیت در آزمون‌ها نیاز دارید، یکجا در اختیار شماست
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {features.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>

        <div className="mt-20 flex justify-center transition-all duration-1000 transform translate-y-0 opacity-100">
          <button className="group relative overflow-hidden bg-blue-600 hover:bg-blue-700 text-white px-12 py-5 rounded-[20px] text-lg font-black transition-all shadow-xl shadow-blue-200 active:scale-95">
            <a href="/category">
              <span className="relative z-10 flex items-center gap-2">
                ورود به بانک سوالات هوشمند

                <svg
                  className="w-5 h-5 group-hover:-translate-x-1 transition-transform"
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
            </a>
          </button>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <>
      <header className="relative overflow-hidden bg-[#f8fafc] py-16 md:py-24 dir-rtl">

        {/* Background */}
        <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-blue-100/50 blur-[120px] rounded-full -mr-20 -mt-20"></div>

        <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-yellow-100/50 blur-[100px] rounded-full -ml-20 -mb-20"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">

          <div className="flex flex-col md:flex-row items-center justify-between gap-12">

            {/* Content */}
            <div className="w-full md:w-1/2 space-y-8 text-center md:text-right">

              <div className="space-y-4">

                <h1 className="max-w-xl text-4xl font-black leading-[1.5] text-slate-950 md:text-6xl">
                  بانک سوال{" "}

                  <span className="relative inline-block mr-3 text-blue-700">
                    دنتست

                    <span className="absolute -bottom-2 right-0 h-1 w-full rounded-full bg-blue-500"></span>
                  </span>
                </h1>

                <p className="text-lg md:text-xl text-slate-500 font-medium max-w-lg mx-auto md:mx-0">
                  با دسترسی به بزرگ‌ترین مجموعه‌ی سوالات طبقه‌بندی شده،
                  مسیر موفقیت تحصیلی‌تان را هوشمندانه هموار کنید.
                </p>

              </div>

              {/* Stats */}
              <div className="bg-white/70 backdrop-blur-md border border-white rounded-[32px] p-6 shadow-xl shadow-blue-900/5 space-y-4 max-w-md mx-auto md:mx-0">

                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-600">
                    کاربران فعال
                  </span>

                  <span className="text-blue-700 font-black">
                    ۳۲۰ هزار نفر
                  </span>
                </div>

                <div className="h-px bg-slate-100"></div>

                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-600">
                    آزمون‌های برگزار شده
                  </span>

                  <span className="text-blue-700 font-black">
                    ۳۲۰ هزار
                  </span>
                </div>

                <div className="h-px bg-slate-100"></div>

                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-600">
                    مجموع سوالات
                  </span>

                  <span className="text-blue-700 font-black">
                    ۴۷۰ هزار سوال
                  </span>
                </div>

              </div>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start">

                <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-black text-lg transition-all shadow-lg shadow-blue-200">
                  شروع آزمون رایگان
                </button>

                <a href="/category">
                  <button className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-8 py-4 rounded-2xl font-bold text-lg transition-all">
                    مشاهده دروس
                  </button>
                </a>

              </div>

            </div>

            {/* Image */}
            <div className="w-full md:w-1/2 flex justify-center relative">

              <div className="absolute inset-0 bg-blue-600/5 rounded-full blur-3xl scale-75"></div>

              <div className="relative">

                <img
                  src="/images/math-header.png"
                  alt="هوشمند سازی آموزش"
                  className="drop-shadow-2xl w-full max-w-[500px]"
                />

                {/* <div className="absolute -top-4 -right-4 bg-white p-4 rounded-2xl shadow-xl">
                  🚀
                </div>

                <div className="absolute -bottom-4 -left-4 bg-white p-4 rounded-2xl shadow-xl">
                  🎯
                </div> */}

              </div>

            </div>

          </div>

        </div>

      </header>
      <FeaturesSection />
    </>
  );
}
