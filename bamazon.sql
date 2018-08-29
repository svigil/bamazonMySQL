DROP DATABASE IF EXISTS bamazon_db;
CREATE DATABASE bamazon_db;

USE bamazon_db;

CREATE TABLE products (
 item_id INTEGER NOT NULL AUTO_INCREMENT,
 product_name VARCHAR(50) NOT NULL,
 department_name VARCHAR(50) NULL,
 price DECIMAL(10, 2) NOT NULL,
 stock_quantity INTEGER(10) NOT NULL,
 PRIMARY KEY (item_id)
);

INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ("speaker", "electronics", 25.50, 50),
	("phone", "electronics", 400.00, 100),
    ("amp", "electronics", 105.25, 75),
    ("apples", "grocery", 1.25, 5000),
    ("protein bars", "grocery", 2.70, 2500),
    ("coffee", "grocery", 10.99, 1000),
    ("chair", "household", 27.50, 280),
    ("pillow", "household", 45.35, 260),
    ("desk", "household", 150.99, 275),
    ("skillet", "kitchen", 45.60, 195),
    ("knife set", "kitchen", 250.25, 400),
    ("peeler", "kitchen", 5.65, 679);
    