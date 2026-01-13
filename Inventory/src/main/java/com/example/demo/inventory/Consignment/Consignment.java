package com.example.demo.inventory.Consignment;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.example.demo.inventory.Products.Product;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.ArrayList;

@Entity
@Table(name = "consignments")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Consignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String invoiceNumber;
    private String supplier;
    private LocalDateTime receivingDate;
    private String source;

    private double totalCost;
    private double totalSalesRevenue;
    private double profitOrLoss;

    @OneToMany(mappedBy = "consignment", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<Product> products = new ArrayList<>();

    // Helper method to link products and update the financial data
    public void addProduct(Product product) {
        this.products.add(product);
        product.setConsignment(this);
        updateFinancials(); // Update all financial fields
    }

    // This is the sole method for updating financial data.
    public void updateFinancials() {
        if (Objects.isNull(this.products)) return;

        // Recalculate total sales revenue
        this.totalSalesRevenue = this.products.stream()
                .mapToDouble(p -> p.getQuantitySold() * p.getSellingPrice())
                .sum();

        // Recalculate total cost based on all products in the consignment
        this.totalCost = this.products.stream()
                .mapToDouble(p -> (p.getQuantity() + p.getQuantitySold()) * p.getCostPrice())
                .sum();

        // Calculate profit or loss
        this.profitOrLoss = this.totalSalesRevenue - this.totalCost;
    }
}