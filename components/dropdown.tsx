import { Link } from "@nextui-org/react"; import clsx from "clsx";
import { link as linkStyles } from "@nextui-org/theme";

import { Tooltip } from "@nextui-org/react";
import { FaChevronDown } from "react-icons/fa";

export const itemsDropdown = (label: string, items: { href: string, label: string, isExternal?: boolean }[], href?: string) => (
    <Tooltip
        content={
            <div className="flex flex-col gap-2 p-2 m-0">
                {items.map((item) => (
                    <Link
                        key={item.href}
                        className={clsx(
                            linkStyles({ color: "foreground" }),
                            "data-[active=true]:text-primary data-[active=true]:font-medium w-full hover:text-foreground hover:font-medium"
                        )}
                        color="foreground"
                        href={item.href}
                        isExternal={item.isExternal}
                    >
                        {item.label}
                    </Link>
                ))}
            </div>
        }
        placement="bottom-start"
        showArrow
    >
        <Link
            className={clsx(
                linkStyles({ color: "foreground" }),
                "data-[active=true]:text-primary data-[active=true]:font-medium"
            )}
            color="foreground"
            href={href || items[0].href}
        >
            {label}
            < FaChevronDown className="pl-2 text-default-400" />
        </Link>
    </Tooltip >
);