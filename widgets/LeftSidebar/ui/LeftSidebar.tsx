"use client"

import { useState } from "react"
import { SidebarSection } from "@/components/SidebarSection"
import { Calendar1, House, Notebook, PictureInPicture2, Menu, Hourglass, Music } from "lucide-react"
import Image from "next/image"

export default function LeftSidebar() {
    const [open, setOpen] = useState(false)

    const appsList = [
        { link: "notes", app: "Заметки", icon: <Image src={"/images/note.png"} alt={"Note"} width={1920} height={1080} className="w-10 h-10"/>},
        { link: "tasks", app: "Задачи", icon: <Image src={"/images/bow.png"} alt={"Bow"} width={1920} height={1080} className="w-10 h-10"/>},
        { link: "calendar", app: "Календарь", icon: <Image src={"/images/cat.png"} alt={"Cat"} width={1920} height={1080} className="w-10 h-10"/>},
        { link: "timer", app: "Таймер", icon: <Image src={"/images/candle.png"} alt={"Candle"} width={1920} height={1080} className="w-10 h-10"/>},
        { link: "music", app: "Музыка", icon: <Image src={"/images/disk.png"} alt={"Disk"} width={1920} height={1080} className="w-10 h-10"/>},
    ]
    
    const homeList = [
        { link: "/", app: "Панель",  icon: <Image src={"/images/rose.png"} alt={"Note"} width={1920} height={1080} className="w-10 h-10"/>}
    ]

    return (
        <>
            {/* Кнопка открытия меню только на мобильных */}
            <button
                className="fixed top-4 left-4 z-50 md:hidden bg-white rounded-full p-2 shadow-md"
                onClick={() => setOpen(true)}
                aria-label="Открыть меню"
            >
                <Menu size={28} />
            </button>
            {/* Затемнение фона при открытом меню */}
            <div
                className={`fixed inset-0 backdrop-blur-md bg-opacity-30 z-40 transition-opacity duration-300 md:hidden ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
                onClick={() => setOpen(false)}
            />
            {/* Сайдбар */}
            <aside
                className={`
                    fixed top-0 left-0 h-full z-50
                    bg-white rounded-r-2xl p-4 space-y-3
                    w-[80vw] max-w-[300px]
                    shadow-lg
                    transition-transform duration-300
                    ${open ? "translate-x-0" : "-translate-x-full"}
                    md:static md:translate-x-0 md:w-[300px] md:rounded-2xl md:shadow-none
                `}
            >
                {/* Кнопка закрытия на мобилке */}
                <div className="flex justify-end md:hidden">
                    <button
                        className="mb-2 p-1 rounded hover:bg-gray-100"
                        onClick={() => setOpen(false)}
                        aria-label="Закрыть меню"
                    >
                        <span className="text-2xl">&times;</span>
                    </button>
                </div>
                {/* Заголовок */}
                <div className="flex items-end gap-3 py-4">
                    <div className="w-12 h-12"> 
                        <Image src="/images/logo.png" width={48} height={48} alt="Logo" className="object-contain w-full h-full" />
                    </div>
                    <h1 className="font-bold text-2xl text-black-500">Dental Study Assitant</h1>
                </div>
                {/* Главная/home */}
                <SidebarSection title="Главная" items={homeList} />
                <SidebarSection title="Приложения" items={appsList} />
            </aside>
        </>
    )
}