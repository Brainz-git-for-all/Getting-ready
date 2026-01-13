package com.example.demo.inventory.Sales;


import com.example.demo.inventory.SaleItem.SaleItem;
import com.example.demo.inventory.SaleItem.SaleItemDto;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface SaleMapper {

    @Mapping(source = "id", target = "saleId")
    @Mapping(source = "customer.id", target = "customerId")
    @Mapping(source = "saleItems", target = "items") // Corrected: changed "saleDetails" to "saleItems"
    SaleResponseDto toResponseDto(Sale sale);
    
    // This mapping converts a list of SaleItem entities to a list of SaleItemDto objects.
    List<SaleItemDto> saleItemsToSaleItemDtos(List<SaleItem> saleItems); // Corrected method name for clarity

    // Defines how a single SaleItem maps to a SaleItemDto.
    @Mapping(source = "product.id", target = "productId")
    SaleItemDto saleItemToSaleItemDto(SaleItem saleItem); // Corrected method name for clarity
}