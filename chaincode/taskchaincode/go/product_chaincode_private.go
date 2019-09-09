/*
Copyright IBM Corp. All Rights Reserved.

SPDX-License-Identifier: Apache-2.0
*/

// ====CHAINCODE EXECUTION SAMPLES (CLI) ==================

// ==== Invoke products, pass private data as base64 encoded bytes in transient map ====
//
// export PRODUCT=$(echo -n "{\"name\":\"product1\",\"color\":\"blue\",\"size\":35,\"owner\":\"tom\",\"price\":99}" | base64)
// peer chaincode invoke -C mychannel -n productsp -c '{"Args":["initProduct"]}' --transient "{\"product\":\"$PRODUCT\"}"
//
// export PRODUCT=$(echo -n "{\"name\":\"product2\",\"color\":\"red\",\"size\":50,\"owner\":\"tom\",\"price\":102}" | base64)
// peer chaincode invoke -C mychannel -n productsp -c '{"Args":["initProduct"]}' --transient "{\"product\":\"$PRODUCT\"}"
//
// export PRODUCT=$(echo -n "{\"name\":\"product3\",\"color\":\"blue\",\"size\":70,\"owner\":\"tom\",\"price\":103}" | base64)
// peer chaincode invoke -C mychannel -n productsp -c '{"Args":["initProduct"]}' --transient "{\"product\":\"$PRODUCT\"}"
//
// export PRODUCT_OWNER=$(echo -n "{\"name\":\"product2\",\"owner\":\"jerry\"}" | base64)
// peer chaincode invoke -C mychannel -n productsp -c '{"Args":["transferProduct"]}' --transient "{\"product_owner\":\"$PRODUCT_OWNER\"}"
//
// export PRODUCT_DELETE=$(echo -n "{\"name\":\"product1\"}" | base64)
// peer chaincode invoke -C mychannel -n productsp -c '{"Args":["delete"]}' --transient "{\"product_delete\":\"$PRODUCT_DELETE\"}"

// ==== Query products, since queries are not recorded on chain we don't need to hide private data in transient map ====
// peer chaincode query -C mychannel -n productsp -c '{"Args":["readProduct","product1"]}'
// peer chaincode query -C mychannel -n productsp -c '{"Args":["readProductPrivateDetails","product1"]}'
// peer chaincode query -C mychannel -n productsp -c '{"Args":["getProductsByRange","product1","product4"]}'
//
// Rich Query (Only supported if CouchDB is used as state database):
//   peer chaincode query -C mychannel -n productsp -c '{"Args":["queryProductsByOwner","tom"]}'
//   peer chaincode query -C mychannel -n productsp -c '{"Args":["queryProducts","{\"selector\":{\"owner\":\"tom\"}}"]}'

// INDEXES TO SUPPORT COUCHDB RICH QUERIES
//
// Indexes in CouchDB are required in order to make JSON queries efficient and are required for
// any JSON query with a sort. As of Hyperledger Fabric 1.1, indexes may be packaged alongside
// chaincode in a META-INF/statedb/couchdb/indexes directory. Or for indexes on private data
// collections, in a META-INF/statedb/couchdb/collections/<collection_name>/indexes directory.
// Each index must be defined in its own text file with extension *.json with the index
// definition formatted in JSON following the CouchDB index JSON syntax as documented at:
// http://docs.couchdb.org/en/2.1.1/api/database/find.html#db-index
//
// This products02_private example chaincode demonstrates a packaged index which you
// can find in META-INF/statedb/couchdb/collection/collectionProducts/indexes/indexOwner.json.
// For deployment of chaincode to production environments, it is recommended
// to define any indexes alongside chaincode so that the chaincode and supporting indexes
// are deployed automatically as a unit, once the chaincode has been installed on a peer and
// instantiated on a channel. See Hyperledger Fabric documentation for more details.
//
// If you have access to the your peer's CouchDB state database in a development environment,
// you may want to iteratively test various indexes in support of your chaincode queries.  You
// can use the CouchDB Fauxton interface or a command line curl utility to create and update
// indexes. Then once you finalize an index, include the index definition alongside your
// chaincode in the META-INF/statedb/couchdb/indexes directory or
// META-INF/statedb/couchdb/collections/<collection_name>/indexes directory, for packaging
// and deployment to managed environments.
//
// In the examples below you can find index definitions that support products02_private
// chaincode queries, along with the syntax that you can use in development environments
// to create the indexes in the CouchDB Fauxton interface.
//

