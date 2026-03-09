
import EmployeeStats from "@/components/EmployeeStats";
import EmpoyeeBreakdown from "@/components/EmployeeBreakdown";
import React from "react";

const DashboardPage = () => {
  return  (
  <div className="grid grid-cols-12 gap-4 md:gap-6">
    <div className="col-span-12 space-y-6">
      <EmployeeStats />
    </div>

    <div className="col-span-12 space-y-6">
      <EmpoyeeBreakdown />
    </div>
  </div>
  )
};

export default DashboardPage;
