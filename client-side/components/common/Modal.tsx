"use client";

import React from "react";
import MuiModal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";

// ─── Props ────────────────────────────────────────────────────────────────────

interface AppModalProps {
  /** Controls whether the modal is visible */
  isOpen: boolean;
  /** Called when the modal requests to close (backdrop click, X button) */
  onClose: () => void;
  /** Shown in the modal header */
  title: string;
  /** The form / content to display inside the modal body */
  children: React.ReactNode;
  /** Optional footer — pass action buttons (Cancel, Submit, etc.) */
  footer?: React.ReactNode;
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const modalBoxStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "auto",
  maxWidth: "95vw",
  maxHeight: "90vh",
  display: "flex",
  flexDirection: "column",
  bgcolor: "background.paper",
  border: "1px solid",
  borderColor: "divider",
  boxShadow: 24,
  borderRadius: 2,
  overflow: "hidden",
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function AppModal({
  isOpen,
  onClose,
  title,
  children,
  footer,
}: AppModalProps) {
  return (
    <MuiModal open={isOpen} onClose={onClose}>
      <Box
        sx={modalBoxStyle}
        className="bg-white! dark:bg-gray-200! border-gray-200! dark:border-gray-800!"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-300 shrink-0">
          <h2 className="text-2xl font-semibold text-gray-800">
            {title}
          </h2>
          <IconButton
            onClick={onClose}
            size="small"
            aria-label="Close modal"
            className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto p-6 flex-1">
          {children}
        </div>

        {/* Footer — only rendered when footer content is provided */}
        {footer && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-300 shrink-0">
            {footer}
          </div>
        )}
      </Box>
    </MuiModal>
  );
}