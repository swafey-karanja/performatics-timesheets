"use client";

import  { useState } from "react";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";
import CreateTimesheetModal from "@/components/CreateTimesheetModal";
import ViewTimesheetModal from "@/components/ViewTimesheetModal";
import { TimesheetRow } from "@/types/timesheets.types";
import EditTimesheetModal from "@/components/EditTimesheetModal";
import TimesheetsTable, { LoggedInAccount } from "@/components/TimesheetsTable";

const TimesheetsPage = () => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [viewTimesheet, setViewTimesheet] = useState<TimesheetRow | null>(null);
  const [editTimesheet, setEditTimesheet] = useState<TimesheetRow | null>(null);
  const [refetchKey, setRefetchKey] = useState(0);

  // ── Auth ────────────────────────────────────────────────────────────────────
    const [account] = useState<LoggedInAccount | null>(() => {
      try {
        const raw = localStorage.getItem("account");
        return raw ? JSON.parse(raw) : null;
      } catch {
        return null;
      }
    });

  return (
    <div className="flex flex-col gap-8">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Timesheets
        </h1>
        <Button
          onClick={() => setIsCreateOpen(true)}
          variant="contained"
          size="large"
          startIcon={<AddIcon />}
          sx={{
            backgroundColor: "#ef4444",
            color: "#ffffff",
            "&:hover": { backgroundColor: "#dc2626" },
          }}
        >
          Create New Task
        </Button>
      </div>

      {/* Modals */}
      <CreateTimesheetModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />

      <ViewTimesheetModal
        isOpen={viewTimesheet !== null}
        onClose={() => setViewTimesheet(null)}
        timesheet={viewTimesheet}
      />

      <EditTimesheetModal
        isOpen={editTimesheet !== null}
        onClose={() => setEditTimesheet(null)}
        timesheet={editTimesheet}
        onSuccess={() => {
          setEditTimesheet(null);
          setRefetchKey((k) => k + 1);
        }}
      />

      {/* Table — onView opens the view modal */}
      <TimesheetsTable
        onView={(ts) => setViewTimesheet(ts)}
        onEdit={(ts) => setEditTimesheet(ts)}
        refetchKey={refetchKey}
        account={account}
      />
    </div>
  );
};

export default TimesheetsPage;