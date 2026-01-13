package com.example.demo.inventory.Sales;
import com.example.demo.inventory.Consignment.Consignment;
import com.example.demo.inventory.Consignment.ConsignmentRepository;
import com.example.demo.inventory.Customers.Customer;
import com.example.demo.inventory.Customers.CustomerRepository;
import com.example.demo.inventory.Exceptions.InsufficientStockException;
import com.example.demo.inventory.Exceptions.ResourceNotFoundException;
import com.example.demo.inventory.Products.Product;
import com.example.demo.inventory.Products.ProductRepository;
import com.example.demo.inventory.SaleItem.SaleItem;
import com.example.demo.inventory.SaleItem.SaleItemDto;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;
@Service
public class SaleService {
    private final SaleRepository saleRepository;
    private final ProductRepository productRepository;
    private final CustomerRepository customerRepository;
    private final ConsignmentRepository consignmentRepository;
    private final SaleMapper saleMapper;

    public SaleService(SaleRepository saleRepository, ProductRepository productRepository, CustomerRepository customerRepository, ConsignmentRepository consignmentRepository, SaleMapper saleMapper) {
        this.saleRepository = saleRepository;
        this.productRepository = productRepository;
        this.customerRepository = customerRepository;
        this.consignmentRepository = consignmentRepository;
        this.saleMapper = saleMapper;
    }

    public SaleResponseDto getSaleById(Long id) {
        Sale sale = saleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sale not found with ID: " + id));
        return saleMapper.toResponseDto(sale);
    }

