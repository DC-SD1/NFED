"use client";
import SelectFarmManagerOptionModal from "@/components/modals/SelectFarmManagerOption";
import { useModal } from "@/lib/stores/use-modal";

export const ModalProvider = () => {
  const { type, isOpen, onClose, data } = useModal();

  return (
    <>
      {type === "AddFarmManager" && (
        <SelectFarmManagerOptionModal
          open={isOpen}
          onClose={onClose}
          data={data}
        />
      )}
    </>
  );
};
