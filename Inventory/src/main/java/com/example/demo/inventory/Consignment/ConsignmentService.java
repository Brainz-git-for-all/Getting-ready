package com.example.demo.inventory.Consignment;

import com.example.demo.inventory.Products.Product;
import com.example.demo.inventory.Products.ProductRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor // Automatically creates constructor for final fields
public class ConsignmentService {

    private final ConsignmentRepository consignmentRepository;
    private final ProductRepository productRepository;

    // CREATE a new consignment with its products
    @Transactional
    public Consignment createConsignment(Consignment consignment) {
        if (consignment.getProducts() != null) {
            consignment.getProducts().forEach(product -> product.setConsignment(consignment));
        }
        consignment.updateFinancials(); // Calculate financials for the new consignment
        return consignmentRepository.save(consignment);
    }

    // READ all consignments
    public List<Consignment> getAllConsignments() {
        return consignmentRepository.findAll();
    }

    // READ a single consignment by ID
    public Consignment getConsignmentById(Long id) {
        return consignmentRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Consignment not found with id " + id));
    }

    // UPDATE an existing consignment
    @Transactional
    public Consignment updateConsignment(Long id, Consignment updatedConsignment) {
        Consignment existingConsignment = consignmentRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Consignment not found with id " + id));

        // Update basic fields
        existingConsignment.setInvoiceNumber(updatedConsignment.getInvoiceNumber());
        existingConsignment.setSupplier(updatedConsignment.getSupplier());
        existingConsignment.setReceivingDate(updatedConsignment.getReceivingDate());
        existingConsignment.setSource(updatedConsignment.getSource());

        // Handle products
        // First, clear old products from the existing consignment's list.
        // The orphanRemoval=true in the Consignment entity will delete the old products from the DB.
        existingConsignment.getProducts().clear();

        // Next, add the new products to the existing consignment.
        if (updatedConsignment.getProducts() != null) {
            updatedConsignment.getProducts().forEach(product -> {
                product.setConsignment(existingConsignment);
                existingConsignment.getProducts().add(product);
            });
        }

        existingConsignment.updateFinancials(); // Recalculate financials after update
        return consignmentRepository.save(existingConsignment);
    }

    // DELETE a consignment by ID
    @Transactional
    public void deleteConsignment(Long id) {
        if (!consignmentRepository.existsById(id)) {
            throw new NoSuchElementException("Consignment not found with id " + id);
        }
        consignmentRepository.deleteById(id);
    }

    // Adds a new product to an existing consignment
    @Transactional
    public Product addProductToConsignment(Long consignmentId, Product product) {
        Consignment consignment = getConsignmentById(consignmentId); // Use existing method for clarity

        // Link the product to the consignment
        product.setConsignment(consignment);
        consignment.getProducts().add(product);

        // Persist the product and update financials
        Product savedProduct = productRepository.save(product);
        consignment.updateFinancials();
        consignmentRepository.save(consignment); // Save the consignment to persist the financials

        return savedProduct;
    }

    // Deletes a product from a consignment
    @Transactional
    public void deleteProductFromConsignment(Long consignmentId, Long productId) {
        Consignment consignment = getConsignmentById(consignmentId); // Use existing method for clarity

        Product productToDelete = consignment.getProducts().stream()
                .filter(p -> p.getId().equals(productId))
                .findFirst()
                .orElseThrow(() -> new NoSuchElementException("Product not found with ID: " + productId));

        // Remove the product from the list, which will trigger orphanRemoval
        consignment.getProducts().remove(productToDelete);

        // Recalculate and save the consignment financials
        consignment.updateFinancials();
        consignmentRepository.save(consignment);
    }

// In ConsignmentService.java

    @Transactional
    public Product updateProduct(Long consignmentId, Long productId, Product updatedProduct) {
        Consignment consignment = getConsignmentById(consignmentId);
        Product existingProduct = consignment.getProducts().stream()
                .filter(p -> p.getId().equals(productId))
                .findFirst()
                .orElseThrow(() -> new NoSuchElementException("Product not found with ID: " + productId + " in this consignment."));

        // Update fields
        existingProduct.setName(updatedProduct.getName());
        // Note: Updating quantity or cost here requires careful logic to maintain financial integrity.
        // For simplicity, we'll only update name, sellingPrice, etc.
        existingProduct.setSellingPrice(updatedProduct.getSellingPrice());
        existingProduct.setCostPrice(updatedProduct.getCostPrice());
        existingProduct.setSize(updatedProduct.getSize());

        Product savedProduct = productRepository.save(existingProduct);
        consignment.updateFinancials();
        consignmentRepository.save(consignment);

        return savedProduct;
    }
}