var inquirer = require("inquirer");
var mySQL = require("mySQL");
var colors = require("colors");

// Connect to mySQL data

var connection = mySQL.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "root",
    database: "bamazon_db"
});

// Create Global Vars
var itemID;
var products = [];
var initialQuantity;
var leftQuantities = [];
var productNameSelected;

// Create functions

// Provide options to the manager

function getStarted() {
    inquirer.prompt([
        {
            message: "What would you like to do?",
            type: "list",
            choices: ["View inventory", "Low inventory", "Purchase inventory", "Purchase new products", "Complete"],
            name: "command"
        }
    ]).then(function (response) {
        switch (response.command) {
            case "View inventory":
                currentInventory();
                break;
            case "Low inventory":
                lowInventory();
                break;
            case "Purchase inventory":
                reStock();
                break;
            case "Purchase new products":
                addNewProduct();
                break;
            case "Complete":
                console.log(("\nYou have completed your manager duties.\n".america));
                connection.end();
            default:
                break;
        }
    });
};

// View current inventory

function currentInventory() {
    var query = "SELECT * FROM products";
    connection.query(query, function (err, res) {
        if (err) throw err;
        console.log(("\nCurrent inventory is shown below:\n".yellow));
        console.table(res);
        getStarted();
    });
};

// View low inventory

function lowInventory() {
    var query = "SELECT * FROM products WHERE stock_quantity < 250";
    connection.query(query, function (err, res) {
        if (err) throw err;
        console.log(("\nProducts that have fewer than 250 quantity are shown below:\n".yellow));
        console.table(res);
        getStarted();
    });
};

// re-stock low inventory

function reStock() {
    inquirer.prompt([
        {
            message: "Which product needs to have more purchased?",
            type: "list",
            choices: products,
            name: "inventory"
        },
        {
            message: "Type in the number of units you would like to re-stock.",
            name: "reStockAmount",
            // Requiring user to input a number
            validate: function (value) {
                if (isNaN(value) === false) {
                    return true;
                }
                return false;
            }
        }
    ]).then(function (response) {
        if (isNaN(response.reStockAmount) || parseInt(response.reStockAmount) <= 0) {
            console.log(("\nYou have to restock at least 1.\n".red));
            reStock();
        }
        else {
            productNameSelected = response.inventory;
            itemID = products.indexOf(productNameSelected) + 1;
            initialQuantity = leftQuantities[itemID - 1];
            var amount = parseInt(response.reStockAmount);
            console.log(("\nInventory purchased!\n".green));
            var query = "UPDATE products SET ? WHERE ?";
            connection.query(query, [
                { stock_quantity: initialQuantity + amount },
                { item_id: itemID }
            ], function (err, res) {
                products = [];
                leftQuantities = [];
                if (err) throw err;
                populateTable();
                getStarted();
            });
        }
    })
};

// add new product to inventory

function addNewProduct() {
    inquirer.prompt([
        {
            message: "Type in what product you'd like to add to the inventory: ",
            name: "newProduct"
        },
        {
            message: "Type in what department the new product will be classified under.",
            name: "department"
        },
        {
            message: "Type in the price for the new product.",
            name: "price"
        },
        {
            message: "Type in how many you'd like to add to the inventory.",
            name: "initInvent",
            // Requiring user to input a number
            validate: function (value) {
                if (isNaN(value) === false) {
                    return true;
                }
                return false;
            }
        }
    ]).then(function (response) {
        if (isNaN(response.price) || isNaN(response.initInvent) || parseInt(response.price) <= 0 || parseInt(response.initInvent) <= 0) {
            console.log(("\nYou have to stock at least 1.\n".red));
            addNewProduct();
        }
        else {
            var product = response.newProduct;
            var department = response.department;
            var price = response.price;
            var stockAmount = response.initInvent;
            var query = "INSERT INTO products SET ?";
            connection.query(query, [
                {
                    product_name: product,
                    department_name: department,
                    price: price,
                    stock_quantity: stockAmount
                }
            ], function (err, res) {
                console.log(("\nSuccessfully added new product.\n".green));
                products = [];
                leftQuantities = [];
                if (err) throw err;
                populateTable();
                getStarted();
            });
        }
    })
}

function populateTable() {
    var query = "SELECT * FROM products";
    connection.query(query, function (err, res) {
        if (err) throw err;
        for (items in res) {
            products.push(res[items].product_name);
            leftQuantities.push(res[items].stock_quantity);
        };
    });
};


connection.connect(function (err) {
    if (err) throw err;
    populateTable();
    getStarted();
});