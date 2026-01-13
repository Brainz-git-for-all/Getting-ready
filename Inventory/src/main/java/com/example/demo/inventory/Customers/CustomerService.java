package com.example.demo.inventory.Customers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CustomerService {

    private final CustomerRepository customerRepository;

    @Autowired
    public CustomerService(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    // CREATE a new customer
    public CustomerDto createCustomer(CustomerDto customerDto) {
        Customer customer = convertToEntity(customerDto);
        Customer savedCustomer = customerRepository.save(customer);
        return convertToDto(savedCustomer);
    }

    // READ all customers
    public List<CustomerDto> getAllCustomers() {
        return customerRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    // READ a single customer by ID
    public CustomerDto getCustomerById(Long id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer not found with id " + id));
        return convertToDto(customer);
    }

    // UPDATE an existing customer
    public CustomerDto updateCustomer(Long id, CustomerDto customerDto) {
        Customer existingCustomer = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer not found with id " + id));

        // Update fields from DTO
        existingCustomer.setName(customerDto.getName());
        existingCustomer.setPhoneNumber(customerDto.getPhoneNumber());

        Customer updatedCustomer = customerRepository.save(existingCustomer);
        return convertToDto(updatedCustomer);
    }

    // DELETE a customer
    public void deleteCustomer(Long id) {
        if (!customerRepository.existsById(id)) {
            throw new RuntimeException("Customer not found with id " + id);
        }
        customerRepository.deleteById(id);
    }

    // Helper method to convert an Entity to a DTO
    private CustomerDto convertToDto(Customer customer) {
        return new CustomerDto(customer.getId(), customer.getName(), customer.getPhoneNumber());
    }

    // Helper method to convert a DTO to an Entity
    private Customer convertToEntity(CustomerDto customerDto) {
        Customer customer = new Customer();
        // ID is not set for creation, as it's auto-generated
        if (customerDto.getId() != null) {
            customer.setId(customerDto.getId());
        }
        customer.setName(customerDto.getName());
        customer.setPhoneNumber(customerDto.getPhoneNumber());
        return customer;
    }
}