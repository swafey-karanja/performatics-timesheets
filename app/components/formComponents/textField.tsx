import React from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";

interface ReusableTextFieldProps {
  label: string;
  id?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  width?: string | number;
  variant?: "outlined" | "filled" | "standard";
  required?: boolean;
  placeholder?: string;
  minRows?: number;
  maxRows?: number;
  multiline?: boolean;
}

const ReusableTextField: React.FC<ReusableTextFieldProps> = ({
  label,
  id = "input",
  value,
  onChange,
  width,
  variant = "outlined",
  required = false,
  placeholder,
  minRows,
  maxRows,
  multiline,
}) => {
  return (
    <Box
      component="form"
      sx={{
        "& > :not(style)": { width },
      }}
      noValidate
      autoComplete="off"
    >
      <TextField
        id={id}
        label={label}
        value={value}
        onChange={onChange}
        variant={variant}
        required={required}
        placeholder={placeholder}
        minRows={minRows}
        maxRows={maxRows}
        multiline={multiline}
        size="small"
      />
    </Box>
  );
};

export default ReusableTextField;
