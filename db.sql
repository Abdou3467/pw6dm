create user website with password 'password';
alter user website with superuser;
create database florist with owner=website;

\c florist;

drop table if exists cart CASCADE;
drop table if exists orders CASCADE;
drop table if exists bouquet CASCADE;
drop table if exists users CASCADE;
drop table if exists flowers CASCADE;

create table users (
    username varchar(30) primary key,
    password varchar(100),
    type int
    -- type is 0 for clients, 1 for florists
);


create table flowers (
    name varchar(50) primary key,
    price int
);


create table bouquet(
    bouq_id int,
    flower_name varchar(50),
    quantity int,
    bouq_customer varchar(30) default null,
    -- bouq_customer  null for premade, customer name for custom ones
    foreign key(bouq_customer) references users(username),
    foreign key(flower_name) references flowers(name),
    primary key(bouq_id, flower_name)
);

create table cart(
    customer varchar(30),
    bouq_id int,
    quantity int,
    foreign key(customer) references users(username),
    primary key(customer, bouq_id)
);

create table orders(
    order_id int,
    bouq_id int,
    quantity int,
    customer varchar(30),
    status int, -- 1 for ordered and waiting preparation, 2 for ready
    primary key(order_id, bouq_id)
);

insert into users values
('customer1', '$2y$12$lbxnjWezZ0fvPKvQP5TdY.9xmqZRPrlPJjhtK727x4GH0nSPVOHsi', 0),
('customer2', '$2y$12$lbxnjWezZ0fvPKvQP5TdY.9xmqZRPrlPJjhtK727x4GH0nSPVOHsi', 0),
('customer3', '$2y$12$lbxnjWezZ0fvPKvQP5TdY.9xmqZRPrlPJjhtK727x4GH0nSPVOHsi', 0),
('florist1', '$2y$12$pH5LHIWggjEuV63ZmMdjZunqYQQR7X9HbI5QywuDEjGO6akiQv2jG', 1),
('florist2', '$2y$12$pH5LHIWggjEuV63ZmMdjZunqYQQR7X9HbI5QywuDEjGO6akiQv2jG', 1),
('florist3', '$2y$12$pH5LHIWggjEuV63ZmMdjZunqYQQR7X9HbI5QywuDEjGO6akiQv2jG', 1);


insert into flowers values
('rose', 10),
('tulip', 15),
('lily', 7),
('orchid', 13),
('iris', 17),
('sunflower', 10);


insert into bouquet values
(1, 'rose', 3),
(1, 'tulip', 4),
(1, 'orchid', 1),
(2, 'lily', 4),
(2, 'iris', 1),
(2, 'tulip', 1),
(3, 'sunflower', 5),
(3, 'iris', 2),
(3, 'rose', 3);

insert into bouquet values
(4, 'tulip', 2, 'customer1'),
(4, 'sunflower', 5, 'customer1'),
(4, 'iris', 6, 'customer1'),
(4, 'rose', 2, 'customer1');


