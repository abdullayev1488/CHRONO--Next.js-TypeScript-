"use client";

import { useState, type ReactNode } from "react";
import { Search } from "lucide-react";
import { CustomerDetailsModal } from "@/admin/components/CustomerDetailsModal";
import { Pagination } from "@/admin/components/Pagination";
import { useCustomers } from "@/admin/hooks/useCustomers";
import { useDebouncedValue } from "@/admin/hooks/useDebouncedValue";
import type { Customer } from "@/admin/types/customers";
import { formatDate, formatMoney } from "@/admin/utils/format";

const PAGE_SIZE = 10;

const TABLE_HEADINGS = ["Customer", "Email", "Orders", "Total Spent", "Joined"];

const Message = ({
  children,
  tone = "text-[#777]",
}: {
  children: ReactNode;
  tone?: string;
}) => (
  <div className={`border border-[#E8E2D8] bg-white p-8 text-center text-[13px] ${tone}`}>
    {children}
  </div>
);

export const CustomersPage = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const debouncedSearch = useDebouncedValue(search.trim());

  const { data, isLoading, isError, isFetching } = useCustomers({
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch || undefined,
  });

  const customers = data?.customers ?? [];

  return (
    <div className="mx-auto w-full max-w-[1600px] px-5 pb-8 pt-6 sm:px-6 md:px-8">
      <div className="mb-7">
        <h1 className="font-serif text-[30px] text-[#171717]">Customers</h1>
        <p className="mt-1 text-[12px] text-[#777]">
          Registered store customers (guest checkouts appear in Orders only)
        </p>
      </div>

      <div className="relative mb-5 max-w-[420px]">
        <Search size={16} className="pointer-events-none absolute left-3 top-3 text-[#999]" />
        <input
          type="search"
          aria-label="Search customers"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          placeholder="Search by name or email"
          className="h-10 w-full border border-[#E8E2D8] bg-white pl-9 pr-3 text-[12px] outline-none placeholder:text-[#AAA] focus:border-[#B08D57]"
        />
      </div>

      {isLoading && <Message>Loading customers...</Message>}

      {isError && <Message tone="text-red-600">Failed to load customers.</Message>}

      {!isLoading && !isError && customers.length === 0 && (
        <Message>
          {debouncedSearch ? "No customers match your search." : "No registered customers yet."}
        </Message>
      )}

      {data && customers.length > 0 && (
        <div className={isFetching ? "opacity-70 transition-opacity" : "transition-opacity"}>
          {/* DESKTOP TABLE */}
          <div className="hidden overflow-hidden border border-[#E8E2D8] bg-white md:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left">
                <thead className="bg-[#F7F4EE]">
                  <tr>
                    {TABLE_HEADINGS.map((title) => (
                      <th key={title} className="px-5 py-4 text-[12px] font-medium text-[#666]">
                        {title}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {customers.map((customer) => (
                    <tr
                      key={customer._id}
                      onClick={() => setSelectedCustomer(customer)}
                      className="cursor-pointer border-t border-[#E8E2D8] transition-colors hover:bg-[#FAF8F4]"
                    >
                      <td className="px-5 py-4 text-[13px] font-medium text-[#171717]">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            setSelectedCustomer(customer);
                          }}
                          className="cursor-pointer text-left hover:text-[#B08D57]"
                        >
                          {customer.firstName} {customer.lastName}
                        </button>
                      </td>
                      <td className="px-5 py-4 text-[12px] text-[#555]">{customer.email}</td>
                      <td className="px-5 py-4 text-[12px]">{customer.ordersCount}</td>
                      <td className="px-5 py-4 text-[12px] font-medium">
                        {formatMoney(customer.totalSpent)}
                      </td>
                      <td className="px-5 py-4 text-[12px] text-[#777]">
                        {formatDate(customer.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* MOBILE CARDS */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {customers.map((customer) => (
              <button
                key={customer._id}
                type="button"
                onClick={() => setSelectedCustomer(customer)}
                className="min-w-0 cursor-pointer border border-[#E8E2D8] bg-white p-4 text-left"
              >
                <p className="text-[13px] font-medium text-[#171717]">
                  {customer.firstName} {customer.lastName}
                </p>
                <p className="mt-1 break-all text-[12px] text-[#555]">{customer.email}</p>

                <div className="mt-3 flex items-center justify-between border-t border-[#E8E2D8] pt-3 text-[12px]">
                  <span className="text-[#777]">{customer.ordersCount} orders</span>
                  <span className="font-semibold text-[#171717]">
                    {formatMoney(customer.totalSpent)}
                  </span>
                </div>
              </button>
            ))}
          </div>

          <Pagination page={data.page} pages={data.pages} total={data.total} onChange={setPage} />
        </div>
      )}

      <CustomerDetailsModal
        customer={selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
      />
    </div>
  );
};
