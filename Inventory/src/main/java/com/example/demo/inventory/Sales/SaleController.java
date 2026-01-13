package com.example.demo.inventory.Sales;

import com.example.demo.inventory.Exceptions.InsufficientStockException;
import com.example.demo.inventory.Exceptions.ResourceNotFoundException;
import com.example.demo.inventory.SaleItem.SaleItemDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sales")
@RequiredArgsConstructor
public class SaleController {

    private final SaleService saleService;

    /**
     * Creates a new sale with one or more products.
     *
     * @param requestDto The DTO containing customer ID and a list of sale items.
     * @return The created SaleResponseDto.
     */
    @PostMapping
    public ResponseEntity<SaleResponseDto> createSale(@RequestBody SaleRequestDto requestDto) {
        try {
            SaleResponseDto responseDto = saleService.createSale(requestDto);
            return new ResponseEntity<>(responseDto, HttpStatus.CREATED);
        } catch (ResourceNotFoundException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } catch (InsufficientStockException e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    /**
     * Retrieves a list of all sales.
     *
     * @return A list of SaleResponseDto objects.
     */
    @GetMapping
    public ResponseEntity<List<SaleResponseDto>> getAllSales() {
        List<SaleResponseDto> sales = saleService.getAllSales();
        return ResponseEntity.ok(sales);
    }

    /**
     * Retrieves a single sale by its ID.
     *
     * @param id The ID of the sale.
     * @return The SaleResponseDto for the requested sale.
     */
    @GetMapping("/{id}")
    public ResponseEntity<SaleResponseDto> getSaleById(@PathVariable Long id) {
        try {
            SaleResponseDto sale = saleService.getSaleById(id);
            return ResponseEntity.ok(sale);
        } catch (ResourceNotFoundException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    /**
     * Deletes a sale by its ID. Reverts stock and financial data.
     *
     * @param id The ID of the sale to delete.
     * @return A no-content response upon successful deletion.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSale(@PathVariable Long id) {
        try {
            saleService.deleteSale(id);
            return ResponseEntity.noContent().build();
        } catch (ResourceNotFoundException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    /**
     * Adds products to an existing sale.
     *
     * @param saleId The ID of the sale to update.
     * @param itemsToAdd A list of SaleItemDto to add.
     * @return The updated SaleResponseDto.
     */
    @PostMapping("/{saleId}/products")
    public ResponseEntity<SaleResponseDto> addProductsToSale(@PathVariable Long saleId, @RequestBody List<SaleItemDto> itemsToAdd) {
        try {
            SaleResponseDto updatedSale = saleService.addProductsToSale(saleId, itemsToAdd);
            return ResponseEntity.ok(updatedSale);
        } catch (ResourceNotFoundException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } catch (InsufficientStockException e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    /**
     * Deletes one or more products from an existing sale.
     *
     * @param saleId The ID of the sale to update.
     * @param itemIdsToDelete A list of IDs of SaleItems to delete.
     * @return The updated SaleResponseDto.
     */
    @DeleteMapping("/{saleId}/products")
    public ResponseEntity<SaleResponseDto> deleteProductsFromSale(@PathVariable Long saleId, @RequestBody List<Long> itemIdsToDelete) {
        try {
            SaleResponseDto updatedSale = saleService.deleteProductsFromSale(saleId, itemIdsToDelete);
            return ResponseEntity.ok(updatedSale);
        } catch (ResourceNotFoundException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
}