//Example hostname:port configurations to access CouchDB.
//
//To access CouchDB docker container from within another docker container or from vagrant environments:
// http://couchdb:5984/
//
//Inside couchdb docker container
// http://127.0.0.1:5984/

// Index for docType, owner.
// Note that docType and owner fields must be prefixed with the "data" wrapper
//
// Index definition for use with Fauxton interface
// {"index":{"fields":["data.docType","data.owner"]},"ddoc":"indexOwnerDoc", "name":"indexOwner","type":"json"}

// Index for docType, owner, size (descending order).
// Note that docType, owner and size fields must be prefixed with the "data" wrapper
//
// Index definition for use with Fauxton interface
// {"index":{"fields":[{"data.size":"desc"},{"data.docType":"desc"},{"data.owner":"desc"}]},"ddoc":"indexSizeSortDoc", "name":"indexSizeSortDesc","type":"json"}

// Rich Query with index design doc and index name specified (Only supported if CouchDB is used as state database):
//   peer chaincode query -C mychannel -n productsp -c '{"Args":["queryProducts","{\"selector\":{\"docType\":\"product\",\"owner\":\"tom\"}, \"use_index\":[\"_design/indexOwnerDoc\", \"indexOwner\"]}"]}'

// Rich Query with index design doc specified only (Only supported if CouchDB is used as state database):
//   peer chaincode query -C mychannel -n productsp -c '{"Args":["queryProducts","{\"selector\":{\"docType\":{\"$eq\":\"product\"},\"owner\":{\"$eq\":\"tom\"},\"size\":{\"$gt\":0}},\"fields\":[\"docType\",\"owner\",\"size\"],\"sort\":[{\"size\":\"desc\"}],\"use_index\":\"_design/indexSizeSortDoc\"}"]}'

package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"strings"

	"github.com/hyperledger/fabric/core/chaincode/shim"
	pb "github.com/hyperledger/fabric/protos/peer"
)

// SimpleChaincode example simple Chaincode implementation
type SimpleChaincode struct {
}

type product struct {
	ObjectType string `json:"docType"` //docType is used to distinguish the various types of objects in state database
	Name       string `json:"name"`    //the fieldtags are needed to keep case from bouncing around
	Color      string `json:"color"`
	Quantity   int    `json:"quantity"`
	Owner      string `json:"owner"`
}

type productPrivateDetails struct {
	ObjectType string `json:"docType"` //docType is used to distinguish the various types of objects in state database
	Name       string `json:"name"`    //the fieldtags are needed to keep case from bouncing around
	Price      int    `json:"price"`
}

// ===================================================================================
// Main
// ===================================================================================
func main() {
	err := shim.Start(new(SimpleChaincode))
	if err != nil {
		fmt.Printf("Error starting Simple chaincode: %s", err)
	}
}

// Init initializes chaincode
// ===========================
func (t *SimpleChaincode) Init(stub shim.ChaincodeStubInterface) pb.Response {
	return shim.Success(nil)
}

// Invoke - Our entry point for Invocations
// ========================================
func (t *SimpleChaincode) Invoke(stub shim.ChaincodeStubInterface) pb.Response {
	function, args := stub.GetFunctionAndParameters()
	fmt.Println("invoke is running " + function)

	// Handle different functions
	switch function {
	case "initProduct":
		//create a new product
		return t.initProduct(stub, args)
	case "readProduct":
		//read a product
		return t.readProduct(stub, args)
	case "readProductPrivateDetails":
		//read a product private details
		return t.readProductPrivateDetails(stub, args)
	case "transferProduct":
		//change owner of a specific product
		return t.transferProduct(stub, args)
	case "delete":
		//delete a product
		return t.delete(stub, args)
	case "queryProductsByOwner":
		//find products for owner X using rich query
		return t.queryProductsByOwner(stub, args)
	case "queryProducts":
		//find products based on an ad hoc rich query
		return t.queryProducts(stub, args)
	case "getProductsByRange":
		//get products based on range query
		return t.getProductsByRange(stub, args)
	default:
		//error
		fmt.Println("invoke did not find func: " + function)
		return shim.Error("Received unknown function invocation")
	}
}

