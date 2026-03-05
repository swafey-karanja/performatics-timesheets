import DataTable from "@/components/DataTable";
import TimesheetsModal from "@/components/Modal";


const TimesheetsPage = () => {
  return (
    <div className="flex flex-col gap-8">
        <div className="flex justify-end">
            <TimesheetsModal />
        </div>
      
      <DataTable />
    </div>
  )
}

export default TimesheetsPage;