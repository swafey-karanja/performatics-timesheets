import React from 'react'
import DataBox from './common/DataBox'
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import AvTimerIcon from '@mui/icons-material/AvTimer';
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import FemaleOutlinedIcon from '@mui/icons-material/FemaleOutlined';
import MaleOutlinedIcon from '@mui/icons-material/MaleOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';

const EmployeeStatsArray = [
    { dataTitle: "Total Employees", dataFigure: 20, icon: <PeopleOutlineIcon /> },
    { dataTitle: "Average Age", dataFigure: 29, icon: <CalendarMonthOutlinedIcon /> },
    { dataTitle: "Employee Satisfaction", dataFigure: "69%", icon: <ThumbUpOffAltIcon /> },
    { dataTitle: "Female Employees", dataFigure: "33%", icon: <FemaleOutlinedIcon /> },
    { dataTitle: "Male Employees", dataFigure: "67%", icon: <MaleOutlinedIcon /> },
    { dataTitle: "Average Hours/Employee", dataFigure: 40, icon: <AvTimerIcon /> },
]

const EmployeeStats = () => {
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