import Header from '@/components/header/header';

export default function Home() {
  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          بانک سوال پزشکی
        </h1>
        <p className="text-gray-600 leading-relaxed">
          به بانک سوال پزشکی خوش آمدید. این سیستم جامعی برای مدیریت و دسترسی به سوالات پزشکی طراحی شده است.
        </p>
      </div>
    </>
  );
}
