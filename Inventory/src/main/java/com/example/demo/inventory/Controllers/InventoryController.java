package com.example.demo.inventory.Controllers;

import com.example.demo.inventory.Consignment.Consignment;
import com.example.demo.inventory.Consignment.ConsignmentService;
import com.example.demo.inventory.Products.Product;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/inventory")
@RequiredArgsConstructor
public class InventoryController {

    private final ConsignmentService consignmentService;

    // CREATE a new consignment
    @PostMapping("/consignments")
    public ResponseEntity<Consignment> createConsignment(@RequestBody Consignment consignment) {
        Consignment newConsignment = consignmentService.createConsignment(consignment);
        return new ResponseEntity<>(newConsignment, HttpStatus.CREATED);
    }

    // READ all consignments
    @GetMapping("/consignments")
    public ResponseEntity<List<Consignment>> getAllConsignments() {
        List<Consignment> consignments = consignmentService.getAllConsignments();
        return ResponseEntity.ok(consignments);
    }

    // READ a single consignment by ID
    @GetMapping("/consignments/{id}")
    public ResponseEntity<Consignment> getConsignmentById(@PathVariable Long id) {
        Consignment consignment = consignmentService.getConsignmentById(id);
        return ResponseEntity.ok(consignment);
    }

    // UPDATE an existing consignment
    @PutMapping("/consignments/{id}")
    public ResponseEntity<Consignment> updateConsignment(@PathVariable Long id, @RequestBody Consignment updatedConsignment) {
        Consignment consignment = consignmentService.updateConsignment(id, updatedConsignment);
        return ResponseEntity.ok(consignment);
    }

    // DELETE a consignment
    @DeleteMapping("/consignments/{id}")
    public ResponseEntity<Void> deleteConsignment(@PathVariable Long id) {
        consignmentService.deleteConsignment(id);
        return ResponseEntity.noContent().build();
    }

    // Add a product to an existing consignment
    @PostMapping("/consignments/{consignmentId}/products")
    public ResponseEntity<Product> addProductToConsignment(@PathVariable Long consignmentId, @RequestBody Product product) {
        Product newProduct = consignmentService.addProductToConsignment(consignmentId, product);
        return new ResponseEntity<>(newProduct, HttpStatus.CREATED);
    }

    // Delete a product from a consignment
    @DeleteMapping("/consignments/{consignmentId}/products/{productId}")
    public ResponseEntity<Void> deleteProductFromConsignment(@PathVariable Long consignmentId, @PathVariable Long productId) {
        consignmentService.deleteProductFromConsignment(consignmentId, productId);
        return ResponseEntity.noContent().build();
    }
}