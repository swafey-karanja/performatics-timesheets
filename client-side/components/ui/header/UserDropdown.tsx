"use client";

import Image from "next/image";
import React, { useEffect, useState } from "react";
import { Dropdown } from "../dropdown/Dropdown";
import { DropdownItem } from "../dropdown/DropdownItem";
import { useLogout } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import LogoutIcon from '@mui/icons-material/Logout';
import InfoIcon from '@mui/icons-material/Info';
import SettingsIcon from '@mui/icons-material/Settings';
import EditIcon from '@mui/icons-material/Edit';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

interface UserAccount {
  account_id: number;
  staff_id: number;
  username: string;
  work_email: string;
  role: "Admin" | "Manager" | "Staff";
  status: "Active" | "Suspended";
  staff_name?: string;
}

export default function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);

  // ── Auth ────────────────────────────────────────────────────────────────────
    // Start as null on both server and client so the first render matches,
    // then populate from localStorage after hydration is complete.
    const [account, setAccount] = useState<UserAccount | null>(null);
  
    useEffect(() => {
      try {
        const raw = localStorage.getItem("account");
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setAccount(raw ? JSON.parse(raw) : null);
      } catch {
        setAccount(null);
      }
    }, []);
  
    // const isPrivileged =
    //   account?.role === "Admin" || account?.role === "Manager";

  const { handleLogout } = useLogout();
  const router = useRouter();

  function toggleDropdown(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    e.stopPropagation();
    setIsOpen((prev) => !prev);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  function onLogout() {
    closeDropdown();
    handleLogout();
  }

  // Display username or fallback
  const displayName = account?.staff_name || account?.username || "account";
  const displayEmail = account?.work_email || "user@example.com";

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="flex items-center text-gray-700 dark:text-gray-400 dropdown-toggle"
      >
        <span className="mr-3 overflow-hidden rounded-full h-11 w-11">
          <Image
            width={44}
            height={44}
            src="/user/owner.jpg"
            alt="User"
          />
        </span>

        <span className="block mr-1 font-medium text-theme-sm">
          {displayName}
        </span>

        <ArrowDropDownIcon className={`stroke-gray-500 dark:stroke-gray-400 transition-transform duration-200 mt-1 ${
            isOpen ? "rotate-180" : ""
          }`}/>
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute right-0 mt-4.25 flex w-65 flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark"
      >
        <div>
          <span className="block font-medium text-gray-700 text-theme-sm dark:text-gray-400">
            {displayName}
          </span>
          <span className="mt-0.5 block text-theme-xs text-gray-500 dark:text-gray-400">
            {displayEmail}
          </span>
          {account?.role && (
            <span className="mt-1 inline-block px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              {account.role}
            </span>
          )}
        </div>

        <ul className="flex flex-col gap-1 pt-4 pb-3 border-b border-gray-200 dark:border-gray-800">
          <li>
            <DropdownItem
              onItemClick={closeDropdown}
              tag="a"
              href="/profile"
              className="flex items-center gap-3 px-3 py-2 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              <EditIcon />
              Edit profile
            </DropdownItem>
          </li>
          <li>
            <DropdownItem
              onItemClick={closeDropdown}
              tag="a"
              href="/settings"
              className="flex items-center gap-3 px-3 py-2 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              <SettingsIcon />
              Account settings
            </DropdownItem>
          </li>
          <li>
            <DropdownItem
              onItemClick={closeDropdown}
              tag="a"
              href="/support"
              className="flex items-center gap-3 px-3 py-2 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              <InfoIcon />
              Support
            </DropdownItem>
          </li>
        </ul>
        <button
          onClick={onLogout}
          className="flex items-center gap-3 px-3 py-2 mt-3 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300 w-full text-left"
        >
          <LogoutIcon />
          Sign out
        </button>
      </Dropdown>
    </div>
  );
}