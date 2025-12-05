import * as React from "react";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";

export interface Option {
  label: string;
  value: string | number;
}

interface ReusableSelectProps {
  label: string;
  value: string | number;
  onChange: (event: SelectChangeEvent) => void;
  options: Option[];
  minWidth?: number;
  size?: "small" | "medium";
  id?: string;
  labelId?: string;
}

export default function ReusableSelect({
  label,
  value,
  onChange,
  options,
  minWidth = 385,
  size = "small",
  id = "custom-select",
  labelId = "custom-select-label",
}: ReusableSelectProps) {
  return (
    <FormControl sx={{ minWidth }} size={size}>
      <InputLabel id={labelId}>{label}</InputLabel>

      <Select
        labelId={labelId}
        id={id}
        value={value}
        label={label}
        onChange={onChange}
      >
        {options?.map((option, index) => (
          <MenuItem key={index} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
