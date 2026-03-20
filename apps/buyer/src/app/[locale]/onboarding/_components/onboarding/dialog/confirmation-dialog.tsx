import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@cf/ui";

interface Props {
  onConfirm: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export function ConfirmationDialog({ onConfirm, isOpen, onClose }: Props) {
  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent
        overlayClassName="bg-black/50 backdrop-blur-sm"
        className="max-w-sm rounded-xl p-8 sm:rounded-2xl md:max-w-md"
      >
        <AlertDialogHeader className="flex flex-col space-y-2">
          <AlertDialogTitle className="text-center text-xl font-semibold">
            Confirmation
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center text-[#586665]">
            Confirm your action to proceed. If you don&apos;t complete this now,
            you would be reminded later.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-4 flex flex-row items-center gap-4">
          <AlertDialogCancel
            className="w-full rounded-xl border-none bg-[#F5F5F5] font-semibold text-[hsl(var(--text-dark))] hover:bg-[#F5F5F5]/90 hover:text-[hsl(var(--text-dark))]"
            onClick={onClose}
          >
            No, cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="mt-2 block w-full rounded-xl border-none bg-[#4B908B] font-semibold text-white hover:bg-[#4B908B]/90 sm:mt-0 md:hidden"
          >
            Yes, Skip
          </AlertDialogAction>
          <AlertDialogAction
            onClick={onConfirm}
            className="hidden w-full rounded-xl border-none bg-[#4B908B] font-semibold text-white hover:bg-[#4B908B]/90 md:block"
          >
            Yes, complete later
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
