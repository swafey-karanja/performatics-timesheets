import React from 'react'
import DataBox from './common/DataBox'
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import AvTimerIcon from '@mui/icons-material/AvTimer';
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import FemaleOutlinedIcon from '@mui/icons-material/FemaleOutlined';
import MaleOutlinedIcon from '@mui/icons-material/MaleOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import { Staff } from '@/types/types';


const EmployeeStats = ({ staff }: { staff: Staff[] }) => {

  const totalEmployees = staff?.length;

  const avgAge = /* not in Staff interface — no date_of_birth field available */ null;

  const femaleCount = staff.filter(s => s.gender === "Female").length;
  const maleCount   = staff.filter(s => s.gender === "Male").length;

  const femalePercent = totalEmployees > 0
    ? Math.round((femaleCount / totalEmployees) * 100)
    : 0;
  const malePercent = totalEmployees > 0
    ? Math.round((maleCount / totalEmployees) * 100)
    : 0;

  const activeStaff = staff.filter(s => s.status === "Active").length;
  const satisfactionPercent = totalEmployees > 0
    ? Math.round((activeStaff / totalEmployees) * 100)
    : 0;

  // Average hours requires timesheet data — not in Staff interface
  const avgHours = null;

  const EmployeeStatsArray = [
    { dataTitle: "Total Employees",        dataFigure: totalEmployees,           icon: <PeopleOutlineIcon /> },
    { dataTitle: "Average Age",            dataFigure: "N/A",                    icon: <CalendarMonthOutlinedIcon /> },
    { dataTitle: "Employee Satisfaction",  dataFigure: `${satisfactionPercent}%`, icon: <ThumbUpOffAltIcon /> },
    { dataTitle: "Female Employees",       dataFigure: `${femalePercent}%`,       icon: <FemaleOutlinedIcon /> },
    { dataTitle: "Male Employees",         dataFigure: `${malePercent}%`,         icon: <MaleOutlinedIcon /> },
    { dataTitle: "Average Hours/Employee", dataFigure: "N/A",                    icon: <AvTimerIcon /> },
  ];
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-6 md:gap-6 border border-gray-200 rounded-2xl p-8 dark:border-gray-800">
        {EmployeeStatsArray.map((stat, index) => (
            <DataBox
                key={index}
                dataTitle={stat.dataTitle}
                dataFigure={stat.dataFigure}
                icon={stat.icon}
            />
        ))}
    </div>
  )
}

export default EmployeeStats