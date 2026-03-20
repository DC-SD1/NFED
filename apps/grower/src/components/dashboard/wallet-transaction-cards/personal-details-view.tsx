"use client";

import { cn } from "@cf/ui";

interface PersonalDetailsViewProps {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  idNumber: string;
  gender: string;
  yearsOfExperience: number;
  email: string;
  contactNumber: string;
}

export function PersonalDetailsView(props: PersonalDetailsViewProps) {
  const fields = [
    { label: "First name", value: props.firstName },
    { label: "Last name", value: props.lastName },
    {
      label: "Date of birth",
      value: props.dateOfBirth,
      placeholder: "DD/MM/YYYY",
    },
    { label: "ID number", value: props.idNumber },
    { label: "Gender", value: props.gender },
    { label: "Years of experience", value: props.yearsOfExperience },
    { label: "Email", value: props.email, isEmail: true },
    { label: "Contact number", value: props.contactNumber },
  ];

  return (
    <div className="space-y-1 md:grid md:grid-cols-2 md:gap-2 md:space-y-0">
      {fields.map(({ label, value, placeholder, isEmail }) => (
        <div key={label} className="flex items-start justify-between md:block">
          <label className="text-gray-dark text-md shrink-0">{label}</label>
          <p
            className={cn(
              "mt-0.5 font-thin md:mt-1",
              isEmail && [
                "max-w-[220px]",
                "break-all",
                "text-sm",
                "text-gray-800",
                "md:max-w-none",
              ],
            )}
          >
            {value || placeholder || "N/A"}
          </p>
        </div>
      ))}
    </div>
  );
}
