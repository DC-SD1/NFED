import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Badge,
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@cf/ui";
import {
  IconCheck,
  IconChevronRight,
  IconCircleX,
  IconDownload,
  IconEye,
  IconFileInvoice,
  IconLeaf,
  IconPencil,
  IconX,
} from "@tabler/icons-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import React from "react";

import { showSuccessToast } from "@/lib/utils/toast";

interface PaymentDetailsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  status?: "verified" | "rejected" | null;
  rejectionReason?: string;
}

// eslint-disable-next-line max-lines-per-function
export default function PaymentDetailsSheet({
  isOpen,
  onClose,
  status,
  rejectionReason,
}: PaymentDetailsSheetProps) {
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = React.useState(false);
  const [isConfirmed, setIsConfirmed] = React.useState(false);
  const [isPreviewReceiptOpen, setIsPreviewReceiptOpen] = React.useState(false);

  const handleConfirm = () => {
    setIsConfirmDialogOpen(false);
    setIsConfirmed(true);
    showSuccessToast("Order payment has been confirmed");
  };

  const handleDownloadReceipt = async () => {
    const input = document.getElementById("payment-receipt-content");
    if (!input) return;

    try {
      const canvas = await html2canvas(input, {
        scale: 2, // Higher scale for better quality
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      // const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      // const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);

      // const imgX = (pdfWidth - imgWidth * ratio) / 2;
      // const imgY = 20; // Padding top

      // Use a fixed width for the image in PDF if needed, or fit to page
      // Here we fit width with some margin
      const margin = 10;
      const finalImgWidth = pdfWidth - margin * 2;
      const finalRatio = finalImgWidth / imgWidth;
      const finalImgHeight = imgHeight * finalRatio;

      pdf.addImage(
        imgData,
        "PNG",
        margin,
        margin,
        finalImgWidth,
        finalImgHeight,
      );
      pdf.save("payment-receipt.pdf");
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        className="flex w-full flex-col gap-0 p-0 sm:max-w-md [&>button]:hidden"
        overlayClassName="bg-black/10 backdrop-blur-sm"
      >
        {/* Header */}
        <SheetHeader className="relative flex flex-row items-center justify-center space-y-0 border-b border-gray-100 p-6 pb-2">
          <button onClick={onClose} className="absolute left-6 outline-none">
            <IconX size={24} className="text-gray-500 hover:text-gray-700" />
          </button>
          <SheetTitle>Payment details</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="mb-2 flex items-center gap-3">
            <h2 className="text-2xl font-bold text-gray-900">TRR-001</h2>
            <Badge
              variant="outline"
              className="flex items-center gap-1 rounded-md border-blue-200 bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700"
            >
              <div className="h-1.5 w-1.5 rounded-full bg-blue-700" />
              30% paid
            </Badge>
            {status === "rejected" ? (
              <Badge
                variant="outline"
                className="flex items-center gap-1 rounded-md border-red-200 bg-red-50 px-2 py-1 text-xs font-medium text-red-700"
              >
                <IconCircleX size={12} />
                Rejected
              </Badge>
            ) : isConfirmed ? (
              <>
                <Badge
                  variant="outline"
                  className="flex items-center gap-1 rounded-md border-green-200 bg-green-50 px-2 py-1 text-xs font-medium text-green-700"
                >
                  <IconCheck size={12} />
                  Confirmed
                </Badge>
                <Button
                  variant="outline"
                  className="ml-auto flex h-8 items-center gap-1 rounded-lg border-gray-200 bg-white px-3 text-xs font-bold text-[#1A5514] hover:bg-gray-50"
                >
                  <IconPencil size={14} />
                  Update
                </Button>
              </>
            ) : null}
          </div>
          <div className="-mx-6 mb-2 h-px bg-[#F3F7F2]" />

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="-mx-6 flex h-auto w-[calc(100%+48px)] rounded-none border-b bg-transparent p-0">
              <TabsTrigger
                value="overview"
                className="flex-1 rounded-none border-b-2 border-transparent px-0 pb-2 text-sm font-medium text-gray-500 data-[state=active]:border-[#1A5514] data-[state=active]:text-[#1A5514]"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="timelines"
                className="flex-1 rounded-none border-b-2 border-transparent px-0 pb-2 text-sm font-medium text-gray-500 data-[state=active]:border-[#1A5514] data-[state=active]:text-[#1A5514]"
              >
                Payment timelines
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6 space-y-6">
              {status === "rejected" && rejectionReason && (
                <div className="-mx-6 mb-6 bg-[#FFF4E6] px-6 py-4">
                  <h4 className="mb-1 text-xs font-bold text-[#9D5D00]">
                    Reason for rejection
                  </h4>
                  <p className="text-sm font-medium text-[#9D5D00]">
                    {rejectionReason}
                  </p>
                </div>
              )}
              {/* Amount Paid Section */}
              <div>
                <p className="mb-1 text-sm text-gray-500">Amount Paid</p>
                <p className="text-2xl font-bold text-gray-900">
                  GHS 10,000.00
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">
                    Reference number
                  </span>
                  <span className="text-sm font-medium text-gray-900">
                    1325-12423-1290
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">
                    Bank statement date
                  </span>
                  <span className="text-sm font-medium text-gray-900">
                    28 Oct 2025 - 11:53 PM
                  </span>
                </div>
              </div>

              <div className="-mx-6 mb-6 h-[8px] bg-[#F3F7F2]" />

              {/* Account Details */}
              <div className="pt-0">
                <h3 className="mb-4 text-sm font-semibold text-gray-900">
                  Account details
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">
                      Selected method
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      Bank transfer
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Bank country</span>
                    <span className="text-sm font-medium text-gray-900">
                      Bank transfer
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Bank name</span>
                    <span className="text-sm font-medium text-gray-900">
                      Ecobank Ghana
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">
                      Account number
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      - 2345
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">
                      Name on account
                    </span>
                    <span className="text-sm font-medium uppercase text-gray-900">
                      SAMPSON & SONS LTD
                    </span>
                  </div>
                </div>
              </div>

              <div className="-mx-6 mb-6 h-[8px] bg-[#F3F7F2]" />

              {/* Payment Documents */}
              <div className="pt-0">
                <div className="mb-4 flex items-start justify-between">
                  <h3 className="text-sm font-semibold text-gray-900">
                    Payment documents
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 bg-[#E8F3E5] text-xs font-bold leading-5 text-[#1A5514] hover:bg-[#d9ead6]"
                  >
                    Download
                  </Button>
                </div>

                <div className="flex items-center justify-between rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <Checkbox className="mr-2 border-gray-300 data-[state=checked]:border-[#1A5514] data-[state=checked]:bg-[#1A5514]" />
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-500">
                        Proof of payment
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        Ecobank_receipt.pdf
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 gap-2 bg-[#E8F3E5] text-sm font-bold leading-5 text-[#1A5514] hover:bg-[#d9ead6]"
                  >
                    <IconEye size={14} />
                    View
                  </Button>
                </div>
              </div>

              <div className="-mx-6 mb-6 h-[8px] bg-[#F3F7F2]" />

              {/* Order Summary */}
              <div className="pt-0">
                <h3 className="mb-4 text-sm font-semibold text-gray-900">
                  Order summary
                </h3>
                <div className="mb-6 space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Order ID</span>
                    <span className="text-sm font-medium text-gray-900">
                      ORD-001
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Quantity</span>
                    <span className="text-sm font-medium text-gray-900">
                      5000 MT
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">
                      Expected payment
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      USD 2,000,000.00
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Crop</span>
                    <span className="text-sm font-medium text-gray-900">
                      Chilli Pepper
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Variety</span>
                    <span className="text-sm font-medium text-gray-900">
                      Red Bird&apos;s Eye
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">
                      Delivery window
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      12-31 Oct 2025
                    </span>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  className="flex h-[36px] w-full items-center justify-center gap-2 rounded-[8px] bg-[#EDF0E6] px-3 py-2 font-bold text-[#1A5514] hover:bg-[#e0e4da]"
                >
                  View detail
                  <IconChevronRight size={16} />
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="timelines" className="mt-8 px-6">
              <div className="relative">
                {/* Vertical Dashed Line */}
                <div className="absolute left-[5px] top-3 h-[calc(100%-40px)] w-px border-l-2 border-dashed border-gray-200" />

                <div className="space-y-0">
                  {/* Item 2 */}
                  <div className="relative flex gap-6 pb-6">
                    <div className="flex flex-col items-center">
                      {/* Dot */}
                      <div className="z-10 mt-1.5 h-3 w-3 rounded-full bg-gray-400 ring-4 ring-white" />
                    </div>
                    <div className="flex-1 border-b border-gray-100 pb-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="mb-2 font-medium text-gray-900">
                            Payment #2
                          </h4>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>25 Oct 2025 - 04:00 PM</span>
                            <span className="text-gray-300">|</span>
                            <div className="flex items-center gap-1.5">
                              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#153F2D] text-[10px] font-bold text-white">
                                J
                              </div>
                              <span className="font-bold text-gray-900">
                                John Doe
                              </span>
                            </div>
                          </div>
                        </div>
                        <IconChevronRight
                          size={18}
                          className="text-[#1A5514]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Item 1 */}
                  <div className="relative flex gap-6 pt-2">
                    <div className="flex flex-col items-center">
                      {/* Dot */}
                      <div className="z-10 mt-1.5 h-3 w-3 rounded-full bg-gray-400 ring-4 ring-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="mb-2 font-medium text-gray-900">
                            Payment #1
                          </h4>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>25 Oct 2025 - 04:00 PM</span>
                            <span className="text-gray-300">|</span>
                            <div className="flex items-center gap-1.5">
                              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#153F2D] text-[10px] font-bold text-white">
                                J
                              </div>
                              <span className="font-bold text-gray-900">
                                John Doe
                              </span>
                            </div>
                          </div>
                        </div>
                        <IconChevronRight
                          size={18}
                          className="text-[#1A5514]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer */}
        {status !== "rejected" && (
          <SheetFooter className="border-t border-gray-100 p-6 sm:justify-center">
            {!isConfirmed ? (
              <Button
                className="flex w-full flex-1 items-center justify-center gap-2 rounded-[12px] bg-[#36B92E] px-8 py-3 text-base font-bold text-white hover:bg-[#2da126]"
                onClick={() => setIsConfirmDialogOpen(true)}
              >
                Confirm payment
              </Button>
            ) : (
              <div className="flex w-full justify-end">
                <Button
                  variant="ghost"
                  className="flex h-[48px] items-center justify-center gap-2 rounded-[12px] bg-[#E8F3E5] px-6 py-3 font-bold text-[#1A5514] hover:bg-[#d9ead6]"
                  onClick={() => setIsPreviewReceiptOpen(true)}
                >
                  <IconFileInvoice size={20} />
                  Generate receipt
                </Button>
              </div>
            )}
          </SheetFooter>
        )}
      </SheetContent>

      <AlertDialog
        open={isConfirmDialogOpen}
        onOpenChange={setIsConfirmDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader className="space-y-3">
            <AlertDialogTitle className="text-center text-xl font-bold text-[#1A1C19]">
              Confirm Buyer payment
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-sm text-[#5E605C]">
              Are you sure you want to confirm this payout?
              <br />
              This action cannot be undone once the payment has been confirmed
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex w-full flex-row gap-3 sm:justify-center">
            <AlertDialogCancel className="mt-0 h-[48px] flex-1 rounded-[12px] border-none bg-[#F1F2EE] text-base font-bold text-[#1A1C19] hover:bg-[#e4e5e1]">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="h-[48px] flex-1 rounded-[12px] bg-[#36B92E] text-base font-bold text-white hover:bg-[#2da126]"
              onClick={handleConfirm}
            >
              Confirm payment
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog
        open={isPreviewReceiptOpen}
        onOpenChange={setIsPreviewReceiptOpen}
      >
        <DialogContent className="flex h-[90vh] max-w-[700px] flex-col gap-0 overflow-hidden rounded-[8px] border-none bg-[#F3F4F1] p-0">
          {/* Header */}
          <div className="relative flex shrink-0 items-center justify-center border-b border-gray-100 bg-white p-4">
            <div className="absolute left-6 top-1/2 flex -translate-y-1/2 items-center gap-4">
              <button
                onClick={() => setIsPreviewReceiptOpen(false)}
                className="rounded-md p-1 outline-none transition-colors hover:bg-gray-100"
              >
                <IconX size={20} className="text-gray-500" />
              </button>
              <div className="h-6 w-px bg-gray-200" />
            </div>
            <h2 className="text-lg font-bold text-[#1A1C19]">
              Preview payment receipt
            </h2>
          </div>

          {/* Content Body (Grey bg) */}
          <div className="flex grow justify-center overflow-y-auto p-8">
            {/* Receipt Paper */}
            <div
              id="payment-receipt-content"
              className="flex min-h-[842px] w-full max-w-[595px] flex-col bg-white p-12 shadow-sm"
            >
              {/* Receipt Header */}
              <div className="flex items-start justify-between gap-8 pb-6">
                {/* Logo */}
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#36B92E]">
                    <IconLeaf size={24} className="text-white" fill="white" />
                  </div>
                  <div className="flex flex-col leading-none">
                    <span className="text-xl font-bold text-[#153F2D]">
                      complete
                    </span>
                    <span className="text-xl font-bold text-[#153F2D]">
                      farmer
                    </span>
                  </div>
                </div>

                <div className="flex gap-12 text-[10px] text-gray-600">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-[#153F2D]">
                      Complete Farmer Limited - Ghana
                    </p>
                    <p>11 Molade-Akiwumi Street, Accra,</p>
                    <p>Greater Accra 00233, GHANA</p>
                  </div>
                  <div className="space-y-1">
                    <p>+233556710427</p>
                    <p>accounts@completefarmer.com</p>
                    <p>www.completefarmer.com</p>
                  </div>
                </div>
              </div>

              {/* Green Line */}
              <div className="mb-8 h-px w-full bg-[#153F2D]" />

              <div className="mb-8">
                <h3 className="mb-6 text-2xl font-bold text-[#36B92E]">
                  Receipt
                </h3>
                <div className="flex justify-between text-xs">
                  <div className="space-y-2">
                    <p className="uppercase tracking-wide text-gray-400">
                      BILL TO
                    </p>
                    <p className="text-sm font-bold text-gray-900">
                      ASUTIFI PROCESSING & SERVICES CENTRE LTD (GOASO)
                    </p>
                  </div>
                  <div className="space-y-2 text-right">
                    <div className="flex gap-8">
                      <p className="uppercase tracking-wide text-gray-400">
                        DATE
                      </p>
                      <p className="font-bold text-gray-900">27/09/2025</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content Table */}
              <div className="mb-auto">
                <div className="flex rounded-t-sm bg-[#005C46] px-4 py-3 text-[10px] font-bold uppercase text-white">
                  <div className="w-16">ITEM</div>
                  <div className="flex-1 text-center">INVOICE NUMBER</div>
                  <div className="flex-1 text-center">INVOICE DATE</div>
                  <div className="w-32 text-right">PAYMENT</div>
                </div>
                <div className="flex px-4 py-6 text-xs text-gray-700">
                  <div className="w-16">01</div>
                  <div className="flex-1 text-center">AP09001</div>
                  <div className="flex-1 text-center">11/09/2025</div>
                  <div className="w-32 text-right">60,000.00</div>
                </div>
                <div className="w-full border-b border-dotted border-gray-300" />
              </div>

              <div className="flex justify-end pb-12 pt-8">
                <div className="flex items-center gap-12 text-xs">
                  <span className="uppercase tracking-wide text-gray-400">
                    BALANCE DUE
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    GHS 100,000.00
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex shrink-0 justify-end gap-3 border-t border-gray-100 bg-white p-4">
            <Button
              variant="outline"
              className="h-[40px] gap-2 rounded-[8px] border-none bg-[#F3F4F1] font-bold text-[#1A1C19] hover:bg-gray-200"
              onClick={handleDownloadReceipt}
            >
              <IconDownload size={18} />
              Download receipt
            </Button>
            <Button className="h-[40px] rounded-[8px] bg-[#36B92E] px-6 font-bold text-white hover:bg-[#2da126]">
              Send to buyer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Sheet>
  );
}
