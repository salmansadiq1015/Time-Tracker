'use client';

import { Button } from '@/components/ui/button';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

interface AdvancedPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

export function AdvancedPagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
}: AdvancedPaginationProps) {
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;
    const halfWindow = Math.floor(maxVisible / 2);

    let startPage = Math.max(1, currentPage - halfWindow);
    const endPage = Math.min(totalPages, startPage + maxVisible - 1);

    // Adjust start if we're near the end
    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    // Add first page if not visible
    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) {
        pages.push('...');
      }
    }

    // Add page numbers in range
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    // Add last page if not visible
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push('...');
      }
      pages.push(totalPages);
    }

    return pages;
  };

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between sm:gap-4">
      {/* <div className="text-sm text-muted-foreground">
        Showing {startItem} to {endItem} of {totalItems} items
      </div> */}

      <Pagination>
        <PaginationContent className="flex-wrap">
          <PaginationItem>
            <Button
              variant="outline"
              onClick={() => onPageChange(1)}
              disabled={currentPage === 1}
              className="text-xs sm:text-sm bg-[#1e2339] border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white disabled:opacity-50"
            >
              First
            </Button>
          </PaginationItem>

          <PaginationItem>
            <PaginationPrevious
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              className={`${currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'} bg-[#1e2339] border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white`}
            />
          </PaginationItem>

          {getPageNumbers().map((page, index) => (
            <PaginationItem key={`${page}-${index}`}>
              {page === '...' ? (
                <PaginationEllipsis className="text-gray-400" />
              ) : (
                <PaginationLink
                  onClick={() => onPageChange(page as number)}
                  isActive={page === currentPage}
                  className={`cursor-pointer ${
                    page === currentPage
                      ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600'
                      : 'bg-[#1e2339] border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  {page}
                </PaginationLink>
              )}
            </PaginationItem>
          ))}

          <PaginationItem>
            <PaginationNext
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              className={`${
                currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'
              } bg-[#1e2339] border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white`}
            />
          </PaginationItem>

          <PaginationItem>
            <Button
              variant="outline"
              onClick={() => onPageChange(totalPages)}
              disabled={currentPage === totalPages}
              className="text-xs sm:text-sm bg-[#1e2339] border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white disabled:opacity-50"
            >
              Last
            </Button>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