// ============================================================
// initProduct - create a new product, store into chaincode state
// ============================================================
func (t *SimpleChaincode) initProduct(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	var err error

	type productTransientInput struct {
		Name     string `json:"name"` //the fieldtags are needed to keep case from bouncing around
		Color    string `json:"color"`
		Quantity int    `json:"quantity"`
		Owner    string `json:"owner"`
		Price    int    `json:"price"`
	}

	// ==== Input sanitation ====
	fmt.Println("- start init product")

	if len(args) != 0 {
		return shim.Error("Incorrect number of arguments. Private product data must be passed in transient map.")
	}

	transMap, err := stub.GetTransient()
	if err != nil {
		return shim.Error("Error getting transient: " + err.Error())
	}

	if _, ok := transMap["product"]; !ok {
		return shim.Error("product must be a key in the transient map")
	}

	if len(transMap["product"]) == 0 {
		return shim.Error("product value in the transient map must be a non-empty JSON string")
	}

	var productInput productTransientInput
	err = json.Unmarshal(transMap["product"], &productInput)
	if err != nil {
		return shim.Error("Failed to decode JSON of: " + string(transMap["product"]))
	}

	if len(productInput.Name) == 0 {
		return shim.Error("name field must be a non-empty string")
	}
	if len(productInput.Color) == 0 {
		return shim.Error("color field must be a non-empty string")
	}
	if productInput.Quantity <= 0 {
		return shim.Error("quantity field must be a positive integer")
	}
	if len(productInput.Owner) == 0 {
		return shim.Error("owner field must be a non-empty string")
	}
	if productInput.Price <= 0 {
		return shim.Error("price field must be a positive integer")
	}

	// ==== Check if product already exists ====
	productAsBytes, err := stub.GetPrivateData("collectionProducts", productInput.Name)
	if err != nil {
		return shim.Error("Failed to get product: " + err.Error())
	} else if productAsBytes != nil {
		fmt.Println("This product already exists: " + productInput.Name)
		return shim.Error("This product already exists: " + productInput.Name)
	}

	// ==== Create product object, marshal to JSON, and save to state ====
	product := &product{
		ObjectType: "product",
		Name:       productInput.Name,
		Color:      productInput.Color,
		Quantity:   productInput.Quantity,
		Owner:      productInput.Owner,
	}
	productJSONasBytes, err := json.Marshal(product)
	if err != nil {
		return shim.Error(err.Error())
	}

	// === Save product to state ===
	err = stub.PutPrivateData("collectionProducts", productInput.Name, productJSONasBytes)
	if err != nil {
		return shim.Error(err.Error())
	}

	// ==== Create product private details object with price, marshal to JSON, and save to state ====
	productPrivateDetails := &productPrivateDetails{
		ObjectType: "productPrivateDetails",
		Name:       productInput.Name,
		Price:      productInput.Price,
	}
	productPrivateDetailsBytes, err := json.Marshal(productPrivateDetails)
	if err != nil {
		return shim.Error(err.Error())
	}
	err = stub.PutPrivateData("collectionProductPrivateDetails", productInput.Name, productPrivateDetailsBytes)
	if err != nil {
		return shim.Error(err.Error())
	}

	//  ==== Index the product to enable color-based range queries, e.g. return all blue products ====
	//  An 'index' is a normal key/value entry in state.
	//  The key is a composite key, with the elements that you want to range query on listed first.
	//  In our case, the composite key is based on indexName~color~name.
	//  This will enable very efficient state range queries based on composite keys matching indexName~color~*
	indexName := "color~name"
	colorNameIndexKey, err := stub.CreateCompositeKey(indexName, []string{product.Color, product.Name})
	if err != nil {
		return shim.Error(err.Error())
	}
	//  Save index entry to state. Only the key name is needed, no need to store a duplicate copy of the product.
	//  Note - passing a 'nil' value will effectively delete the key from state, therefore we pass null character as value
	value := []byte{0x00}
	stub.PutPrivateData("collectionProducts", colorNameIndexKey, value)

	// ==== Product saved and indexed. Return success ====
	fmt.Println("- end init product")
	return shim.Success(nil)
}

