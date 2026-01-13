package com.example.demo.inventory.Controllers;
import com.example.demo.inventory.Consignment.Consignment;
import com.example.demo.inventory.Consignment.ConsignmentService;
import com.example.demo.inventory.Customers.CustomerDto;
import com.example.demo.inventory.Customers.CustomerService;
import com.example.demo.inventory.Exceptions.InsufficientStockException;
import com.example.demo.inventory.Exceptions.ResourceNotFoundException;
import com.example.demo.inventory.Products.Product;
import com.example.demo.inventory.Products.ProductService;
import com.example.demo.inventory.SaleItem.SaleItemDto;
import com.example.demo.inventory.Sales.SaleRequestDto;
import com.example.demo.inventory.Sales.SaleResponseDto;
import com.example.demo.inventory.Sales.SaleService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;
@RestController
@RequestMapping("seller")
@RequiredArgsConstructor
public class SellerController {
    private final SaleService saleService;
    private final CustomerService customerService;
    private final ProductService productService;
    private final ConsignmentService consignmentService;
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
    // CREATE a new customer
    @PostMapping("customer")
    public ResponseEntity<CustomerDto> createCustomer(@RequestBody CustomerDto customerDto) {
        CustomerDto createdCustomer = customerService.createCustomer(customerDto);
        return new ResponseEntity<>(createdCustomer, HttpStatus.CREATED);
    }
    // READ all customers
    @GetMapping("customer")
    public ResponseEntity<List<CustomerDto>> getAllCustomers() {
        List<CustomerDto> customers = customerService.getAllCustomers();
        return new ResponseEntity<>(customers, HttpStatus.OK);
    }
    // READ a single customer by ID
    @GetMapping("/customer/{id}")
    public ResponseEntity<CustomerDto> getCustomerById(@PathVariable Long id) {
        try {
            CustomerDto customer = customerService.getCustomerById(id);
            return new ResponseEntity<>(customer, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
    // UPDATE an existing customer
    @PutMapping("/customer/{id}")
    public ResponseEntity<CustomerDto> updateCustomer(@PathVariable Long id, @RequestBody CustomerDto customerDto) {
        try {
            CustomerDto updatedCustomer = customerService.updateCustomer(id, customerDto);
            return new ResponseEntity<>(updatedCustomer, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
    // DELETE a customer
    @DeleteMapping("/customer/{id}")
    public ResponseEntity<Void> deleteCustomer(@PathVariable Long id) {
        try {
            customerService.deleteCustomer(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT); // 204 No Content
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
    @GetMapping("/products")
    public List<Product> getAllProducts() {
        return productService.getAllProducts();
    }
    @GetMapping("/products/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
        Optional<Product> product = productService.getProductById(id);
        return product.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
    @PostMapping("/products")
    public ResponseEntity<Product> createProduct(@RequestBody Product product) {
        Product savedProduct = productService.saveProduct(product);
        return new ResponseEntity<>(savedProduct, HttpStatus.CREATED);
    }
    @PutMapping("/products/{id}")
    public ResponseEntity<Product> updateProduct(@PathVariable Long id, @RequestBody Product productDetails) {
        Product updatedProduct = productService.updateProduct(id, productDetails);
        if (updatedProduct != null) {
            return ResponseEntity.ok(updatedProduct);
        }
        return ResponseEntity.notFound().build();
    }
    @DeleteMapping("/products/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }
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
