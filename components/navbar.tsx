"use client";

import {
  Navbar as NextUINavbar,
  NavbarContent,
  NavbarMenu,
  NavbarMenuToggle,
  NavbarBrand,
  NavbarItem,
  NavbarMenuItem,
} from "@nextui-org/navbar";

import { Link } from "@nextui-org/link";

import { siteConfig } from "@/config/site";

import NextLink from "next/link";

import { usePathname } from "next/navigation";

import { AccordionDropdown } from "./accordion";

import { itemsDropdown } from "./dropdown";

import { useDisclosure } from "@nextui-org/react";

export const Navbar = () => {
  const pathname = usePathname();

  const { isOpen, onClose, onOpenChange } = useDisclosure();

  const handleNavbarToggle = () => {
    if (isOpen) {
      onClose();
    } else {
      onOpenChange();
    }
  };

  return (
    <>
      {/* ================= NAVBAR ================= */}
      <NextUINavbar
        isMenuOpen={isOpen}
        onMenuOpenChange={onOpenChange}
        maxWidth="xl"
        position="sticky"
        className="h-20 bg-white px-0 shadow-sm"
      >
        {/* LEFT SIDE */}
        <NavbarContent
          className="basis-1/5 sm:basis-full h-full"
          justify="start"
        >
          {/* LOGO + TITLE */}
          <NavbarBrand as="li" className="max-w-fit">
            <NextLink
              className="flex justify-start items-center gap-3"
              href="/"
            >
              {/* LOGO */}
              <div
                style={{
                  width: 58,
                  height: 58,
                  flexShrink: 0,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/logo/blue-main.svg"
                  alt="Logo"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    display: "block",
                  }}
                />
              </div>

              {/* FESTIVE TITLE */}
              <div
                className="
                  hidden
                  sm:flex
                  flex-col
                  leading-none
                  select-none
                "
              >
                <span
                  className="
                    text-[16px]
                    md:text-[20px]
                    font-extrabold
                    tracking-tight
                    bg-gradient-to-r
                    from-cyan-600
                    via-emerald-500
                    to-teal-700
                    bg-clip-text
                    text-transparent
                    drop-shadow-sm
                  "
                >
                  CONSTRUCT
                </span>

                <span
                  className="
                    text-[16px]
                    md:text-[20px]
                    font-extrabold
                    tracking-tight
                    bg-gradient-to-r
                    from-orange-500
                    via-pink-500
                    to-purple-600
                    bg-clip-text
                    text-transparent
                    drop-shadow-sm
                    mt-0.5
                  "
                >
                  CARNIVAL 2.0
                </span>
              </div>
            </NextLink>
          </NavbarBrand>

          {/* DESKTOP MENU */}
          <div
            className="
              hidden
              lg:flex
              items-center
              justify-evenly
              w-full
              h-12
              rounded-full
              ml-5
              px-3
              shadow-md
            "
            style={{
              backgroundColor: "#085041",
            }}
          >
            {siteConfig.navItems.map((item) => (
              <NavbarItem key={item.href}>
                {item.submenu ? (
                  itemsDropdown(
                    item.label,
                    item.submenuItems || [],
                    item.href
                  )
                ) : (
                  <NextLink href={item.href}>
                    <div
                      className="
                        hover:scale-105
                      "
                      style={{
                        padding: "5px 12px",
                        borderRadius: "9999px",
                        fontSize: "13px",
                        fontWeight: pathname === item.href ? 600 : 500,
                        color:
                          pathname === item.href
                            ? "#085041"
                            : "#ffffff",
                        backgroundColor:
                          pathname === item.href
                            ? "#ffffff"
                            : "transparent",
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                        transition: "all 0.25s ease",
                        opacity: pathname === item.href ? 1 : 0.92,
                        transform:
                          pathname === item.href
                            ? "scale(1)"
                            : "scale(0.98)",
                      }}
                    >
                      {item.label}
                    </div>
                  </NextLink>
                )}
              </NavbarItem>
            ))}
          </div>
        </NavbarContent>

        {/* MOBILE MENU BUTTON */}
        <NavbarContent className="lg:hidden basis-1 pl-4" justify="end">
          <NavbarMenuToggle />
        </NavbarContent>

        {/* MOBILE MENU */}
        <NavbarMenu>
          <div className="mx-2 mt-2 flex flex-col gap-2">
            {siteConfig.navMenuItems.map((item, index) => (
              <NavbarMenuItem key={`${item}-${index}`}>
                {item.submenu ? (
                  <AccordionDropdown
                    onClick={handleNavbarToggle}
                    label={item.label}
                    items={item.submenuItems || []}
                  />
                ) : (
                  <Link
                    className="
                      px-4
                      py-2
                      text-base
                      w-full
                    "
                    style={{
                      color:
                        pathname === item.href ? "#085041" : undefined,

                      fontWeight:
                        pathname === item.href ? 600 : 400,

                      backgroundColor:
                        pathname === item.href
                          ? "#ffffff"
                          : "transparent",

                      borderRadius: "9999px",

                      display: "block",

                      border:
                        pathname === item.href
                          ? "1px solid #085041"
                          : "1px solid transparent",

                      transition: "all 0.25s ease",
                    }}
                    color="foreground"
                    href={item.href}
                    size="lg"
                    onClick={handleNavbarToggle}
                  >
                    {item.label}
                  </Link>
                )}
              </NavbarMenuItem>
            ))}
          </div>
        </NavbarMenu>
      </NextUINavbar>
    </>
  );
};
