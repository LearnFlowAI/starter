import Link from "next/link";

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col justify-center overflow-hidden bg-[#FDFCF8] px-8">
      <div className="absolute -left-20 -top-20 h-80 w-80 rounded-full bg-yellow-200/40 blur-[80px]" />
      <div className="absolute -bottom-20 -right-20 h-80 w-80 rounded-full bg-primary/30 blur-[80px]" />

      <div className="relative z-10 w-full rounded-[2.5rem] border border-white bg-white/90 p-8 shadow-card backdrop-blur-xl">
        <div className="mb-10 flex flex-col items-center">
          <div className="relative mb-6 h-32 w-32">
            <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full border-4 border-white bg-gradient-to-tr from-yellow-100 to-white shadow-soft">
              <img
                alt="Mascot"
                className="h-full w-full object-cover"
                src="https://picsum.photos/seed/learnflow/200/200"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 rounded-full bg-white p-1.5 shadow-sm">
              <span className="material-icons-round text-secondary text-xl">
                waving_hand
              </span>
            </div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            欢迎来到 LearnFlow
          </h1>
          <p className="mt-2 text-sm font-medium text-gray-400">
            每天进步一点点
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex h-14 items-center rounded-2xl border border-transparent bg-gray-50 px-4">
            <span className="material-icons-round text-gray-400">
              smartphone
            </span>
            <div className="mx-3 h-5 w-px bg-gray-300" />
            <input
              className="w-full border-none bg-transparent p-0 text-sm focus:ring-0"
              placeholder="账号/手机号"
            />
          </div>
          <div className="flex h-14 items-center rounded-2xl border border-transparent bg-gray-50 px-4">
            <span className="material-icons-round text-gray-400">
              lock_open
            </span>
            <div className="mx-3 h-5 w-px bg-gray-300" />
            <input
              className="w-full border-none bg-transparent p-0 text-sm focus:ring-0"
              type="password"
              placeholder="密码"
            />
          </div>
          <Link
            href="/dashboard"
            className="mt-4 flex h-14 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-lime-500 to-emerald-500 text-lg font-bold text-white shadow-lg shadow-lime-500/30"
          >
            立即登录
            <span className="material-icons-round text-sm">arrow_forward</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
