import { NextIntlClientProvider } from "next-intl";
import messages from "../../../messages/zh-TW.json";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-TW">
      <body>
        <NextIntlClientProvider locale="zh-TW" messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
