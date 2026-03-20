import { Button, Input } from "@cf/ui";
import { Search } from "lucide-react";
import React, { useState } from "react";

import AppDialog from "@/components/modals/app-dialog";
import { useModal } from "@/lib/stores/use-modal";

const FULFILMENT_CENTERS = [
  {
    id: "1",
    name: "Juapong Fulfilment Center",
    location: "Juapong, Eastern region",
  },
  { id: "2", name: "Gaa Fulfilment Center", location: "Paragraph" },
  {
    id: "3",
    name: "Kumasi Fulfilment Center",
    location: "Kumasi, Ashanti region",
  },
  {
    id: "4",
    name: "Cape Fulfilment Center",
    location: "Cape Coast, Central region",
  },
];

export default function SelectFulfilmentCenterModal() {
  const { onClose, isOpen, type } = useModal();
  const isModalOpen = isOpen && type === "SelectFulfilmentCenter";
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCenter, setSelectedCenter] = useState<string | null>(null);

  const filteredCenters = FULFILMENT_CENTERS.filter((center) =>
    center.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <AppDialog
      isOpen={isModalOpen}
      onOpenChange={onClose}
      title="Select a fulfilment center"
      content={
        <div className="flex min-h-[400px] flex-col px-6 py-4">
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <Input
              placeholder="Search by fulfilment center"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 w-full border-none bg-[#F3F6F3] pl-9 text-sm"
            />
          </div>

          <div className="flex-1 space-y-4">
            {filteredCenters.map((center) => (
              <div
                role="button"
                tabIndex={0}
                key={center.id}
                className="flex cursor-pointer items-start justify-between border-b border-gray-100 pb-4 last:border-0 focus:outline-none focus:ring-2 focus:ring-[#A8E6A3] focus:ring-offset-2"
                onClick={() => setSelectedCenter(center.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    setSelectedCenter(center.id);
                  }
                }}
              >
                <div>
                  <h4 className="text-sm font-medium text-gray-900">
                    {center.name}
                  </h4>
                  <p className="text-xs text-gray-500">{center.location}</p>
                </div>
                <div
                  className={`h-5 w-5 rounded-full border ${
                    selectedCenter === center.id
                      ? "border-orange-500 bg-orange-500"
                      : "border-gray-300 bg-white"
                  } flex items-center justify-center`}
                >
                  {selectedCenter === center.id && (
                    <div className="h-2 w-2 rounded-full bg-white" />
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <Button
              disabled={!selectedCenter}
              className="h-10 w-full rounded-md bg-[#A8E6A3] text-sm font-semibold text-white hover:bg-[#92d68e] disabled:cursor-not-allowed disabled:opacity-50"
              onClick={() => {
                console.log("Selected center:", selectedCenter);
                onClose();
              }}
            >
              Continue
            </Button>
          </div>
        </div>
      }
      footer={null}
    />
  );
}
