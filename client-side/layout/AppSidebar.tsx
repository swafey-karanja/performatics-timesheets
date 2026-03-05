"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSidebar } from "../context/SidebarContext";
import GroupsIcon from "@mui/icons-material/Groups";
import FolderIcon from "@mui/icons-material/Folder";
import DescriptionIcon from "@mui/icons-material/Description";
import List from "@mui/material/List";
import ExtensionIcon from "@mui/icons-material/Extension";
import StarIcon from "@mui/icons-material/Star";
import PersonIcon from "@mui/icons-material/Person";
import SignalCellularAltIcon from "@mui/icons-material/SignalCellularAlt";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import SpaceDashboardIcon from '@mui/icons-material/SpaceDashboard';

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

const dashBoardItems: NavItem[] = [
  {
    icon: <SpaceDashboardIcon />,
    name: "Dashboard",
    path: "/",
  },
];

const navItems: NavItem[] = [
  {
    icon: <PersonIcon />,
    name: "Timesheets",
    path: "/timesheets",
  },
  {
    icon: <GroupsIcon />,
    name: "Candidates",
    path: "/candidates",
  },
  {
    icon: <FolderIcon />,
    name: "Jobs",
    path: "/jobs",
  },
  {
    icon: <DescriptionIcon />,
    name: "Applications",
    path: "/applications",
  },
  {
    icon: <List />,
    name: "Invoices",
    path: "/invoices",
  },
];

const aiItems: NavItem[] = [
  {
    icon: <ExtensionIcon />,
    name: "Intergrations",
    path: "#",
  },
  {
    icon: <StarIcon />,
    name: "Features",
    path: "#",
  },
  {
    icon: <PersonIcon />,
    name: "My profile",
    path: "#",
  },
];

const analyticsItems: NavItem[] = [
  {
    icon: <SignalCellularAltIcon />,
    name: "Reports & Analytics",
    path: "/analytics",
  },
];

