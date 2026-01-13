package com.example.demo.inventory.Products;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public Optional<Product> getProductById(Long id) {
        return productRepository.findById(id);
    }

    public Product saveProduct(Product product) {
        return productRepository.save(product);
    }

    public Product updateProduct(Long id, Product productDetails) {
        Optional<Product> optionalProduct = productRepository.findById(id);
        if (optionalProduct.isPresent()) {
            Product existingProduct = optionalProduct.get();
            existingProduct.setName(productDetails.getName());
            existingProduct.setQuantity(productDetails.getQuantity());
            existingProduct.setQuantitySold(productDetails.getQuantitySold());
            existingProduct.setSellingPrice(productDetails.getSellingPrice());
            existingProduct.setCostPrice(productDetails.getCostPrice());
            existingProduct.setSize(productDetails.getSize());
            existingProduct.setConsignment(productDetails.getConsignment()); // Make sure to handle consignment updates if needed
            return productRepository.save(existingProduct);
        }
        return null;
    }

    public void deleteProduct(Long id) {
        productRepository.deleteById(id);
    }
}