    public List<SaleResponseDto> getAllSales() {
        return saleRepository.findAll().stream()
                .map(saleMapper::toResponseDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public SaleResponseDto createSale(SaleRequestDto requestDto) {
        Customer customer = customerRepository.findById(requestDto.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with ID: " + requestDto.getCustomerId()));

        Objects.requireNonNull(requestDto.getItems(), "Items list cannot be null");

        Sale sale = new Sale();
        sale.setCustomer(customer);
        sale.setSaleDate(LocalDateTime.now());

        List<SaleItem> saleItems = new ArrayList<>();
        double totalAmount = 0.0;
        List<Consignment> updatedConsignments = new ArrayList<>();

        for (SaleItemDto itemDto : requestDto.getItems()) {
            Product product = productRepository.findById(itemDto.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + itemDto.getProductId()));

            if (product.getQuantity() < itemDto.getQuantity()) {
                throw new InsufficientStockException("Not enough stock for product: " + product.getName() +
                        ". Requested: " + itemDto.getQuantity() + ", Available: " + product.getQuantity());
            }

            // 1. Update product quantities
            product.setQuantity(product.getQuantity() - itemDto.getQuantity());
            product.setQuantitySold(product.getQuantitySold() + itemDto.getQuantity());

            // 2. Add the product's consignment to a list to be updated later
            Consignment consignment = product.getConsignment();
            // --- START OF FIX ---
            // Only add the consignment to the list if it's not null and has a valid ID.
            if (consignment != null && consignment.getId() != null && consignment.getId() != 0) {
                if (!updatedConsignments.contains(consignment)) {
                    updatedConsignments.add(consignment);
                }
            }
            // --- END OF FIX ---

            productRepository.save(product);

            // 3. Create and add the SaleItem
            SaleItem item = new SaleItem();
            item.setProduct(product);
            item.setSale(sale);
            item.setQuantity(itemDto.getQuantity());
            item.setPriceAtSale(product.getSellingPrice());
            saleItems.add(item);

            totalAmount += product.getSellingPrice() * itemDto.getQuantity();
        }

        sale.setSaleItems(saleItems);
        sale.setTotalPrice(totalAmount);

        // 4. Update the financial data for each affected consignment
        for (Consignment consignment : updatedConsignments) {
            consignment.updateFinancials();
            consignmentRepository.save(consignment);
        }

        Sale savedSale = saleRepository.save(sale);
        return saleMapper.toResponseDto(savedSale);
    }

    @Transactional
    public void deleteSale(Long id) {
        Sale sale = saleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sale not found with ID: " + id));

        // Revert product stock and update consignment financials
        List<Consignment> updatedConsignments = new ArrayList<>();

        for (SaleItem item : sale.getSaleItems()) {
            Product product = item.getProduct();

            // Revert quantity changes
            product.setQuantity(product.getQuantity() + item.getQuantity());
            product.setQuantitySold(product.getQuantitySold() - item.getQuantity());

            // Add the consignment to the list for updating financials
            Consignment consignment = product.getConsignment();
            if (consignment != null && !updatedConsignments.contains(consignment)) {
                updatedConsignments.add(consignment);
            }

            productRepository.save(product);
        }

        // Update financial data for each affected consignment
        for (Consignment consignment : updatedConsignments) {
            consignment.updateFinancials();
            consignmentRepository.save(consignment);
        }

        saleRepository.delete(sale);
    }

    @Transactional
    public SaleResponseDto addProductsToSale(Long saleId, List<SaleItemDto> itemsToAdd) {
        Sale existingSale = saleRepository.findById(saleId)
                .orElseThrow(() -> new ResourceNotFoundException("Sale not found with ID: " + saleId));

        List<Consignment> updatedConsignments = new ArrayList<>();
        double additionalAmount = 0.0;

        for (SaleItemDto itemDto : itemsToAdd) {
            Product product = productRepository.findById(itemDto.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + itemDto.getProductId()));

            if (product.getQuantity() < itemDto.getQuantity()) {
                throw new InsufficientStockException("Not enough stock for product: " + product.getName() +
                        ". Requested: " + itemDto.getQuantity() + ", Available: " + product.getQuantity());
            }

            // Update product quantities
            product.setQuantity(product.getQuantity() - itemDto.getQuantity());
            product.setQuantitySold(product.getQuantitySold() + itemDto.getQuantity());

            // Create and add the new SaleItem
            SaleItem newItem = new SaleItem();
            newItem.setProduct(product);
            newItem.setSale(existingSale);
            newItem.setQuantity(itemDto.getQuantity());
            newItem.setPriceAtSale(product.getSellingPrice());
            existingSale.getSaleItems().add(newItem);

            // Update sale's total price
            additionalAmount += product.getSellingPrice() * itemDto.getQuantity();

            // Add the consignment for later update
            Consignment consignment = product.getConsignment();
            if (consignment != null && !updatedConsignments.contains(consignment)) {
                updatedConsignments.add(consignment);
            }

            productRepository.save(product);
        }

        existingSale.setTotalPrice(existingSale.getTotalPrice() + additionalAmount);

        // Update financial data for each affected consignment
        for (Consignment consignment : updatedConsignments) {
            consignment.updateFinancials();
            consignmentRepository.save(consignment);
        }

        Sale updatedSale = saleRepository.save(existingSale);
        return saleMapper.toResponseDto(updatedSale);
    }

    @Transactional
    public SaleResponseDto deleteProductsFromSale(Long saleId, List<Long> itemIdsToDelete) {
        Sale existingSale = saleRepository.findById(saleId)
                .orElseThrow(() -> new ResourceNotFoundException("Sale not found with ID: " + saleId));

        List<Consignment> updatedConsignments = new ArrayList<>();
        double reductionAmount = 0.0;

        // Create a list of items to remove to avoid ConcurrentModificationException
        List<SaleItem> itemsToRemove = existingSale.getSaleItems().stream()
                .filter(item -> itemIdsToDelete.contains(item.getId()))
                .collect(Collectors.toList());

        if (itemsToRemove.isEmpty()) {
            throw new ResourceNotFoundException("None of the specified SaleItems were found in this sale.");
        }

        for (SaleItem item : itemsToRemove) {
            Product product = item.getProduct();

            // Revert product quantities
            product.setQuantity(product.getQuantity() + item.getQuantity());
            product.setQuantitySold(product.getQuantitySold() - item.getQuantity());

            // Update sale's total price
            reductionAmount += item.getPriceAtSale() * item.getQuantity();

            // Add the consignment for later update
            Consignment consignment = product.getConsignment();
            if (consignment != null && !updatedConsignments.contains(consignment)) {
                updatedConsignments.add(consignment);
            }
            productRepository.save(product);
        }

        existingSale.getSaleItems().removeAll(itemsToRemove);
        existingSale.setTotalPrice(existingSale.getTotalPrice() - reductionAmount);

        // Update financial data for each affected consignment
        for (Consignment consignment : updatedConsignments) {
            consignment.updateFinancials();
            consignmentRepository.save(consignment);
        }

        Sale updatedSale = saleRepository.save(existingSale);
        return saleMapper.toResponseDto(updatedSale);
    }
}