// ===============================================
// readProduct - read a product from chaincode state
// ===============================================
func (t *SimpleChaincode) readProduct(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	var name, jsonResp string
	var err error

	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting name of the product to query")
	}

	name = args[0]
	valAsbytes, err := stub.GetPrivateData("collectionProducts", name) //get the product from chaincode state
	if err != nil {
		jsonResp = "{\"Error\":\"Failed to get state for " + name + "\"}"
		return shim.Error(jsonResp)
	} else if valAsbytes == nil {
		jsonResp = "{\"Error\":\"Product does not exist: " + name + "\"}"
		return shim.Error(jsonResp)
	}

	return shim.Success(valAsbytes)
}

// ===============================================
// readProductreadProductPrivateDetails - read a product private details from chaincode state
// ===============================================
func (t *SimpleChaincode) readProductPrivateDetails(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	var name, jsonResp string
	var err error

	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting name of the product to query")
	}

	name = args[0]
	valAsbytes, err := stub.GetPrivateData("collectionProductPrivateDetails", name) //get the product private details from chaincode state
	if err != nil {
		jsonResp = "{\"Error\":\"Failed to get private details for " + name + ": " + err.Error() + "\"}"
		return shim.Error(jsonResp)
	} else if valAsbytes == nil {
		jsonResp = "{\"Error\":\"Product private details does not exist: " + name + "\"}"
		return shim.Error(jsonResp)
	}

	return shim.Success(valAsbytes)
}

// ==================================================
// delete - remove a product key/value pair from state
// ==================================================
func (t *SimpleChaincode) delete(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	fmt.Println("- start delete product")

	type productDeleteTransientInput struct {
		Name string `json:"name"`
	}

	if len(args) != 0 {
		return shim.Error("Incorrect number of arguments. Private product name must be passed in transient map.")
	}

	transMap, err := stub.GetTransient()
	if err != nil {
		return shim.Error("Error getting transient: " + err.Error())
	}

	if _, ok := transMap["product_delete"]; !ok {
		return shim.Error("product_delete must be a key in the transient map")
	}

	if len(transMap["product_delete"]) == 0 {
		return shim.Error("product_delete value in the transient map must be a non-empty JSON string")
	}

	var productDeleteInput productDeleteTransientInput
	err = json.Unmarshal(transMap["product_delete"], &productDeleteInput)
	if err != nil {
		return shim.Error("Failed to decode JSON of: " + string(transMap["product_delete"]))
	}

	if len(productDeleteInput.Name) == 0 {
		return shim.Error("name field must be a non-empty string")
	}

	// to maintain the color~name index, we need to read the product first and get its color
	valAsbytes, err := stub.GetPrivateData("collectionProducts", productDeleteInput.Name) //get the product from chaincode state
	if err != nil {
		return shim.Error("Failed to get state for " + productDeleteInput.Name)
	} else if valAsbytes == nil {
		return shim.Error("Product does not exist: " + productDeleteInput.Name)
	}

	var productToDelete product
	err = json.Unmarshal([]byte(valAsbytes), &productToDelete)
	if err != nil {
		return shim.Error("Failed to decode JSON of: " + string(valAsbytes))
	}

	// delete the product from state
	err = stub.DelPrivateData("collectionProducts", productDeleteInput.Name)
	if err != nil {
		return shim.Error("Failed to delete state:" + err.Error())
	}

	// Also delete the product from the color~name index
	indexName := "color~name"
	colorNameIndexKey, err := stub.CreateCompositeKey(indexName, []string{productToDelete.Color, productToDelete.Name})
	if err != nil {
		return shim.Error(err.Error())
	}
	err = stub.DelPrivateData("collectionProducts", colorNameIndexKey)
	if err != nil {
		return shim.Error("Failed to delete state:" + err.Error())
	}

	// Finally, delete private details of product
	err = stub.DelPrivateData("collectionProductsPrivateDetails", productDeleteInput.Name)
	if err != nil {
		return shim.Error(err.Error())
	}

	return shim.Success(nil)
}

