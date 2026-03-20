export type Invoice = {
    invoiceId: string;
    buyer: string;
    amount: string;
    submittedOn: string;
    status: "Paid" | "Pending" | "Overdue";
};

export type Refund = {
    transactionId: string;
    userType: string;
    name: string;
    invoiceId: string;
    amount: string;
    reason: string;
    requestedOn: string;
    status: "Success" | "Pending" | "Failed";
};

export type Column<T> = {
    id: string;
    label: string;
    align?: "left" | "right" | "center";
    render: (row: T) => React.ReactNode;
};

export type TableProps<T> = {
    columns: Column<T>[];
    data: T[];
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    itemsPerPage: number;
    totalItems: number;
    onViewDetail: (row: T) => void;
    getRowId: (row: T) => string;
};