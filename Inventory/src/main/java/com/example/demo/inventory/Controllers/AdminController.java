package com.example.demo.inventory.Controllers;


import com.example.demo.inventory.Consignment.Consignment;
import com.example.demo.inventory.Consignment.ConsignmentService;
import com.example.demo.inventory.Products.Product;
import com.example.demo.inventory.Products.ProductService;
import com.example.demo.inventory.Sales.SaleRequestDto;
import com.example.demo.inventory.Sales.SaleResponseDto;
import com.example.demo.inventory.Sales.SaleService;
import com.example.demo.inventory.User.AuthRequest;
import com.example.demo.inventory.User.User;
import com.example.demo.inventory.User.UserRepository;
import com.example.demo.inventory.User.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {
    private final SaleService saleService;
    private final UserService userService;
    private final ProductService productService;
    private final UserRepository userRepository;
    private final ConsignmentService consignmentService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // Sales
    @PostMapping("/sale")
    public ResponseEntity<SaleResponseDto> createSale(@RequestBody SaleRequestDto requestDto) {
        SaleResponseDto responseDto = saleService.createSale(requestDto);
        return new ResponseEntity<>(responseDto, HttpStatus.CREATED);
    }


    // Consignments
    @PostMapping("/consignments")
    public ResponseEntity<Consignment> createConsignment(@RequestBody Consignment consignment) {
        try {
            Consignment createdConsignment = consignmentService.createConsignment(consignment);
            return new ResponseEntity<>(createdConsignment, HttpStatus.CREATED);
        } catch (Exception e) {
            System.err.println("Error creating consignment: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/consignments")
    public ResponseEntity<List<Consignment>> getAllConsignments() {
        try {
            List<Consignment> consignments = consignmentService.getAllConsignments();
            return new ResponseEntity<>(consignments, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("Error retrieving consignments: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/consignments/{id}")
    public ResponseEntity<Consignment> getConsignmentById(@PathVariable Long id) {
        try {
            Consignment consignment = consignmentService.getConsignmentById(id);
            return new ResponseEntity<>(consignment, HttpStatus.OK);
        } catch (RuntimeException e) {
            System.err.println("Consignment not found: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            System.err.println("Error retrieving consignment: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/consignments/{id}")
    public ResponseEntity<Consignment> updateConsignment(@PathVariable Long id, @RequestBody Consignment updatedConsignment) {
        try {
            Consignment result = consignmentService.updateConsignment(id, updatedConsignment);
            return new ResponseEntity<>(result, HttpStatus.OK);
        } catch (RuntimeException e) {
            System.err.println("Consignment not found for update: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            System.err.println("Error updating consignment: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @DeleteMapping("/consignments/{id}")
    public ResponseEntity<Void> deleteConsignment(@PathVariable Long id) {
        try {
            consignmentService.deleteConsignment(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (RuntimeException e) {
            System.err.println("Consignment not found for deletion: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            System.err.println("Error deleting consignment: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    // New Endpoints for managing products within a consignment
    @PostMapping("/consignments/{consignmentId}/products")
    public ResponseEntity<Product> addProductToConsignment(@PathVariable Long consignmentId, @RequestBody Product product) {
        try {
            Product savedProduct = consignmentService.addProductToConsignment(consignmentId, product);
            return new ResponseEntity<>(savedProduct, HttpStatus.CREATED);
        } catch (NoSuchElementException e) {
            System.err.println("Error adding product to consignment: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            System.err.println("Error adding product to consignment: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @DeleteMapping("/consignments/{consignmentId}/products/{productId}")
    public ResponseEntity<Void> deleteProductFromConsignment(@PathVariable Long consignmentId, @PathVariable Long productId) {
        try {
            consignmentService.deleteProductFromConsignment(consignmentId, productId);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (NoSuchElementException e) {
            System.err.println("Error deleting product from consignment: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            System.err.println("Error deleting product from consignment: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // In AdminController.java

    @PutMapping("/consignments/{consignmentId}/products/{productId}")
    public ResponseEntity<Product> updateProductInConsignment(@PathVariable Long consignmentId, @PathVariable Long productId, @RequestBody Product updatedProduct) {
        // You'll need a new method in your ConsignmentService for this
        try {
            Product result = consignmentService.updateProduct(consignmentId, productId, updatedProduct);
            return new ResponseEntity<>(result, HttpStatus.OK);
        } catch (NoSuchElementException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }


    // Users
    @PostMapping("/user")
    public ResponseEntity<?> createUser(@RequestBody AuthRequest request) {
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Username already exists");
        }

        String role = request.getRole();
        if (role == null || !(role.equalsIgnoreCase("ADMIN") || role.equalsIgnoreCase("SELLER") || role.equalsIgnoreCase("STOCKER"))) {
            return ResponseEntity.badRequest().body("Role must be ADMIN, SELLER, or STOCKER");
        }

        User newUser = new User();
        newUser.setUsername(request.getUsername());
        newUser.setPassword(passwordEncoder.encode(request.getPassword()));
        newUser.setRole("ROLE_" + role.toUpperCase());

        userRepository.save(newUser);

        return ResponseEntity.status(HttpStatus.CREATED).body("User created successfully");
    }

    @GetMapping("/user")
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    @PutMapping("/user/{id}")
    public User updateUser(@PathVariable Long id, @RequestBody User user) {
        return userService.updateUser(id, user);
    }

    @DeleteMapping("user/{id}")
    public void deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
    }
}