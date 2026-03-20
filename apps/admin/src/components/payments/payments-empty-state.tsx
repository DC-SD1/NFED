import Image from "next/image";
import React from "react";

export default function PaymentsEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="mb-6 flex items-center justify-center">
        <Image
          src="/images/empty-payments.png"
          alt="No payments available"
          width={200}
          height={160}
          className="object-contain"
        />
      </div>
      <h3 className="mb-2 text-lg font-bold text-gray-900">
        No payments available
      </h3>
      <p className="text-sm text-gray-500">
        All payments will be displayed when available
      </p>
    </div>
  );
}
