package com.example.demo.inventory.Sales;


import com.example.demo.inventory.SaleItem.SaleItemDto;
import lombok.Data;

import java.util.List;

@Data
public class SaleRequestDto {
    private Long customerId;
    private List<SaleItemDto> items;
}