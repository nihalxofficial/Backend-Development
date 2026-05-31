CREATE TABLE customers (
    cust_id SERIAL PRIMARY KEY,
    cust_name VARCHAR(100) NOT NULL
);

INSERT INTO customers (cust_name)
VALUES
    ('Raju'), ('Sham'), ('Paul'), ('Alex');

CREATE TABLE orders (
    ord_id SERIAL PRIMARY KEY,
    ord_date DATE NOT NULL,
    cust_id INTEGER NOT NULL,
    FOREIGN KEY (cust_id) REFERENCES customers(cust_id)
);

INSERT INTO orders (ord_date, cust_id)
VALUES
    ('2024-01-01', 1),  -- Raju first order
    ('2024-02-01', 2),  -- Sham first order
    ('2024-03-01', 3),  -- Paul first order
    ('2024-04-04', 2);  -- Sham second order

CREATE TABLE products (
    p_id SERIAL PRIMARY KEY,
    p_name VARCHAR(100) NOT NULL,
    price NUMERIC NOT NULL
);

INSERT INTO products (p_name, price)
VALUES
    ('Laptop', 55000.00),
    ('Mouse', 500),
    ('Keyboard', 800.00),
    ('Cable', 250.00);


CREATE TABLE order_items (
    item_id SERIAL PRIMARY KEY,
    ord_id INTEGER NOT NULL,
    p_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    FOREIGN KEY (ord_id) REFERENCES orders(ord_id),
    FOREIGN KEY (p_id) REFERENCES products(p_id)
);

INSERT INTO order_items (ord_id, p_id, quantity)
VALUES
    (1, 1, 1),  -- Raju ordered 1 Laptop
    (1, 4, 2),  -- Raju ordered 2 Cables
    (2, 1, 1),  -- Sham ordered 1 Laptop
    (3, 2, 1),  -- Paul ordered 1 Mouse
    (3, 4, 5),  -- Paul ordered 5 Cables
    (4, 3, 1);  -- Sham ordered 1 Keyboard

alter table order_items
rename to billing;

select * from billing;







select c.cust_name as customer_name, p.p_name as product_name,
	o.ord_date as order_date, b.quantity, p.price as price, (b.quantity*p.price) as total_price  
from billing b
join products p on b.p_id = p.p_id
join orders o on b.ord_id = o.ord_id
join customers c on o.cust_id= c.cust_id;


select c.cust_name as customer_name, count(o.ord_id) as total_orders, sum(b.quantity*p.price) as total_cost  
from billing b
join products p on b.p_id = p.p_id
join orders o on b.ord_id = o.ord_id
join customers c on o.cust_id= c.cust_id group by c.cust_name;



create view biiling_info as
select c.cust_name as customer_name, p.p_name as product_name,
	o.ord_date as order_date, b.quantity, p.price as price, (b.quantity*p.price) as total_price  
from billing b
join products p on b.p_id = p.p_id
join orders o on b.ord_id = o.ord_id
join customers c on o.cust_id= c.cust_id;

select * from biiling_info;

alter table biiling_info
rename to billing_info;

select * from billing_info;


select product_name,  count(customer_name)as total_customers, sum(quantity)  as total_sale, sum(total_price) as total_cost 
from billing_info
group by product_name having sum(total_price) >= 1000 order by total_cost desc;


select coalesce(product_name, 'Total'),  count(customer_name)as total_customers, sum(quantity)  as total_sale, sum(total_price) as total_cost 
from billing_info
group by rollup(product_name) order by total_cost;
