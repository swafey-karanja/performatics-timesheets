
import React from 'react'

interface DataBoxProps {
  dataTitle: string;
  dataFigure: number | string;
  icon?: React.ReactNode;
}

const DataBox = ({ dataTitle, dataFigure, icon }: DataBoxProps) => {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/3 md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800 dark:text-white">
          {icon}
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {dataTitle}
            </span>
            <h4 className="mt-2 font-bold text-brand-600 text-title-sm dark:text-white/90">
              {dataFigure}
            </h4>
          </div>

          {/* <Badge color="error">
            <ArrowDownIcon className="text-error-500" />
            9.05%
          </Badge> */}
        </div>
      </div>
  )
}

export default DataBox;