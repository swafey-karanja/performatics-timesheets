"use client";

import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";
import StaffTable from "@/components/StaffTable";

const StaffDetailsPage = () => {

  return (
    <div className="flex flex-col gap-8">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Staff Members
        </h1>
        <Button
        //   onClick={() => setIsCreateOpen(true)}
          variant="contained"
          size="large"
          startIcon={<AddIcon />}
          sx={{
            backgroundColor: "#ef4444",
            color: "#ffffff",
            "&:hover": { backgroundColor: "#dc2626" },
          }}
        >
          Add a New Staff Member
        </Button>
      </div>
      <StaffTable />
      
    </div>
  );
};

export default StaffDetailsPage;