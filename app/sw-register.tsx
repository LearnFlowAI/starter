// 负责在客户端启动时注册 service worker。
"use client";

import { useEffect } from "react";

export default function SwRegister() {
  useEffect(() => {
    // 首次挂载时注册 SW（仅在支持的浏览器）。
    if ("serviceWorker" in navigator) {
      // 忽略注册错误，避免影响页面加载。
      navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    }
  }, []);

  return null;
}
