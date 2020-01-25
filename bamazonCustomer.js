const mysql = require("mysql");
const inquirer = require("inquirer");

const connection = mysql.createConnection({
  host: "localhost",

  port: 3306,

  user: "root",
  password: "Ultra!23",

  database: "bamazon"
});

//connection
connection.connect(function(err) {
  if (err) {
    console.error("error connecting: " + err.stack);
  }
  loadProducts();
});

function loadProducts() {
  connection.query("SELECT * FROM products", function(err, res) {
    if (err) throw err;

    //Should be all the products from the bamazon database. this will load on connection to server.
    console.table(res);
    promptCustomer(res);
  });
}
function promptCustomer(inventory) {
  inquirer
    .prompt([
      {
        type: "input",
        name: "choice",
        message: "What is the id of the item you want to buy? [Quit with Q]",
        validate: function(val) {
          return !isNaN(val) || val.toLowerCase() === "q";
        }
      }
    ])
    .then(function(val) {
      let choiceId = parseInt(val.choice);

      let product = checkInventory(choiceId, inventory);

      if (product) {
        promptForQuantity(product);
      }
    });
}

function checkInventory(choiceId, inventory) {
  for (let i = 0; i < inventory.length; i++) {
    const item = inventory[i];
    if (item.item_id === choiceId) {
      console.log(item);
      return item;
    }
  }
  return null;
}

function promptForQuantity(product) {
  inquirer
    .prompt([
      {
        type: "input",
        name: "quantity",
        message: "How many would you like to buy? [Quit with Q]",
        validate: function(val) {
          return val > 0 || val.toLowerCase() === "q";
        }
      }
    ])
    .then(function(val) {
      const quantity = parseInt(val.quantity);

      if (quantity < product.stock_quantity) {
        console.log("No stock available");

        loadProducts();
      } else {
        makePurchase(product, quantity);
      }
    });
}

function makePurchase(product, quantity) {
  connection.query(
    "UPDATE products SET stock_quantity = stock_quantity - ? WHERE item_id = ?",
    [quantity, product.item_id],
    function(err, res) {
      if (err) throw err;

      console.log(
        "\n You have purchased " + quantity + " " + product.product_name + "'s!"
      );

      loadProducts();
    }
  );
}
