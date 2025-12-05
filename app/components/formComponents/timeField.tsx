import * as React from "react";
import dayjs, { Dayjs } from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { TimeField } from "@mui/x-date-pickers/TimeField";

export default function TimeFieldComponent({ label }: { label: string }) {
  const now = new Date();
  const [value, setValue] = React.useState<Dayjs | null>(dayjs(now));

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <TimeField
        sx={{ width: 260 }}
        label={label}
        value={value}
        onChange={(newValue) => setValue(newValue)}
      />
    </LocalizationProvider>
  );
}
