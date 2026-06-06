'use client';

import { Accordion, AccordionItem, Link } from "@nextui-org/react";
import { usePathname } from "next/navigation";

interface AccordionDropdownProps {
    label: string;
    items: { href: string; label: string, isExternal?: boolean }[];
    onClick?: () => void;
}

export const AccordionDropdown: React.FC<AccordionDropdownProps> = ({ label, items, onClick }) => {
    const pathname = usePathname();

    return (
        <Accordion
            itemClasses={
                {
                    base: 'p-0 m-0 px-0',
                    trigger: 'p-0 m-0',
                    content: 'flex flex-col px-3',
                }
            }
            defaultExpandedKeys={items.filter(item => item.href === pathname).map(item => label)}
        >
            <AccordionItem
                title={label}
                key={label}
            >
                {items.map((item, index) => (
                    <Link
                        key={`${item}-${index}`}
                        color={pathname === item.href ? "primary" : "foreground"}
                        href={item.href}
                        size="lg"
                        onClick={onClick}
                        isExternal={item.isExternal}
                    >
                        {item.label}
                    </Link>
                ))}
            </AccordionItem>
        </Accordion>
    );
};