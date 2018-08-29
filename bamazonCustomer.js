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
var productPriceArray = [];
var productPrice = 0;
var totalCost = 0;

// Create Functions

// What is for sale?
function buyProducts() {
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;
        console.table(res);
        for (item in res) {
            products.push(res[item].product_name);
            leftQuantities.push(res[item].stock_quantity);
            productPriceArray.push(res[item].price);
        };
        inquirer.prompt([
            {
                message: "What would you like to buy?",
                type: "list",
                choices: products,
                name: "addToShoppingCart"
            }
        ]).then(function (response) {
            productNameSelected = response.addToShoppingCart;
            itemID = products.indexOf(productNameSelected) + 1;
            initialQuantity = leftQuantities[itemID - 1];
            productPrice = productPriceArray[itemID - 1];
            howMany();
        })
    });
};

// Function asking how many they would like to buy

function howMany() {
    inquirer.prompt([
        {
            message: "Type in how many you would like to purchase.",
            name: "quantityShoppingCart",
            // Requiring user to input a number
            validate: function (value) {
                if (isNaN(value) === false) {
                    return true;
                }
                return false;
            }
        }
    ]).then(function (response) {
        var amount = response.quantityShoppingCart;
        // Requiring user to input number greater than 0
        if (isNaN(amount) || amount <= 0) {
            console.log(("\nYou have to at least buy 1.\n".yellow));
            howMany();
        }
        // Requiring user to not buy more than what is in stock
        else if (amount > initialQuantity) {
            console.log(("\nSelect a different amount. We don't have that many in stock.\n".yellow));
            howMany();
        } else {
            connection.query("UPDATE products SET ? WHERE ?", [
                { stock_quantity: initialQuantity - amount },
                { item_id: itemID }
            ], function (err, res) {
                if (err) throw err;
                console.log(("\nGreat success!\n".blue));
                totalCost += (productPrice * amount);
                console.log(("Your total comes to $" + totalCost + "\n".blue));
                // Asks user to continue shopping or checkout
                inquirer.prompt([
                    {
                        message: "Do you want to continue shopping or move to your cart?",
                        type: "confirm",
                        name: "keepShopping"
                    }
                ]).then(function (response) {
                    if (response.keepShopping) {
                        buyProducts();
                    } else {
                        console.log(("Thank you come again!".america));
                        connection.end();
                    }
                })
            });
        };
    });
}

// Make sure connecting to sql server
connection.connect(function (err) {
    if (err) throw err;
    console.log("\nTake a look around to see what we have available!\n".green);
    buyProducts();
});