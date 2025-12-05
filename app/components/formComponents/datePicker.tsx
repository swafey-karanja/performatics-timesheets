import * as React from "react";
import { DemoItem } from "@mui/x-date-pickers/internals/demo";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DesktopDatePicker } from "@mui/x-date-pickers/DesktopDatePicker";
import Box from "@mui/material/Box";
import dayjs from "dayjs";

export default function DatePicker() {
  const [cleared, setCleared] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (cleared) {
      const timeout = setTimeout(() => {
        setCleared(false);
      }, 1500);

      return () => clearTimeout(timeout);
    }
    return () => {};
  }, [cleared]);

  const now = new Date();
  const formattedDateTime = now.toLocaleString();

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box
        sx={{
          width: "100%",
          height: "70%",
          display: "flex",
          justifyContent: "center",
          position: "relative",
        }}
      >
        <DesktopDatePicker
          sx={{ width: 380 }}
          slotProps={{
            field: { clearable: true, onClear: () => setCleared(true) },
          }}
          defaultValue={dayjs(formattedDateTime)}
        />
      </Box>
    </LocalizationProvider>
  );
}
