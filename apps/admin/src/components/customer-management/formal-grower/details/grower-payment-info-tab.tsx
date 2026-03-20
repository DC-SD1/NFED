"use client";

export default function GrowerPaymentInfoTab() {
  return (
    <div className={"flex flex-col px-6 pb-4"}>
      <div className={"flex flex-col gap-4 py-3"}>
        <p className={"font-bold"}>Mobile money</p>
        <hr />
        <p>Mobile money details will appear here once provided by the grower</p>
      </div>
      <div className={"-mx-6 my-4 h-2 bg-[#F3F7F2]"} />
      <div className={"flex flex-col gap-4 py-3"}>
        <p className={"font-bold"}>Bank details</p>
        <hr />
        <p>Bank details will appear here once provided by the grower</p>
      </div>
    </div>
  );
}
