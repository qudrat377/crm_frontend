"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthStore } from "@/store/auth.store";
import { getErrorMessage } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GraduationCap, Mail, Lock, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";

const schema = z.object({
  email: z.string().email("Noto'g'ri email"),
  password: z.string().min(6, "Kamida 6 ta belgi"),
});
type Form = z.infer<typeof schema>;

// Demo accounts for all roles
const DEMO_ACCOUNTS = [
  { role: "Admin",      email: "assomad377@gmail.com",     password: "qudrat777",     color: "bg-brand-50 text-brand-700 border-brand-200" },
  { role: "Menejer",   email: "assomad277@gmail.com",   password: "qudrat777",   color: "bg-success-50 text-success-700 border-success-200" },
  { role: "O'qituvchi",email: "assomad177@gmail.com",   password: "qudrat777",   color: "bg-purple-50 text-purple-700 border-purple-200" },
  { role: "Assistent", email: "assomad477@gmail.com", password: "qudrat777",    color: "bg-orange-50 text-orange-700 border-orange-200" },
  { role: "O'quvchi",  email: "assomad577@gmail.com",   password: "qudrat777",   color: "bg-cyan-50 text-cyan-700 border-cyan-200" },
];

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: Form) => {
    try {
      const redirectPath = await login(data.email, data.password);
      toast.success("Xush kelibsiz!");
      router.push(redirectPath);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const fillDemo = (email: string, password: string) => {
    setValue("email", email);
    setValue("password", password);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-50 via-white to-brand-50 flex items-center justify-center p-4">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-100/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-cyan-100/20 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="bg-white dark:bg-surface-900 rounded-3xl border border-surface-100 dark:border-surface-800 shadow-2xl overflow-hidden">
          {/* Top accent bar */}
          <div className="h-1 bg-gradient-to-r from-brand-500 via-purple-500 to-cyan-500" />

          <div className="p-8">
            {/* Logo */}
            <div className="text-center mb-8">
              <div className="w-14 h-14 bg-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-brand-200">
                <GraduationCap className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-50">EduCRM</h1>
              <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">Ta'lim markazi boshqaruv tizimi</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Email manzil"
                type="email"
                placeholder="email@educrm.uz"
                icon={<Mail className="w-4 h-4" />}
                error={errors.email?.message}
                {...register("email")}
              />
              <div className="relative">
                <Input
                  label="Parol"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  icon={<Lock className="w-4 h-4" />}
                  error={errors.password?.message}
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-[38px] text-surface-400 dark:text-surface-500 hover:text-surface-600 dark:text-surface-400 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <Button type="submit" className="w-full" size="lg" loading={isLoading}>
                Tizimga kirish
              </Button>
            </form>

            {/* Demo accounts */}
            <div className="mt-6 p-4 bg-surface-50 dark:bg-surface-900/50 rounded-2xl border border-surface-100 dark:border-surface-800">
              <p className="text-xs font-semibold text-surface-600 dark:text-surface-400 mb-3">Demo hisoblar — bosib to'ldiring:</p>
              <div className="grid grid-cols-1 xs:grid-cols-2 gap-2">
                {DEMO_ACCOUNTS.map((acc) => (
                  <button
                    key={acc.role}
                    type="button"
                    onClick={() => fillDemo(acc.email, acc.password)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-all hover:shadow-sm text-left ${acc.color}`}
                  >
                    <div className="w-2 h-2 rounded-full bg-current opacity-60 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="font-semibold truncate">{acc.role}</p>
                      <p className="opacity-70 truncate text-[10px]">{acc.email}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-surface-400 dark:text-surface-500 mt-4">
          Har bir rol uchun alohida panel ko'rsatiladi
        </p>
      </div>
    </div>
  );
}
