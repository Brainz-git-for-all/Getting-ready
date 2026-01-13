package com.example.demo.inventory.Sales;



import com.example.demo.inventory.SaleItem.SaleItemDto;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
// DTO for the response after creating a sale
public class SaleResponseDto {
    private Long saleId;
    private Long customerId;
    private LocalDateTime saleDate;
    private List<SaleItemDto> items;
    private double totalPrice;



}