"use client";

import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import "@react-pdf-viewer/full-screen/lib/styles/index.css";
import "./pdf-overrides.css";

import { Button } from "@cf/ui";
import { toast } from "@cf/ui/components/sonner";
import { getFilePlugin } from "@react-pdf-viewer/get-file";
import { pageNavigationPlugin } from "@react-pdf-viewer/page-navigation";
import { printPlugin } from "@react-pdf-viewer/print";
import { IconDownload, IconEye, IconPrinter, IconX } from "@tabler/icons-react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import React, { useState } from "react";
const PDFViewer = dynamic(
  () => import("@react-pdf-viewer/core").then((mod) => mod.Viewer),
  {
    ssr: false, // This ensures the component is only rendered on the client
  },
);

const PDFWorker = dynamic(
  () => import("@react-pdf-viewer/core").then((mod) => mod.Worker),
  {
    ssr: false,
  },
);

export default function ViewInvoiceButton() {
  const t = useTranslations();

  const EXAMPLE_PDF =
    "https://ontheline.trincoll.edu/images/bookdown/sample-local-pdf.pdf";
  const [isPdfViewOpen, setIsPdfViewOpen] = useState(false);

  const getFilePluginInstance = getFilePlugin({
    fileNameGenerator: () => "complete-farmer_proforma-invoice",
  });
  const pageNavigationPluginInstance = pageNavigationPlugin();
  const printPluginInstance = printPlugin();

  React.useEffect(() => {
    if (!isPdfViewOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsPdfViewOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isPdfViewOpen]);

  React.useEffect(() => {
    if (!isPdfViewOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isPdfViewOpen]);

  return (
    <>
      <Button
        onClick={() => {
          setIsPdfViewOpen(!isPdfViewOpen);
        }}
        className="h-[56px] rounded-xl bg-[#F5F5F5] font-bold text-[hsl(var(--text-dark))] hover:bg-[#F5F5F5] hover:text-[hsl(var(--text-dark))] focus:bg-[#F5F5F5] focus:text-[hsl(var(--text-dark))]"
      >
        <IconEye className="!size-5 text-[#161D1D]" />
        <span className="font-bold">
          {t("sourcing.offerReview.viewInvoice")}
        </span>
      </Button>

      {isPdfViewOpen && (
        <div
          className="fixed inset-0 z-50 overscroll-contain"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="absolute inset-0 bg-black/50 pb-12"
            role="button"
            tabIndex={0}
            aria-label="Close PDF viewer"
            onClick={() => setIsPdfViewOpen(false)}
            onKeyDown={(e) => {
              if (e.key === "Escape" || e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setIsPdfViewOpen(false);
              }
            }}
          />
          <div className="relative z-10 mx-auto flex h-full w-full flex-col items-stretch">
            <div className="z-10 mb-6 flex w-full flex-row items-center justify-between bg-[#3c3c3c] px-6 py-4 text-white">
              <span className="font-bold">Balance Sheet</span>

              <div className="flex flex-row items-center gap-x-2 font-medium">
                <pageNavigationPluginInstance.CurrentPageLabel>
                  {({ currentPage, numberOfPages }) => (
                    <div className="flex items-center gap-x-2">
                      <input
                        key={currentPage}
                        type="number"
                        min={1}
                        max={numberOfPages}
                        aria-label="Go to page"
                        defaultValue={currentPage + 1}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            const value = Number(
                              (e.target as HTMLInputElement).value,
                            );
                            if (
                              Number.isFinite(value) &&
                              value >= 1 &&
                              value <= numberOfPages
                            ) {
                              pageNavigationPluginInstance.jumpToPage(
                                value - 1,
                              );
                            }
                          }
                        }}
                        className="h-8 w-10 bg-[#1e1e1e] px-2 text-center text-white  outline-none [appearance:textfield] focus:border-white/60 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0"
                      />
                      <span>/ {numberOfPages}</span>
                    </div>
                  )}
                </pageNavigationPluginInstance.CurrentPageLabel>
              </div>

              <div className="flex flex-row items-center gap-x-1">
                <getFilePluginInstance.Download>
                  {(props) => (
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Download PDF"
                      onClick={(e) => {
                        props.onClick(e);

                        toast.success(
                          t("sourcing.offerReview.downloadSuccessful"),
                          {
                            style: {
                              background: "#161d1d",
                              color: "#ffffff",
                              width: "fit-content",
                            },
                            position: "top-center",
                          },
                        );
                      }}
                      className="text-white hover:bg-white/10"
                    >
                      <IconDownload className="!size-5" />
                    </Button>
                  )}
                </getFilePluginInstance.Download>

                <printPluginInstance.Print>
                  {(props) => (
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Print PDF"
                      onClick={props.onClick}
                      className="text-white hover:bg-white/10"
                    >
                      <IconPrinter className="!size-5" />
                    </Button>
                  )}
                </printPluginInstance.Print>

                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Close PDF viewer"
                  onClick={() => setIsPdfViewOpen(false)}
                  className="text-white hover:bg-white/10"
                >
                  <IconX className="!size-5" />
                </Button>
              </div>
            </div>

            <PDFWorker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
              <div className="mx-auto h-[300px] w-1/2 flex-1 border-none">
                <PDFViewer
                  fileUrl={EXAMPLE_PDF}
                  pageLayout={{
                    buildPageStyles: () => ({
                      backgroundColor: "transparent",
                    }),
                  }}
                  plugins={[
                    pageNavigationPluginInstance,
                    getFilePluginInstance,
                    printPluginInstance,
                  ]}
                />
              </div>
            </PDFWorker>
          </div>
        </div>
      )}
    </>
  );
}