// ===========================================================
// transfer a product by setting a new owner name on the product
// ===========================================================
func (t *SimpleChaincode) transferProduct(stub shim.ChaincodeStubInterface, args []string) pb.Response {

	fmt.Println("- start transfer product")

	type productTransferTransientInput struct {
		Name  string `json:"name"`
		Owner string `json:"owner"`
	}

	if len(args) != 0 {
		return shim.Error("Incorrect number of arguments. Private product data must be passed in transient map.")
	}

	transMap, err := stub.GetTransient()
	if err != nil {
		return shim.Error("Error getting transient: " + err.Error())
	}

	if _, ok := transMap["product_owner"]; !ok {
		return shim.Error("product_owner must be a key in the transient map")
	}

	if len(transMap["product_owner"]) == 0 {
		return shim.Error("product_owner value in the transient map must be a non-empty JSON string")
	}

	var productTransferInput productTransferTransientInput
	err = json.Unmarshal(transMap["product_owner"], &productTransferInput)
	if err != nil {
		return shim.Error("Failed to decode JSON of: " + string(transMap["product_owner"]))
	}

	if len(productTransferInput.Name) == 0 {
		return shim.Error("name field must be a non-empty string")
	}
	if len(productTransferInput.Owner) == 0 {
		return shim.Error("owner field must be a non-empty string")
	}

	productAsBytes, err := stub.GetPrivateData("collectionProducts", productTransferInput.Name)
	if err != nil {
		return shim.Error("Failed to get product:" + err.Error())
	} else if productAsBytes == nil {
		return shim.Error("Product does not exist: " + productTransferInput.Name)
	}

	productToTransfer := product{}
	err = json.Unmarshal(productAsBytes, &productToTransfer) //unmarshal it aka JSON.parse()
	if err != nil {
		return shim.Error(err.Error())
	}
	productToTransfer.Owner = productTransferInput.Owner //change the owner

	productJSONasBytes, _ := json.Marshal(productToTransfer)
	err = stub.PutPrivateData("collectionProducts", productToTransfer.Name, productJSONasBytes) //rewrite the product
	if err != nil {
		return shim.Error(err.Error())
	}

	fmt.Println("- end transferProduct (success)")
	return shim.Success(nil)
}

// ===========================================================================================
// getProductsByRange performs a range query based on the start and end keys provided.

// Read-only function results are not typically submitted to ordering. If the read-only
// results are submitted to ordering, or if the query is used in an update transaction
// and submitted to ordering, then the committing peers will re-execute to guarantee that
// result sets are stable between endorsement time and commit time. The transaction is
// invalidated by the committing peers if the result set has changed between endorsement
// time and commit time.
// Therefore, range queries are a safe option for performing update transactions based on query results.
// ===========================================================================================
func (t *SimpleChaincode) getProductsByRange(stub shim.ChaincodeStubInterface, args []string) pb.Response {

	if len(args) < 2 {
		return shim.Error("Incorrect number of arguments. Expecting 2")
	}

	startKey := args[0]
	endKey := args[1]

	resultsIterator, err := stub.GetPrivateDataByRange("collectionProducts", startKey, endKey)
	if err != nil {
		return shim.Error(err.Error())
	}
	defer resultsIterator.Close()

	// buffer is a JSON array containing QueryResults
	var buffer bytes.Buffer
	buffer.WriteString("[")

	bArrayMemberAlreadyWritten := false
	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()
		if err != nil {
			return shim.Error(err.Error())
		}
		// Add a comma before array members, suppress it for the first array member
		if bArrayMemberAlreadyWritten == true {
			buffer.WriteString(",")
		}
		buffer.WriteString("{\"Key\":")
		buffer.WriteString("\"")
		buffer.WriteString(queryResponse.Key)
		buffer.WriteString("\"")

		buffer.WriteString(", \"Record\":")
		// Record is a JSON object, so we write as-is
		buffer.WriteString(string(queryResponse.Value))
		buffer.WriteString("}")
		bArrayMemberAlreadyWritten = true
	}
	buffer.WriteString("]")

	fmt.Printf("- getProductsByRange queryResult:\n%s\n", buffer.String())

	return shim.Success(buffer.Bytes())
}

