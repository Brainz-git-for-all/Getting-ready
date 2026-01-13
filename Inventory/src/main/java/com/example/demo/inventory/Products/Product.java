package com.example.demo.inventory.Products;

import com.example.demo.inventory.Consignment.Consignment;
import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "products")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private int quantity;
    private int quantitySold;
    private double sellingPrice;
    private double costPrice;
    private String size;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "consignment_id" , nullable = false)
    @JsonBackReference
    private Consignment consignment;
}