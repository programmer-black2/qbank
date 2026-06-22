import Link from "next/link";

const quickLinks = [
  { label: "لیست آزمون‌ها", href: "/category" },
  { label: "بانک سوالات", href: "/category" },
  { label: "پنل کاربری دانش‌آموز", href: "/profile" },
  { label: "درباره ما", href: "#" },
];

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="relative mb-7 inline-block text-lg font-bold text-gray-800">
      {children}
      <span className="absolute -bottom-2 right-0 h-1 w-1/2 rounded-full bg-blue-500"></span>
    </h3>
  );
}

function MailIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2m0 4-8 5-8-5V6l8 5 8-5z" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="m17.38 10.79-2.2-2.2c-.28-.28-.36-.67-.25-1.02.37-1.12.57-2.32.57-3.57 0-.55.45-1 1-1H20c.55 0 1 .45 1 1 0 9.39-7.61 17-17 17-.55 0-1-.45-1-1v-3.49c0-.55.45-1 1-1 1.24 0 2.45-.2 3.57-.57.35-.12.75-.03 1.02.24l2.2 2.2c2.83-1.45 5.15-3.76 6.59-6.59" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5A1.25 1.25 0 1 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10m0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6" />
    </svg>
  );
}

function TelegramIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M9.78 18.65 10.06 14.42 17.74 7.5c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42" />
    </svg>
  );
}

function VerifiedIcon() {
  return (
    <svg className="h-7 w-7 text-gray-300 transition-colors group-hover:text-blue-500" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 1 3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5zm-2 16-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9z" />
    </svg>
  );
}

function BrandColumn() {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <div className="h-8 w-2 rounded-full bg-yellow-400"></div>
        <h3 className="text-2xl font-black text-gray-800">
          بانک سوال دنتست
        </h3>
      </div>
      <p className="pl-4 text-justify text-sm leading-8 text-gray-500">
        دسترسی سریع و آسان به هزاران نمونه سوال امتحانی و آزمون‌های آزمایشی.
        ما به شما کمک می‌کنیم تا با برنامه‌ریزی هوشمندانه، بهترین نتایج را در
        تحصیل خود کسب کنید.
      </p>
    </div>
  );
}

function QuickLinksColumn() {
  return (
    <div>
      <SectionTitle>دسترسی سریع</SectionTitle>
      <ul className="space-y-4">
        {quickLinks.map((item) => (
          <li key={item.label}>
            <Link
              href={item.href}
              className="text-sm text-gray-600 transition-all duration-300 ease-in-out hover:pr-2 hover:text-blue-600"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ContactItem({
  icon,
  children,
  tone,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
  tone: "blue" | "green";
}) {
  const toneClasses = {
    blue: "bg-blue-50 group-hover:bg-blue-500",
    green: "bg-green-50 group-hover:bg-green-500",
  };

  return (
    <div className="group flex items-center gap-3 rounded-lg p-2 transition-all duration-300 hover:bg-white hover:shadow-sm">
      <div className={`rounded-md p-2 transition-colors group-hover:text-white ${toneClasses[tone]}`}>
        {icon}
      </div>
      <span className="text-sm text-gray-600">{children}</span>
    </div>
  );
}

function SocialLink({
  href,
  label,
  children,
  variant,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
  variant: "instagram" | "telegram";
}) {
  const hoverClasses = {
    instagram: "hover:border-pink-600 hover:bg-pink-600",
    telegram: "hover:border-blue-400 hover:bg-blue-400",
  };

  return (
    <Link
      href={href}
      aria-label={label}
      className={`flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-400 shadow-sm transition-all duration-500 hover:text-white ${hoverClasses[variant]}`}
    >
      {children}
    </Link>
  );
}

function ContactColumn() {
  return (
    <div>
      <SectionTitle>ارتباط با ما</SectionTitle>
      <div className="space-y-4">
        <ContactItem icon={<MailIcon />} tone="blue">
          info@smartbank.ir
        </ContactItem>
        <ContactItem icon={<PhoneIcon />} tone="green">
          <span className="ltr tracking-wider">021-91000000</span>
        </ContactItem>
        <div className="flex gap-3 pt-2">
          <SocialLink href="#" label="اینستاگرام" variant="instagram">
            <InstagramIcon />
          </SocialLink>
          <SocialLink href="#" label="تلگرام" variant="telegram">
            <TelegramIcon />
          </SocialLink>
        </div>
      </div>
    </div>
  );
}

function LegalBadge({ label }: { label: string }) {
  return (
    <div className="group relative flex h-28 w-24 cursor-pointer flex-col items-center justify-center rounded-2xl border border-gray-100 bg-white p-2 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-blue-100 hover:shadow-xl">
      <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 transition-colors group-hover:bg-blue-50">
        <VerifiedIcon />
      </div>
      <span className="text-[10px] font-bold text-gray-400 group-hover:text-blue-600">
        {label}
      </span>
    </div>
  );
}

function LegalColumn() {
  return (
    <div className="flex flex-col items-start lg:items-center">
      <h3 className="mb-7 text-lg font-bold text-gray-800">
        مجوزهای قانونی
      </h3>
      <div className="grid grid-cols-2 gap-4">
        <LegalBadge label="اینماد" />
        <LegalBadge label="ساماندهی" />
      </div>
    </div>
  );
}

export default function SiteFooter() {
  return (
    <footer className="border-t border-gray-200 bg-[#fcfcfc] pb-6 pt-16" dir="rtl">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          <BrandColumn />
          <QuickLinksColumn />
          <ContactColumn />
          <LegalColumn />
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-gray-100 pt-6 md:flex-row">
          <p className="text-[11px] text-gray-400 md:text-xs">
            © 1405 تمامی حقوق مادی و معنوی این پلتفرم برای{" "}
            <span className="font-bold text-gray-700 underline decoration-yellow-400 decoration-2">
              بانک سوال دنتست
            </span>{" "}
            محفوظ است.
          </p>
          <div className="flex items-center gap-4">
            <div className="hidden h-1 w-20 rounded-full bg-gradient-to-l from-transparent to-blue-500 md:block"></div>
            <span className="text-[10px] uppercase tracking-widest text-gray-300">
              Designed with AP
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
