import { createNavigation } from "next-intl/navigation";

export const locales = ["en", "zh-TW"] as const;

export const { Link, redirect, usePathname, useRouter } = createNavigation({
  locales,
  localePrefix: "always",
});

