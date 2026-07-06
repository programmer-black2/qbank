"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  requestStudentRegisterOTP,
  verifyStudentRegisterOTP,
} from "@/services/auth/auth.api";

const toEnglishDigits = (value: string) =>
  value.replace(/[۰-۹٠-٩]/g, (digit) =>
    String("۰۱۲۳۴۵۶۷۸۹٠١٢٣٤٥٦٧٨٩".indexOf(digit) % 10)
  );

const normalizePhone = (value: string) => toEnglishDigits(value).trim();
const isValidPhone = (value: string) => /^09\d{9}$/.test(value);
const getDeviceName = () => navigator.userAgent.slice(0, 220);
const OTP_LENGTH = 8;
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function EyeIcon({ open }: { open: boolean }) {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      {open ? (
        <>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12s3.5-6.75 9.75-6.75S21.75 12 21.75 12 18.25 18.75 12 18.75 2.25 12 2.25 12Z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
        </>
      ) : (
        <>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.22A18.2 18.2 0 0 0 2.25 12s3.5 6.75 9.75 6.75c1.62 0 3.06-.45 4.3-1.08" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.23 6.23A9.7 9.7 0 0 1 12 5.25c6.25 0 9.75 6.75 9.75 6.75a17.6 17.6 0 0 1-2.87 3.88" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.88 9.88A3 3 0 0 1 14.12 14.12M4.5 4.5l15 15" />
        </>
      )}
    </svg>
  );
}

