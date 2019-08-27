# Hyperledger Fabric Task
Make a Hyperledger network with:
You can choose your own architecture, but please write down clear explanation for choosing the architecture that you will choose, 
And free to make any assumptions

7 organisations :  
Distributor1, Distributor2,  Retailer1, Retailer2,  Shipment Agency1, Shipment Agency2, Manufacturer
        
Make a chaincode for adding product details, you can choose your own product, 
And add private collections for both Retailer1, Distributor1, Shipment Agency1 and Retailer2, Distributor2, Shipment Agency2 

Acl(Access control list) using chaincode about products:


                  Manufacturer    Retailer        Distributor     Shipment Agency 

CreateProduct           Yes             No              No              No

Read Product Details    Yes             Yes             Yes             Yes


*** Retailer1, Distributor1, Shippment Agency1 cant read data of Retailers2, Distributors2, Shipment Agency 2

APIs for Create Product and Read Product.
