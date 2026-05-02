import Input from "../ui/Input";
import Button from "../ui/Button";

export default function LoginForm() {
  return (
    <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg">
      <h2 className="text-xl font-bold text-center mb-6">
        ثبت‌نام دانش‌آموز
      </h2>

      <div className="space-y-4">
        <Input label="نام و نام‌خانوادگی" placeholder="مثلا: علی محمدی" />
        <Input label="ایمیل" placeholder="mail@site.com" />
        <Input label="نام مستعار (ID)" placeholder="ali_A7" />
        <Input label="رمز عبور" placeholder="حداقل ۶ کاراکتر" type="password" />
      </div>

      <Button className="mt-6 w-full">
        ساخت حساب کاربری و شروع آزمون
      </Button>

      <p className="text-sm text-center mt-4 text-blue-500 cursor-pointer">
        ورود به حساب
      </p>
    </div>
  );
}