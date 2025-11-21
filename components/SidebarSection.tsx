import Link from 'next/link';

interface Item {
  link: string;
  icon: React.ReactNode;
  app: string;
}

interface SidebarSectionProps {
  title: string;
  items: Item[];
}

export function SidebarSection({ title, items }: SidebarSectionProps) {
  return (
    <div className='flex flex-col'>
      <span className="text-sm font-semibolduppercase tracking-wider px-3 py-3">
        {title}
      </span>
      <ul>
        {items.map((item, index) => (
          <li key={index}>
            <Link
              href={item.link}
              className="flex items-center space-x-3 px-3 py-3 hover:bg-gray-100 font-semibold rounded-2xl transition"
            >
              <span className='object-contain'>{item.icon}</span>
              <span>{item.app}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}