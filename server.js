require("dotenv").config();
const express = require("express");
const path = require("path"); // for handling paths and stuff
const joi = require("@hapi/joi"); // used to validate forms easier
const jwt = require("jsonwebtoken"); // handles sessions
const bcrypt = require("bcryptjs"); // hashes passwords

//connecting to the database
const { Pool, Client } = require("pg");
const { env } = require("process");
const { response } = require("express");
const pool = new Pool({
  user: "website",
  host: "localhost",
  database: "florist",
  password: "password",
});

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
//set static folder
app.use("/public", express.static(path.join(__dirname, "/public")));
// secret key for jwt
const MySecretKey = process.env.SecretKey;
// port that the server runs on
const PORT = process.env.PORT || 8000;

const sleep = (milliseconds) => {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

//scheme to validate login info
const SignInSchema = joi.object({
  username: joi.string().min(6).required(),
  password: joi.string().min(8).required(),
});

// checks the jwt token to see if the user is authorized o rnot
function authorize(req, res, next) {
  req.authorized = false;
  if (req.headers.cookie != null) {
    const [type, token] = req.headers.cookie.split("=");
    try {
      const user = jwt.verify(token, MySecretKey);
      req.user = user;
      req.authorized = true;
    } catch (error) {
      // do nothing, login page will be rendered
    }
  }
  next();
}
//transforms the results of a common query(from the db) into a better format to use in render
function wellFormattedBouqs(result, quant, status) {
  let bouqs = [];
  result.rows.forEach((element) => {
    try {
      if (bouqs[element.bouq_id - 1].flowers) {
        //
      }
    } catch (TypeError) {
      bouqs[element.bouq_id - 1] = {
        bouq_id: element.bouq_id,
        flowers: [],
        price: 0,
      };
      if (quant) {
        bouqs[element.bouq_id - 1].quantity = element.quant;
      }
      if (status) {
        bouqs[element.bouq_id - 1].status = element.status;
      }
    }

    bouqs[element.bouq_id - 1].flowers.push({
      flower_name: element.flower_name,
      quantity: element.quantity,
      price: element.price,
    });
    bouqs[element.bouq_id - 1].price += element.price * element.quantity;
  });
  return bouqs;
}


async function addToCart(bouq_id, username) {
  const query = `select * 
                  from  cart
                  where bouq_id=$1 and customer=$2`;
    let details = [parseInt(bouq_id), username];
    const orders = await pool.query(query, details);
    if (orders.rowCount !== 0) {
      let quantity = orders.rows[0].quantity + 1;
      details.push(quantity);
      const updateQuery = `update cart
                set quantity=$3
                where bouq_id=$1 and customer=$2`;
      const insert = await pool.query(updateQuery, details);
    } else {
      const insertQuery = `insert into cart values($2, $1, 1)`;
      const done = await pool.query(insertQuery, details);
    }
}
//home page
app.get("/", authorize, async (req, res) => {
  if (req.authorized) {
    if (req.user.type === 0) {
      const query = `SELECT  bouq_id, flower_name, f.price, quantity
                      from bouquet b, flowers f
                      where b.bouq_customer is null 
                      and b.flower_name = f.name`;

      pool.query(query, (err, result) => {
        let bouqs = wellFormattedBouqs(result, false);
        res.render("home_customer", { bouquets: bouqs });
      });
    }else if(req.user.type === 1 ){
      const query = ` SELECT distinct order_id, customer from orders where status = 1`;
      let ordersRes = await pool.query(query);
      if(ordersRes.rowCount === 0){
        res.render("employee_home", {orders: []});
      } 
      let orders = [];
      let i = 0;
      ordersRes.rows.forEach(async (order) => {
        orders.push({id: order.order_id, bouquets: [], price:0, customer: order.customer});
        const orderQuery = `select o.bouq_id, o.quantity as quant, o.status, b.quantity  ,b.flower_name, f.price
                            from orders o , bouquet b , flowers f
                            where order_id =$1 and o.status=1 and  b.bouq_id= o.bouq_id and b.flower_name = f.name`
        let orderContent = await pool.query(orderQuery, [order.order_id]);
        orders[i].bouquets = wellFormattedBouqs(orderContent, true, true);   
        orders[i].bouquets.forEach(element => {
            orders[i].price += element.price*element.quantity;
        });                 
        i++;
        if(i === ordersRes.rows.length){
          res.render('employee_home', {orders: orders});
        }
      });
    }
  } else {
    res.render("login");
  }
});

app.post("/login", (req, res) => {
  var response = { error: true, message: "", token: "" };
  //validating login info
  const { error, valid } = SignInSchema.validate(req.body);
  if (error) {
    response.message =
      "Please make sure you entered a valid username and password";
    res.json(response);
  } else {
    const sql = "SELECT * from users where username=$1";
    const username = req.body.username;
    pool.query(sql, [username], (err, result) => {
      if (err) throw err;
      if (result.rowCount !== 0) {
        //username exists in database
        const password = result.rows[0].password;
        const type = result.rows[0].type;
        bcrypt.compare(req.body.password, password, (err, valid) => {
          //compare password with hashed one
          if (err) throw err;
          if (valid) {
            // if the passwords match
            jwt.sign({ username, type }, MySecretKey, (err, tok) => {
              if (err) throw err;
              res.status(201).send({ token: tok }); // succeful login
            });
          } else {
            //invalid password
            response.message = "Incorrect password!";
            res.json(response);
          }
        });
      } else {
        //user does not exist
        response.message = "User not found!";
        res.json(response);
      }
    });
  }
});

//logging out
app.get("/logout", (req, res) => {
  res.cookie("authToken", null);
  res.redirect("/");
});

app.post("/addToCart", authorize, async (req, res) => {
  if (req.authorized) {
    addToCart(req.body.bouq_id, req.user.username);
    res.json({ message: "Item Added" });
  } else {
    res.redirect("/");
  }
});

app.post("/removeFromCart", authorize, async (req, res) => {
  if (req.authorized) {
    let details = [parseInt(req.body.bouq_id), req.user.username];
    // get current quantity
    let res1 = await pool.query(
      `select quantity from cart where bouq_id=$1 and customer=$2`,
      details
    );

    let query = "";
    if (res1.rows[0].quantity == 1) {
      // if theres only one left, delete it
      query = `delete from cart  
                where bouq_id=$1 and customer=$2`;
    } else {
      //if there are more than one remove one from cart
      details.push(res1.rows[0].quantity - 1);
      query = `update cart
                set quantity=$3  
                where bouq_id=$1 and customer=$2`;
    }
    const updated = await pool.query(query, details);
    res.json({ message: "Item removed!" });
  } else {
    res.redirect("/");
  }
});

app.get("/MyCart", authorize, async (req, res) => {
  if (req.authorized  && req.user.type === 0) {
    let details = [req.user.username];
    const query = `select c.bouq_id, c.quantity as quant, b.flower_name, b.quantity, f.price
                  from cart c, bouquet b, flowers f
                  where customer=$1 and c.bouq_id = b.bouq_id and b.flower_name = f.name`;
    const result = await pool.query(query, details);
    if (result.rowCount > 0) {
      let bouqs = wellFormattedBouqs(result, true);
      res.render("cart", { bouquets: bouqs });
    } else {
      res.render("cart", { bouquets: [] });
    }
  } else {
    res.redirect("/");
  }
});

app.get("/Orders", authorize, async (req, res) => {
  if (req.authorized  && req.user.type === 0) {
    let details = [req.user.username];
    const query = `select DISTINCT order_id from orders where customer=$1`
    const result = await pool.query(query, details);
    if (result.rowCount > 0) {
      let orders = [];
      let i = 0;
      result.rows.forEach( async (order) => {
        orders.push({id: order.order_id, bouquets: [], price: 0});  
        const orderQuery = `select o.bouq_id, o.quantity as quant, o.status, b.quantity  ,b.flower_name, f.price
                            from orders o , bouquet b , flowers f
                              where order_id =$1 and  b.bouq_id= o.bouq_id and b.flower_name = f.name;`
        let orderContent = await pool.query(orderQuery, [order.order_id]);
        orders[i].bouquets = wellFormattedBouqs(orderContent, true, true);
        orders[i].bouquets.forEach(element => {
          orders[i].price += element.price*element.quantity;
        });
        i++;
        if(i === result.rows.length){
          res.render('orders', {orders: orders});
        }
      });
    } else {
      res.render("orders", { orders: [] });
    }
  } else {
    res.redirect("/");
  }
});

app.get("/customOrder", authorize, async (req, res) => {
  if (req.authorized && req.user.type === 0) {
    const query = `select * from flowers`;
    const result = await pool.query(query);
    res.render("customOrder", { flowers: result.rows });
  } else {
    res.redirect("/");
  }
});

app.post("/order", authorize, async (req, res) => {
  if (req.authorized) {
    //getting the content of the user's cart
    let details = [req.user.username];
    const cartQuery = `select DISTINCT customer, c.bouq_id, c.quantity, b.bouq_customer 
                    from cart c, bouquet b
                    where customer=$1 and c.bouq_id=b.bouq_id`;
    const cart = await pool.query(cartQuery, details);
    if (cart.rowCount === 0) {
      res.json({ message: "Your cart is empty!" });
    }


    //selecting max order_id from orders
    const orderQuery = `select max(order_id) from orders`;
    let max_order = await pool.query(orderQuery)
    let order_id = 1;
    if(max_order.rows[0] === null){
      order_id = parseInt(max_order.rows[0].max) + 1;
    }

    //inserting orders into orders table
    const insertOrder = `insert into orders values($1, $2, $3, $4, $5)`
    cart.rows.forEach(async (element) => {
      let orderDetails = [order_id, element.bouq_id, element.quantity, element.customer];
      
      if(element.bouq_customer == null){
        orderDetails.push(2);
      }else {
        orderDetails.push(1);
      }
      let insert = await pool.query(insertOrder, orderDetails);
    });
    //emptying the cart

    const emptyCart = `delete from cart where customer=$1`;
    let empty = await pool.query(emptyCart, details);
    res.json({message : 'Your order has been finalized, Thanks for shopping with us'});
  } else {
    res.redirect("/");
  }
});

app.post('/custom', authorize, async (req, res) => {
 if(req.authorized){
    let username = req.user.username;
    let flowers = req.body.flowers;
    //get max bouq_id
    let bouQuery = await pool.query('select max(bouq_id) from bouquet');
    let maxBouq_id = bouQuery.rows[0].max + 1;
    //inserting the new custom bouquet with its flowers and customer name
    let insertBouQuery = `insert into bouquet values($1, $2, $3, $4)`;
    flowers.forEach( async (flower) => {
      let insertDetails = [maxBouq_id, flower[0], flower[1], username];
      let ins = await pool.query(insertBouQuery, insertDetails);
    });

    await addToCart(maxBouq_id, req.user.username);

    res.json({message : 'This item has been added to you cart!'});
 }else {
   res.render('/');
 }
});

app.post('/markDone', authorize, async (req, res) => {
  if(req.authorized){
    if(req.user.type === 1){
      let order = req.body.order;
      let doneOrder = [order.order_id, order.bouq_id, order.customer];
      const query = `update orders
                      set status = 2
                      where order_id=$1 and bouq_id=$2 and customer=$3`;
      let update = await pool.query(query, doneOrder);
      res.json({message: 'Order has been marked as done !'});
    }
  }
  if(!req.authorized || !(req.user.type === 1)){
    res.status(401).send("YOU ARE NOT AUTHORIZED TO DO THIS");
  }
  
});


app.listen(PORT, () => console.log(`server started on ${PORT} : ${Date()}`));
