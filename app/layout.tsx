import "./globals.css"
import LeftSidebar from "@/widgets/LeftSidebar/ui/LeftSidebar";
import type { Metadata } from "next";
import { ToastContainer } from 'react-toastify';

export const metadata: Metadata = {
  title: "Планировщик задач",
  description: "Планировщик задач для моей любимой девушки",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-white min-h-screen">
        {/* Внешний контейнер с отступами и ограничением ширины */}
        <div className="min-h-screen w-full p-3 box-border">
          {/* Адаптивная сетка: сайдбар скрыт на мобилке, main занимает всю ширину */}
          <div className="h-screen w-full grid md:grid-cols-[300px_1fr] grid-cols-1 gap-4 overflow-hidden relative max-w-full">
            <div className="hidden md:block">
              <LeftSidebar />
            </div>
            <main className="overflow-auto p-4 sm:p-6 bg-pink-50 rounded-2xl w-full">
              {/* Мобильный сайдбар поверх main */}
              <div className="block md:hidden">
                <LeftSidebar />
              </div>
              {children}
            </main>
          </div>
        </div>
        <ToastContainer />
      </body>
    </html>
  );
}