// =======Rich queries =========================================================================
// Two examples of rich queries are provided below (parameterized query and ad hoc query).
// Rich queries pass a query string to the state database.
// Rich queries are only supported by state database implementations
//  that support rich query (e.g. CouchDB).
// The query string is in the syntax of the underlying state database.
// With rich queries there is no guarantee that the result set hasn't changed between
//  endorsement time and commit time, aka 'phantom reads'.
// Therefore, rich queries should not be used in update transactions, unless the
// application handles the possibility of result set changes between endorsement and commit time.
// Rich queries can be used for point-in-time queries against a peer.
// ============================================================================================

// ===== Example: Parameterized rich query =================================================
// queryProductsByOwner queries for products based on a passed in owner.
// This is an example of a parameterized query where the query logic is baked into the chaincode,
// and accepting a single query parameter (owner).
// Only available on state databases that support rich query (e.g. CouchDB)
// =========================================================================================
func (t *SimpleChaincode) queryProductsByOwner(stub shim.ChaincodeStubInterface, args []string) pb.Response {

	//   0
	// "bob"
	if len(args) < 1 {
		return shim.Error("Incorrect number of arguments. Expecting 1")
	}

	owner := strings.ToLower(args[0])

	queryString := fmt.Sprintf("{\"selector\":{\"docType\":\"product\",\"owner\":\"%s\"}}", owner)

	queryResults, err := getQueryResultForQueryString(stub, queryString)
	if err != nil {
		return shim.Error(err.Error())
	}
	return shim.Success(queryResults)
}

// ===== Example: Ad hoc rich query ========================================================
// queryProducts uses a query string to perform a query for products.
// Query string matching state database syntax is passed in and executed as is.
// Supports ad hoc queries that can be defined at runtime by the client.
// If this is not desired, follow the queryProductsForOwner example for parameterized queries.
// Only available on state databases that support rich query (e.g. CouchDB)
// =========================================================================================
func (t *SimpleChaincode) queryProducts(stub shim.ChaincodeStubInterface, args []string) pb.Response {

	//   0
	// "queryString"
	if len(args) < 1 {
		return shim.Error("Incorrect number of arguments. Expecting 1")
	}

	queryString := args[0]

	queryResults, err := getQueryResultForQueryString(stub, queryString)
	if err != nil {
		return shim.Error(err.Error())
	}
	return shim.Success(queryResults)
}

// =========================================================================================
// getQueryResultForQueryString executes the passed in query string.
// Result set is built and returned as a byte array containing the JSON results.
// =========================================================================================
func getQueryResultForQueryString(stub shim.ChaincodeStubInterface, queryString string) ([]byte, error) {

	fmt.Printf("- getQueryResultForQueryString queryString:\n%s\n", queryString)

	resultsIterator, err := stub.GetPrivateDataQueryResult("collectionProducts", queryString)
	if err != nil {
		return nil, err
	}
	defer resultsIterator.Close()

	// buffer is a JSON array containing QueryRecords
	var buffer bytes.Buffer
	buffer.WriteString("[")

	bArrayMemberAlreadyWritten := false
	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()
		if err != nil {
			return nil, err
		}
		// Add a comma before array members, suppress it for the first array member
		if bArrayMemberAlreadyWritten == true {
			buffer.WriteString(",")
		}
		buffer.WriteString("{\"Key\":")
		buffer.WriteString("\"")
		buffer.WriteString(queryResponse.Key)
		buffer.WriteString("\"")

		buffer.WriteString(", \"Record\":")
		// Record is a JSON object, so we write as-is
		buffer.WriteString(string(queryResponse.Value))
		buffer.WriteString("}")
		bArrayMemberAlreadyWritten = true
	}
	buffer.WriteString("]")

	fmt.Printf("- getQueryResultForQueryString queryResult:\n%s\n", buffer.String())

	return buffer.Bytes(), nil
}