const othersItems: NavItem[] = [
  {
    icon: <ExtensionIcon />,
    name: "Intergrations",
    path: "/integrations",
  },
  {
    icon: <StarIcon />,
    name: "Features",
    path: "/features",
  },
  {
    icon: <PersonIcon />,
    name: "My profile",
    path: "/profile",
  },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();

  const renderMenuItems = (
    navItems: NavItem[],
    menuType: "dashboard" | "main" | "aiFeatures" | "analytics" | "others",
  ) => (
    <ul className="flex flex-col gap-4">
      {navItems.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index, menuType)}
              className={`menu-item group  ${
                openSubmenu?.type === menuType && openSubmenu?.index === index
                  ? "menu-item-active"
                  : "menu-item-inactive"
              } cursor-pointer ${
                !isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "lg:justify-start"
              }`}
            >
              <span
                className={` ${
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? "menu-item-icon-active"
                    : "menu-item-icon-inactive"
                }`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className={`menu-item-text`}>{nav.name}</span>
              )}
              {(isExpanded || isHovered || isMobileOpen) && (
                <KeyboardArrowDownIcon
                  className={`ml-auto w-5 h-5 transition-transform duration-200  ${
                    openSubmenu?.type === menuType &&
                    openSubmenu?.index === index
                      ? "rotate-180 text-brand-500"
                      : ""
                  }`}
                />
              )}
            </button>
          ) : (
            nav.path && (
              <Link
                href={nav.path}
                className={`menu-item group ${
                  isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                }`}
              >
                <span
                  className={`${
                    isActive(nav.path)
                      ? "menu-item-icon-active"
                      : "menu-item-icon-inactive"
                  }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className={`menu-item-text`}>{nav.name}</span>
                )}
              </Link>
            )
          )}
          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[`${menuType}-${index}`] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? `${subMenuHeight[`${menuType}-${index}`]}px`
                    : "0px",
              }}
            >
              <ul className="mt-2 space-y-1 ml-9">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    <Link
                      href={subItem.path}
                      className={`menu-dropdown-item ${
                        isActive(subItem.path)
                          ? "menu-dropdown-item-active"
                          : "menu-dropdown-item-inactive"
                      }`}
                    >
                      {subItem.name}
                      <span className="flex items-center gap-1 ml-auto">
                        {subItem.new && (
                          <span
                            className={`ml-auto ${
                              isActive(subItem.path)
                                ? "menu-dropdown-badge-active"
                                : "menu-dropdown-badge-inactive"
                            } menu-dropdown-badge `}
                          >
                            new
                          </span>
                        )}
                        {subItem.pro && (
                          <span
                            className={`ml-auto ${
                              isActive(subItem.path)
                                ? "menu-dropdown-badge-active"
                                : "menu-dropdown-badge-inactive"
                            } menu-dropdown-badge `}
                          >
                            pro
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  // const [openSubmenu, setOpenSubmenu] = useState<{
  //   type: "dashboard" | "main" | "aiFeatures" | "analytics" | "others";
  //   index: number;
  // } | null>(null);

  const [manualSubmenu, setManualSubmenu] = useState<{
  type: "dashboard" | "main" | "aiFeatures" | "analytics" | "others";
  index: number;
} | null>(null);

  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {},
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // const isActive = (path: string) => path === pathname;
  const isActive = useCallback((path: string) => path === pathname, [pathname]);

  const menuSections: {
  type: "dashboard" | "main" | "aiFeatures" | "analytics" | "others";
  items: NavItem[];
}[] = [
  { type: "dashboard", items: dashBoardItems },
  { type: "main", items: navItems },
  { type: "aiFeatures", items: aiItems },
  { type: "analytics", items: analyticsItems },
  { type: "others", items: othersItems },
];

const openSubmenu = (() => {
  for (const { type, items } of menuSections) {
    for (let index = 0; index < items.length; index++) {
      if (items[index].subItems?.some((s) => isActive(s.path))) {
        return { type, index };
      }
    }
  }
  return manualSubmenu;
})();

  useEffect(() => {
    // Set the height of the submenu items when the submenu is opened
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (
  index: number,
  menuType: "dashboard" | "main" | "aiFeatures" | "analytics" | "others",
) => {
  setManualSubmenu((prev) => {
    if (prev && prev.type === menuType && prev.index === index) {
      return null;
    }
    return { type: menuType, index };
  });
};

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${
          isExpanded || isMobileOpen
            ? "w-72.5"
            : isHovered
              ? "w-72.5"
              : "w-22.5"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-8 flex  ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link href="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <Image
                className="dark:hidden"
                 src="/Performatics-Logo-Black.png"
                alt="Logo"
                width={150}
                height={40}
              />
              <Image
                className="hidden dark:block"
                 src="/Performatics-Logo-White.png"
                alt="Logo"
                width={150}
                height={40}
              />
            </>
          ) : (
            <>
            
            <Image
               src="/Performatics-Logo-Black.png"
               className="dark:hidden"
              alt="Logo"
              width={32}
              height={32}
            />

             <Image
               src="/Performatics-Logo-White.png"
              alt="Logo"
              width={32}
              height={32}
               className="hidden dark:block"
            />
            </>
          )}
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-5 text-gray-400 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  ""
                ) : (
                  <MoreHorizIcon />
                )}
              </h2>
              {renderMenuItems(dashBoardItems, "dashboard")}
            </div>
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-5 text-gray-400 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Recruitment"
                ) : (
                  <MoreHorizIcon />
                )}
              </h2>
              {renderMenuItems(navItems, "main")}
            </div>

            <div className="">
              <h2
                className={`mb-4 text-xs uppercase flex leading-5 text-gray-400 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Analytics"
                ) : (
                  <MoreHorizIcon />
                )}
              </h2>
              {renderMenuItems(analyticsItems, "analytics")}
            </div>

            <div className="">
              <h2
                className={`mb-4 text-xs uppercase flex leading-5 text-gray-400 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Settings"
                ) : (
                  <MoreHorizIcon />
                )}
              </h2>
              {renderMenuItems(othersItems, "others")}
            </div>
          </div>
        </nav>
        {/* {isExpanded || isHovered || isMobileOpen ? <SidebarWidget /> : null} */}
      </div>
    </aside>
  );
};

export default AppSidebar;
