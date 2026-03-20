"use client";

import {
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@cf/ui";
import { Edit } from "lucide-react";
import type React from "react";
import { useState } from "react";

export default function PersonalDetailsForm() {
  const [formData, setFormData] = useState({
    firstName: "Efua",
    lastName: "Kumi",
    dateOfBirth: "",
    idNumber: "",
    gender: "",
    yearsOfExperience: "5",
    email: "kumi.a@emailaddress.com",
    phoneNumber: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
  };

  return (
    <div className="mx-auto max-w-md bg-white p-6">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">
          Personal details
        </h1>
        <Button
          variant="ghost"
          size="sm"
          className="text-green-600 hover:text-green-700"
        >
          <Edit className="mr-1 size-4" />
          Edit
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label
            htmlFor="firstName"
            className="mb-2 block text-sm font-medium text-gray-900"
          >
            First name
          </Label>
          <Input
            id="firstName"
            value={formData.firstName}
            onChange={(e) => handleInputChange("firstName", e.target.value)}
            className="h-12 rounded-lg border-gray-200 bg-gray-100"
          />
        </div>

        <div>
          <Label
            htmlFor="lastName"
            className="mb-2 block text-sm font-medium text-gray-900"
          >
            Last name
          </Label>
          <Input
            id="lastName"
            value={formData.lastName}
            onChange={(e) => handleInputChange("lastName", e.target.value)}
            className="h-12 rounded-lg border-gray-200 bg-gray-100"
          />
        </div>

        <div>
          <Label
            htmlFor="dateOfBirth"
            className="mb-2 block text-sm font-medium text-gray-900"
          >
            Date of birth
          </Label>
          <Input
            id="dateOfBirth"
            placeholder="DD/MM/YYYY"
            value={formData.dateOfBirth}
            onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
            className="h-12 rounded-lg border-gray-200 bg-gray-100"
          />
        </div>

        <div>
          <Label
            htmlFor="idNumber"
            className="mb-2 block text-sm font-medium text-gray-900"
          >
            ID number
          </Label>
          <Input
            id="idNumber"
            placeholder="Enter ID number"
            value={formData.idNumber}
            onChange={(e) => handleInputChange("idNumber", e.target.value)}
            className="h-12 rounded-lg border-gray-200 bg-gray-100"
          />
        </div>

        <div>
          <Label
            htmlFor="gender"
            className="mb-2 block text-sm font-medium text-gray-900"
          >
            Gender
          </Label>
          <Select
            value={formData.gender}
            onValueChange={(value) => handleInputChange("gender", value)}
          >
            <SelectTrigger className="h-12 rounded-lg border-gray-200 bg-gray-100">
              <SelectValue placeholder="Add gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="other">Other</SelectItem>
              <SelectItem value="prefer-not-to-say">
                Prefer not to say
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label
            htmlFor="yearsOfExperience"
            className="mb-2 block text-sm font-medium text-gray-900"
          >
            Years of experience
          </Label>
          <Input
            id="yearsOfExperience"
            type="number"
            value={formData.yearsOfExperience}
            onChange={(e) =>
              handleInputChange("yearsOfExperience", e.target.value)
            }
            className="h-12 rounded-lg border-gray-200 bg-gray-100"
          />
        </div>

        <div>
          <Label
            htmlFor="email"
            className="mb-2 block text-sm font-medium text-gray-900"
          >
            Email
          </Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            className="h-12 rounded-lg border-gray-200 bg-gray-100"
          />
        </div>

        <div>
          <Label
            htmlFor="phoneNumber"
            className="mb-2 block text-sm font-medium text-gray-900"
          >
            Phone number
          </Label>
          <div className="flex">
            <div className="flex items-center rounded-l-lg border border-r-0 border-gray-200 bg-gray-100 px-3">
              <span className="mr-2 text-lg">🇬🇭</span>
              <span className="text-sm text-gray-700">+233</span>
            </div>
            <Input
              id="phoneNumber"
              placeholder="99 999 9999"
              value={formData.phoneNumber}
              onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
              className="h-12 rounded-l-none rounded-r-lg border-l-0 border-gray-200 bg-gray-100"
            />
          </div>
        </div>
      </form>
    </div>
  );
}
