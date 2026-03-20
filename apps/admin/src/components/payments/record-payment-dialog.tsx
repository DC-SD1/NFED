import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Button,
  Calendar,
  cn,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormUpload,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Textarea,
} from "@cf/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@cf/ui/components/select";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconCloudUpload,
  IconFileDescription,
  IconX,
} from "@tabler/icons-react";
import { addMonths, format, setYear } from "date-fns";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

interface RecordPaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentVerified: () => void;
  onPaymentRejected?: (reason: string) => void;
}

const recordPaymentSchema = z.object({
  bankStatementDate: z.date({ required_error: "Date is required" }),
  currency: z.string().default("USD"),
  amountReceived: z.string().min(1, "Amount is required"),
  transactionReference: z.string().min(1, "Reference is required"),
  bankName: z.string().min(1, "Bank name is required"),
  bankAccount: z.string().min(1, "Account number is required"),
  nameOnAccount: z.string().min(1, "Name on account is required"),
  proofOfPayment: z.string().optional(),
});

// eslint-disable-next-line max-lines-per-function
export default function RecordPaymentDialog({
  isOpen,
  onClose,
  onPaymentVerified,
  onPaymentRejected,
}: RecordPaymentDialogProps) {
  const [currentMonth, setCurrentMonth] = React.useState<Date>(new Date());
  const [isYearSelection, setIsYearSelection] = React.useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = React.useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = React.useState(false);
  const [rejectionReason, setRejectionReason] = React.useState("");
  const [formData, setFormData] = React.useState<z.infer<
    typeof recordPaymentSchema
  > | null>(null);

  const form = useForm<z.infer<typeof recordPaymentSchema>>({
    resolver: zodResolver(recordPaymentSchema),
    mode: "onChange",
    defaultValues: {
      currency: "USD",
    },
  });

  const proofOfPayment = form.watch("proofOfPayment");

  const { isValid } = form.formState;

  const onSubmit = (data: z.infer<typeof recordPaymentSchema>) => {
    setFormData(data);
    setIsConfirmDialogOpen(true);
  };

  const handleConfirmPayment = () => {
    if (formData) {
      console.log("Payment Verified:", formData);
      // Perform actual submission logic here
      setIsConfirmDialogOpen(false);
      onPaymentVerified();
      onClose();
    }
  };

  const handleYearSelect = (year: number) => {
    const newMonth = setYear(currentMonth, year);
    setCurrentMonth(newMonth);
    setIsYearSelection(false);
  };

  const years = Array.from({ length: 100 }, (_, i) => {
    return new Date().getFullYear() - 50 + i;
  });

  const uploadFunction = async (file: File) => {
    // Mock upload delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return {
      id: Math.random().toString(36).substring(7),
      filename: file.name,
      downloadUrl: URL.createObjectURL(file), // Mock URL
      size: file.size,
      type: file.type,
      uploadedAt: new Date().toISOString(),
    };
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="flex h-screen w-screen max-w-none flex-col gap-0 rounded-none p-0"
        closeClassName="hidden"
      >
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex h-full flex-col"
          >
            <DialogHeader className="relative flex flex-row items-center justify-between border-b p-4 px-6">
              <button
                type="button"
                onClick={onClose}
                className="text-gray-500 outline-none hover:text-gray-700"
              >
                <IconX size={20} />
              </button>

              <div className="text-black-500 absolute left-1/2 -translate-x-1/2 text-lg font-bold tracking-wider">
                Record buyer payment
              </div>
              <div className="w-5" />
            </DialogHeader>

            <div className="flex flex-1 overflow-hidden">
              {/* Left Column - Form */}
              <div className="flex-1 overflow-y-auto p-8">
                <div className="flex flex-col gap-6">
                  {/* Order Summary Card */}
                  <div className="rounded-lg border border-gray-200 p-4">
                    <h3 className="mb-4 text-sm font-bold text-gray-900">
                      Order summary
                    </h3>
                    <div className="grid grid-cols-[140px_1fr] gap-y-3 text-sm">
                      <span className="text-gray-500">Buyer</span>
                      <span className="font-medium text-gray-900">
                        Sampson & Sons LTD
                      </span>

                      <span className="text-gray-500">Order ID</span>
                      <span className="font-medium text-gray-900">ORD-001</span>

                      <span className="text-gray-500">Expected payment</span>
                      <span className="font-medium text-gray-900">
                        USD 2,000,000.00
                      </span>

                      <span className="text-gray-500">Payment method</span>
                      <span className="font-medium text-gray-900">
                        Bank Transfer
                      </span>
                    </div>
                  </div>

                  {/* Form Fields */}
                  <div className="flex flex-col gap-4">
                    <FormField
                      control={form.control}
                      name="bankStatementDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col gap-1.5 space-y-0">
                          <FormLabel className="text-xs font-medium text-gray-700">
                            Bank statement date
                          </FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-full justify-between border-none bg-[#F3F4F1] px-3 text-left font-normal hover:bg-[#F3F4F1]",
                                    !field.value && "text-muted-foreground",
                                  )}
                                >
                                  {field.value
                                    ? format(field.value, "PPP")
                                    : "Select date"}
                                  <IconChevronDown className="h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-[var(--radix-popover-trigger-width)] p-3"
                              align="start"
                            >
                              {/* Custom Calendar Header */}
                              <div className="mb-2 flex items-center justify-between">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setIsYearSelection(!isYearSelection)
                                  }
                                  className="flex items-center gap-1 rounded px-2 py-1 text-sm font-bold text-gray-900 hover:bg-gray-100"
                                >
                                  {format(currentMonth, "MMMM yyyy")}
                                  <IconChevronDown
                                    size={18}
                                    className={`text-green-500 transition-transform ${isYearSelection ? "rotate-180" : ""}`}
                                  />
                                </button>

                                {!isYearSelection && (
                                  <div className="flex gap-1">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setCurrentMonth(
                                          addMonths(currentMonth, -1),
                                        )
                                      }
                                      className="flex h-7 w-7 items-center justify-center rounded text-green-500 hover:bg-gray-100"
                                    >
                                      <IconChevronLeft size={18} />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setCurrentMonth(
                                          addMonths(currentMonth, 1),
                                        )
                                      }
                                      className="flex h-7 w-7 items-center justify-center rounded text-green-500 hover:bg-gray-100"
                                    >
                                      <IconChevronRight size={18} />
                                    </button>
                                  </div>
                                )}
                              </div>

                              {isYearSelection ? (
                                <div className="h-[300px] overflow-y-auto">
                                  <div className="grid grid-cols-3 gap-2">
                                    {years.map((year) => (
                                      <button
                                        key={year}
                                        type="button"
                                        onClick={() => handleYearSelect(year)}
                                        className={cn(
                                          "rounded py-2 text-sm hover:bg-gray-100",
                                          currentMonth.getFullYear() === year &&
                                            "bg-green-50 font-bold text-green-600",
                                        )}
                                      >
                                        {year}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              ) : (
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={(date) => {
                                    field.onChange(date);
                                    if (date) setCurrentMonth(date);
                                  }}
                                  month={currentMonth}
                                  onMonthChange={setCurrentMonth}
                                  initialFocus
                                  className="w-full rounded-md border-0 p-0 shadow-none"
                                  classNames={{
                                    months: "w-full flex space-y-4 flex-col",
                                    month: "space-y-4 w-full flex flex-col",
                                    caption: "hidden",
                                    caption_label: "hidden",
                                    nav: "hidden",
                                    month_caption: "hidden",
                                    nav_button: "hidden",
                                    table: "w-full border-collapse space-y-1",
                                    head_row: "flex w-full justify-between",
                                    row: "flex w-full mt-2 justify-between",
                                    head_cell:
                                      "text-muted-foreground w-9 font-normal text-[0.8rem] flex-1 text-center",
                                    cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20 text-center flex items-center justify-center flex-1",
                                    day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 w-full h-full flex items-center justify-center rounded-full",
                                  }}
                                  modifiersClassNames={{
                                    selected:
                                      "bg-green-600 text-white rounded-full hover:bg-green-700 hover:text-white focus:bg-green-600 focus:text-white",
                                    today:
                                      "bg-transparent border border-green-600 text-gray-900 rounded-full",
                                  }}
                                />
                              )}
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-[100px_1fr] gap-4">
                      <FormField
                        control={form.control}
                        name="currency"
                        render={({ field }) => (
                          <FormItem className="flex flex-col gap-1.5 space-y-0">
                            <FormLabel className="text-xs font-medium text-gray-700">
                              Currency
                            </FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="w-full border-none bg-[#F3F4F1]">
                                  {field.value}
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="USD">USD ($)</SelectItem>
                                <SelectItem value="GHS">GHS (₵)</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="amountReceived"
                        render={({ field }) => (
                          <FormItem className="flex flex-col gap-1.5 space-y-0">
                            <FormLabel className="text-xs font-medium text-gray-700">
                              Amount received
                            </FormLabel>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                                $
                              </span>
                              <FormControl>
                                <Input
                                  placeholder="Enter amount"
                                  className="border-none bg-[#F3F4F1] pl-7"
                                  {...field}
                                />
                              </FormControl>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="transactionReference"
                      render={({ field }) => (
                        <FormItem className="flex flex-col gap-1.5 space-y-0">
                          <FormLabel className="text-xs font-medium text-gray-700">
                            Transaction reference number
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Transaction reference number"
                              className="border-none bg-[#F3F4F1]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="bankName"
                      render={({ field }) => (
                        <FormItem className="flex flex-col gap-1.5 space-y-0">
                          <FormLabel className="text-xs font-medium text-gray-700">
                            Bank name
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter bank name"
                              className="border-none bg-[#F3F4F1]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="bankAccount"
                      render={({ field }) => (
                        <FormItem className="flex flex-col gap-1.5 space-y-0">
                          <FormLabel className="text-xs font-medium text-gray-700">
                            Bank account
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Account number"
                              className="border-none bg-[#F3F4F1]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="nameOnAccount"
                      render={({ field }) => (
                        <FormItem className="flex flex-col gap-1.5 space-y-0">
                          <FormLabel className="text-xs font-medium text-gray-700">
                            Name on account
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Name on account"
                              className="border-none bg-[#F3F4F1]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormUpload
                      name="proofOfPayment"
                      label="Proof of payment"
                      accept={{ "application/pdf": [".pdf"] }}
                      uploadFunction={uploadFunction}
                      className="flex flex-col gap-1.5 space-y-0 [&_label]:text-xs [&_label]:font-medium [&_label]:text-gray-700"
                      dropzoneProps={{
                        className:
                          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 p-6 hover:bg-gray-50 border-gray-300 min-h-[auto]",
                        title: "Upload",
                        description: "PDF, JPEG, or PNG less than 10MB",
                        icon: (
                          <IconCloudUpload
                            size={20}
                            className="text-green-600"
                          />
                        ),
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Right Column - Document Preview */}
              <div className="flex-1 overflow-y-auto bg-gray-50 p-8">
                {proofOfPayment ? (
                  proofOfPayment
                    .toLowerCase()
                    .match(/\.(jpeg|jpg|png|gif)$/) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={proofOfPayment}
                      alt="Proof of Payment"
                      className="h-full w-full rounded-lg border border-gray-200 bg-white object-contain p-4 shadow-sm"
                    />
                  ) : (
                    <iframe
                      src={proofOfPayment + "#toolbar=0&navpanes=0&scrollbar=0"}
                      className="h-full w-full rounded-lg border border-gray-200 bg-white shadow-sm"
                      title="Proof of Payment"
                    />
                  )
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-gray-200 bg-gray-50 p-8 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                      <IconFileDescription
                        size={24}
                        className="text-gray-400"
                      />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-900">
                        No document preview
                      </p>
                      <p className="text-xs text-gray-500">
                        Upload a proof of payment to see a preview here
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <DialogFooter className="border-t p-4">
              <div className="flex w-full items-center justify-between">
                <Button
                  type="button"
                  variant="secondary"
                  className="bg-[#F3F4F1] text-gray-700 hover:bg-gray-200"
                  onClick={onClose}
                >
                  Cancel
                </Button>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="destructive"
                    className="flex w-[180px] items-center justify-center gap-2 rounded-[12px] bg-[#FFDAD6] px-[40px] py-[12px] text-red-600 hover:bg-[#ffb4ab]"
                    onClick={() => setIsRejectDialogOpen(true)}
                  >
                    Reject
                  </Button>
                  <Button
                    type="submit"
                    disabled={!isValid}
                    className={cn(
                      "flex w-[180px] items-center justify-center gap-2 rounded-[12px] px-[40px] py-[12px] text-white transition-colors",
                      isValid
                        ? "bg-[#36B92E] hover:bg-[#2da126]"
                        : "bg-[#A6E6A1] hover:bg-[#95cf90]",
                    )}
                  >
                    Verify payment
                  </Button>
                </div>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>

      <AlertDialog
        open={isConfirmDialogOpen}
        onOpenChange={setIsConfirmDialogOpen}
      >
        <AlertDialogContent className="max-w-[480px] gap-8 rounded-[24px] p-8">
          <AlertDialogHeader className="space-y-3">
            <AlertDialogTitle className="text-center text-xl font-bold text-[#1A1C19]">
              Verify payment
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-sm text-[#5E605C]">
              Please review the payment details before you continue.
              <br />
              Are you sure you want to verify this payment?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex w-full flex-row gap-3 sm:justify-center">
            <AlertDialogCancel className="mt-0 h-[48px] flex-1 rounded-[12px] border-none bg-[#F1F2EE] text-base font-bold text-[#1A1C19] hover:bg-[#e4e5e1]">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmPayment}
              className="h-[48px] flex-1 rounded-[12px] bg-[#36B92E] text-base font-bold text-white hover:bg-[#2da126]"
            >
              Verify payment
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent className="gap-0 overflow-hidden rounded-[24px] border-none p-0 sm:max-w-[480px]">
          <div className="relative flex items-center justify-center border-b border-gray-100 p-6">
            <div className="absolute left-6 flex items-center">
              <button
                onClick={() => setIsRejectDialogOpen(false)}
                className="mr-4 outline-none"
              >
                <IconX
                  size={24}
                  className="text-gray-500 hover:text-gray-700"
                />
              </button>
              <div className="h-6 w-px bg-gray-200" />
            </div>
            <h2 className="text-lg font-bold text-[#1A1C19]">Reject payment</h2>
          </div>

          <div className="p-8">
            <div className="mb-8">
              <span className="mb-2 block text-sm font-medium text-[#1A1C19]">
                Reason for rejection
              </span>
              <Textarea
                placeholder="Reason for rejection"
                className="min-h-[140px] w-full resize-none rounded-[12px] border-none bg-[#F1F2EE] p-4 text-base placeholder:text-[#8D8F8C] focus-visible:ring-1 focus-visible:ring-gray-300"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
            </div>

            <Button
              className={cn(
                "h-[48px] w-full rounded-[12px] text-base font-bold text-white transition-colors",
                rejectionReason
                  ? "bg-[#36B92E] hover:bg-[#2da126]"
                  : "bg-[#A6E6A1] hover:bg-[#95cf90]",
              )}
              onClick={() => {
                if (onPaymentRejected && rejectionReason) {
                  onPaymentRejected(rejectionReason);
                  setIsRejectDialogOpen(false);
                  onClose();
                }
              }}
            >
              Reject payment
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}