const getErrorMessage = (error: unknown) => {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof error.response === "object" &&
    error.response !== null &&
    "data" in error.response
  ) {
    const data = error.response.data;
    if (typeof data === "string") return data;
    if (typeof data === "object" && data !== null) {
      const firstValue = Object.values(data)[0];
      if (Array.isArray(firstValue)) return String(firstValue[0]);
      if (typeof firstValue === "string") return firstValue;
    }
  }

  return "درخواست انجام نشد. لطفا دوباره تلاش کنید.";
};

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<"form" | "otp">("form");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [otpStatus, setOtpStatus] = useState<"idle" | "success" | "error">("idle");
  const otpInputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    password: "",
    confirm_password: "",
    otp: "",
  });

  const inputShellClass =
    "flex min-h-12 items-center gap-3 rounded-lg border border-blue-100 bg-white/95 px-4 shadow-[0_8px_22px_rgba(29,78,216,0.08)] transition-all focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10";
  const inputClass =
    "w-full bg-transparent py-3 text-right text-sm font-medium text-slate-800 outline-none placeholder:text-slate-400";

  const updateField = (name: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
    if (name === "otp") setOtpStatus("idle");
  };

  const setOtpCode = (value: string) => {
    const digits = toEnglishDigits(value).replace(/\D/g, "").slice(0, OTP_LENGTH);
    updateField("otp", digits);
    return digits;
  };

  const handleOtpChange = (index: number, value: string) => {
    const digits = toEnglishDigits(value).replace(/\D/g, "");
    if (!digits) {
      const nextCode = form.otp.padEnd(OTP_LENGTH, " ").split("");
      nextCode[index] = " ";
      updateField("otp", nextCode.join("").replace(/\s/g, ""));
      return;
    }

    const nextCode = form.otp.padEnd(OTP_LENGTH, " ").split("");
    digits
      .slice(0, OTP_LENGTH - index)
      .split("")
      .forEach((digit, offset) => {
        nextCode[index + offset] = digit;
      });

    const normalizedCode = setOtpCode(nextCode.join("").replace(/\s/g, ""));
    const nextIndex = Math.min(index + digits.length, OTP_LENGTH - 1);
    if (normalizedCode.length < OTP_LENGTH) {
      otpInputRefs.current[nextIndex]?.focus();
      otpInputRefs.current[nextIndex]?.select();
    } else if (!loading && otpStatus === "idle") {
      setTimeout(() => void verifyOTP(normalizedCode), 0);
    }
  };

  const handleOtpKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace" && !form.otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
      otpInputRefs.current[index - 1]?.select();
    }
  };

  const handleOtpPaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const digits = setOtpCode(event.clipboardData.getData("text"));
    const focusIndex = Math.min(digits.length, OTP_LENGTH - 1);
    otpInputRefs.current[focusIndex]?.focus();
    otpInputRefs.current[focusIndex]?.select();
    if (digits.length === OTP_LENGTH && !loading && otpStatus === "idle") {
      setTimeout(() => void verifyOTP(digits), 0);
    }
  };

  const validateRegisterForm = () => {
    const phone = normalizePhone(form.phone);

    if (!form.full_name.trim()) return "نام و نام خانوادگی الزامی است.";
    if (!phone) return "شماره موبایل الزامی است.";
    if (!isValidPhone(phone)) return "شماره موبایل باید با 09 شروع شود و 11 رقم باشد.";
    if (!form.password) return "رمز عبور الزامی است.";
    if (form.password.length < 8) return "رمز عبور باید حداقل 8 کاراکتر باشد.";
    if (!form.confirm_password) return "تکرار رمز عبور الزامی است.";
    if (form.password !== form.confirm_password) return "رمز عبور و تکرار آن یکسان نیستند.";

    return "";
  };

  const handleRequestOTP = async (event: React.FormEvent) => {
    event.preventDefault();
    const validationError = validateRegisterForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      const phone = normalizePhone(form.phone);
      await requestStudentRegisterOTP({
        full_name: form.full_name.trim(),
        phone,
        password: form.password,
      });
      setForm((prev) => ({ ...prev, phone, otp: "" }));
      setOtpStatus("idle");
      setStep("otp");
      requestAnimationFrame(() => otpInputRefs.current[0]?.focus());
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = useCallback(async (otpValue = form.otp) => {
    const code = toEnglishDigits(otpValue).trim();

    if (code.length !== OTP_LENGTH) {
      setError("کد تایید باید 8 رقم باشد.");
      setOtpStatus("error");
      return;
    }

    try {
      setLoading(true);
      setOtpStatus("idle");
      const response = await verifyStudentRegisterOTP({
        phone: normalizePhone(form.phone),
        code,
        device_name: getDeviceName(),
      });

      localStorage.setItem("access", response.access);
      localStorage.setItem("refresh", response.refresh);
      localStorage.setItem("user", JSON.stringify(response.user));
      window.dispatchEvent(new Event("auth-changed"));
      setOtpStatus("success");
      await wait(1000);
      router.push("/");
    } catch (err) {
      setOtpStatus("error");
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [form.otp, form.phone, router]);

  const handleVerifyOTP = (event: React.FormEvent) => {
    event.preventDefault();
    void verifyOTP();
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,#d8ecff_0,#f7fbff_42%,#eaf5ff_100%)] px-3 py-0 text-slate-950 before:absolute before:inset-x-0 before:bottom-0 before:h-56 before:rounded-t-[55%] before:bg-blue-100/55 sm:px-6" dir="rtl">
      <main className="relative z-10 mx-auto flex min-h-screen w-full max-w-[500px] items-center">
        <div className="w-full overflow-hidden border border-white/80 bg-white/90 shadow-[0_34px_100px_rgba(30,64,175,0.18)] backdrop-blur-sm sm:rounded-[30px]">
          <Image
            src="/images/register-auth-hero.png"
            alt="ثبت نام در بانک سوال پزشکی"
            width={720}
            height={420}
            priority
            className="block h-[420px] w-full object-cover object-top sm:h-[520px]"
          />

          <div className="rounded-t-[34px] bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,#eef7ff_100%)] px-7 pb-8 pt-8 shadow-[0_-10px_34px_rgba(219,234,254,0.55)] sm:px-12 sm:pb-10">

            {error && (
              <div className="mb-5 rounded-xl border border-red-100 bg-red-50/95 px-4 py-3 text-sm font-bold text-red-700 shadow-sm">
                {error}
              </div>
            )}

            {step === "form" ? (
              <form onSubmit={handleRequestOTP} className="space-y-4">
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-xs font-bold text-slate-600">نام و نام خانوادگی</label>
                  <div className={inputShellClass}>
                    <input
                      type="text"
                      value={form.full_name}
                      onChange={(event) => updateField("full_name", event.target.value)}
                      placeholder="مثلا: علی محمدی"
                      className={inputClass}
                      autoComplete="name"
                      required
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-2 block text-xs font-bold text-slate-600">شماره موبایل</label>
                  <div className={inputShellClass}>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(event) => updateField("phone", event.target.value)}
                      placeholder="09123456789"
                      className={`${inputClass} text-left ltr`}
                      autoComplete="tel"
                      inputMode="numeric"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold text-slate-600">رمز عبور</label>
                  <div className={inputShellClass}>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={(event) => updateField("password", event.target.value)}
                      placeholder="حداقل 8 کاراکتر"
                      className={`${inputClass} text-left ltr`}
                      autoComplete="new-password"
                      required
                    />
                    <button
                      type="button"
                      aria-label={showPassword ? "مخفی کردن رمز عبور" : "نمایش رمز عبور"}
                      onClick={() => setShowPassword((value) => !value)}
                      className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-slate-500 transition-colors hover:bg-slate-100 hover:text-blue-600"
                    >
                      <EyeIcon open={showPassword} />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold text-slate-600">تکرار رمز عبور</label>
                  <div className={inputShellClass}>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={form.confirm_password}
                      onChange={(event) => updateField("confirm_password", event.target.value)}
                      placeholder="تکرار رمز عبور"
                      className={`${inputClass} text-left ltr`}
                      autoComplete="new-password"
                      required
                    />
                    <button
                      type="button"
                      aria-label={showPassword ? "مخفی کردن رمز عبور" : "نمایش رمز عبور"}
                      onClick={() => setShowPassword((value) => !value)}
                      className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-slate-500 transition-colors hover:bg-slate-100 hover:text-blue-600"
                    >
                      <EyeIcon open={showPassword} />
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 h-14 w-full rounded-lg bg-[#154a91] text-base font-black text-white shadow-[0_16px_34px_rgba(21,74,145,0.24)] transition-all hover:-translate-y-0.5 hover:bg-[#0f3f7e] disabled:cursor-not-allowed disabled:opacity-60 sm:col-span-2"
                >
                  {loading ? "در حال ارسال کد..." : "دریافت کد تایید"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOTP} className="space-y-5">
                <div>
                  <label className="mb-3 block text-xs font-bold text-slate-600">کد تایید</label>
                  <div dir="ltr" className="flex justify-center gap-2 sm:gap-3">
                    {Array.from({ length: OTP_LENGTH }).map((_, index) => (
                      <input
                        key={index}
                        ref={(element) => {
                          otpInputRefs.current[index] = element;
                        }}
                        type="text"
                        value={form.otp[index] ?? ""}
                        onChange={(event) => handleOtpChange(index, event.target.value)}
                        onKeyDown={(event) => handleOtpKeyDown(index, event)}
                        onPaste={handleOtpPaste}
                        aria-label={`OTP digit ${index + 1}`}
                        style={{ fontFamily: "var(--font-vazir), system-ui, sans-serif" }}
                        className={`h-12 w-10 rounded-xl border-2 bg-white text-center text-lg font-black text-slate-900 shadow-[0_8px_20px_rgba(29,78,216,0.08)] outline-none transition-all duration-200 sm:h-14 sm:w-12 sm:text-xl ${otpStatus === "success"
                            ? "border-emerald-500 text-emerald-600 ring-4 ring-emerald-500/10"
                            : otpStatus === "error"
                              ? "border-red-500 text-red-600 ring-4 ring-red-500/10 animate-shake"
                              : "border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                          } ${loading || otpStatus === "success" ? "opacity-60" : "hover:border-slate-300"}`}
                        autoComplete={index === 0 ? "one-time-code" : "off"}
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={index === 0 ? OTP_LENGTH : 1}
                        disabled={loading || otpStatus === "success"}
                        required
                      />
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setStep("form")}
                  className="h-12 w-full rounded-lg border border-blue-100 bg-white/75 text-sm font-black text-slate-700 transition-colors hover:bg-white"
                >
                  ویرایش اطلاعات
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
