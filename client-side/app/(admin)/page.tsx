"use client";

import EmployeeStats from "@/components/EmployeeStats";
import EmpoyeeBreakdown from "@/components/EmployeeBreakdown";
import { useStaff } from "@/hooks/useStaff";

const DashboardPage = () => {

  const { staff, error: staffError, isLoading: staffLoading } = useStaff();
  console.log({staff})

  if (staffLoading) {
    return <div>Loading staff data...</div>;
  }

  if (staffError) {
    return <div>Error loading staff data: {staffError.message}</div>;
  }

  return  (
  <div className="grid grid-cols-12 gap-4 md:gap-6">
    <div className="col-span-12 space-y-6">
      <EmployeeStats staff={staff} />
    </div>

    <div className="col-span-12 space-y-6">
      <EmpoyeeBreakdown staff={staff} staffLoading={staffLoading} />
    </div>
  </div>
  )
};

export default DashboardPage;
