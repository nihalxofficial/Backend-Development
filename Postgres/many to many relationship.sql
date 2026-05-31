create table students(s_id serial primary key, s_name varchar(100) not null default 'student');
create table courses(c_id serial primary key, c_name varchar(200) not null, fee numeric not null default 0);
create table enrollment(e_id serial primary key, s_id int not null, c_id int not null, enrollment_date date not null,
foreign key (s_id) references students(s_id), foreign key (c_id) references courses(c_id));

INSERT INTO students (s_name) VALUES
  ('John Smith'),
  ('Sara Ahmed'),
  ('Ravi Kumar');

  INSERT INTO courses (c_name, fee) VALUES
  ('Web Development',    299.99),
  ('Data Science',       499.99),
  ('Graphic Designing',  199.99);

INSERT INTO enrollment (s_id, c_id, enrollment_date)
VALUES
(1, 1, '2025-01-10'),
(2, 2, '2025-01-12'),
(3, 1, '2025-01-15'),
(1, 3, '2025-01-20'),
(2, 1, '2025-01-25');

select s_name, c_name, fee, enrollment_date from enrollment e
join students s on e.s_id = s.s_id
join courses c on c.c_id = e.c_id;

select s_name as student_name, count(e_id) as total_course, sum(fee) as total_fee from enrollment e
join students s on e.s_id = s.s_id
join courses c on c.c_id = e.c_id group by s_name;
  