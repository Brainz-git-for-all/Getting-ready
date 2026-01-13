package com.example.demo.inventory.Sales;



import com.example.demo.inventory.SaleItem.SaleItemDto;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;


// DTO for the response after creating a sale
public class SaleResponseDto {
    private Long saleId;
    private Long customerId;
    private LocalDateTime saleDate;
    private List<SaleItemDto> items;
    private double totalPrice;

    public Long getSaleId() {
        return saleId;
    }

    public void setSaleId(Long saleId) {
        this.saleId = saleId;
    }

    public Long getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Long customerId) {
        this.customerId = customerId;
    }

    public LocalDateTime getSaleDate() {
        return saleDate;
    }

    public void setSaleDate(LocalDateTime saleDate) {
        this.saleDate = saleDate;
    }

    public List<SaleItemDto> getItems() {
        return items;
    }

    public void setItems(List<SaleItemDto> items) {
        this.items = items;
    }

    public double getTotalPrice() {
        return totalPrice;
    }

    public void setTotalPrice(double totalPrice) {
        this.totalPrice = totalPrice;
    }
}