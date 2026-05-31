create table employees (id serial primary key, name varchar(50) not null, age int not null, email varchar(100) not null unique,
dept varchar(50), salary int default 15000, hire_date date default current_date);

insert into employees (name, age, email, dept, salary) values 
('Nihal', 22, 'nihal@gmail.com', 'IT', 50000),
('Rahim', 28, 'rahim@gmail.com', 'HR', 45000),
('Karim', 30, 'karim@gmail.com', 'Finance', 60000),
('Sadia', 25, 'sadia@gmail.com', 'Marketing', 48000),
('Tanvir', 35, 'tanvir@gmail.com', 'IT', 75000),
('Mim', 27, 'mim@gmail.com', 'Sales', 42000),
('Hasan', 32, 'hasan@gmail.com', 'Finance', 68000),
('Nusrat', 24, 'nusrat@gmail.com', 'HR', 40000),
('Sakib', 29, 'sakib@gmail.com', 'IT', 55000),
('Farzana', 31, 'farzana@gmail.com', 'Marketing', 62000);


select * from employees;

update employees set age='25' where id=6;
update employees set salary=60000 where age>30;

delete from employees where dept='Finance';

insert into employees (name, age, email, dept, salary) values ('Ruhan', 22, 'ruhan@gmail.com', 'IT', 50000);


drop table employees;