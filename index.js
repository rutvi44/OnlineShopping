
const express = require("express");
const path = require("path");
const { check, validationResult } = require("express-validator");
const mongoose = require("mongoose");

//mongoDB connection setup
const uri = "mongodb://127.0.0.1:27017/Juices";
mongoose.connect(uri).then(() => {
    console.log("Connect with MongoDB!!");
});

//Define a order Model
const Order = mongoose.model(
    "Order",
    new mongoose.Schema(
        {
            name: String,
            phone: String,
            mango: Number,
            berry: Number,
            Apple: Number,
            grossAmt: Number,
            taxAmount: Number,
            totalCost: Number,
        },
        { collection: "orders" }
    )
);

//Create an express app
const app = express();
const port = 4015;

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: false }));

app.get("/", (req, res) => {
    res.render("main");
});

//to validate all inputs and print the reciept
app.post(
    "/reciept",
    [
        check("name", "Please Enter your valid Name").notEmpty(),
        check("phone", "Please Enter your valid Phonenumber").matches(/^\d{3}-\d{3}-\d{4}$/),
        check("mango", "Please Enter quantity of mango juice").isNumeric(),
        check("berry", "Please Enter quantity of berry juice").isNumeric(),
        check("Apple", "Please Enter quantity of Apple juice").isNumeric(),
    ],
    (req, res) => {
        var name = req.body.name;
        var phone = req.body.phone;
        var mango = parseInt(req.body.mango);
        var berry = parseInt(req.body.berry);
        var Apple = parseInt(req.body.Apple);

        let errors = validationResult(req);
        console.log(req.body);

        //Calculation for all products
        if (!errors.isEmpty()) {
            res.render("main", { errors: errors.array() });
        } else {
            const provinceTax = {
                Ontario: 13.00
            };

            const taxRate = 13.00 || 0;

            var item1Prize = 2.99;
            var item2Prize = 1.99;
            var item3Prize = 2.49;

            var item1Qnt = mango;
            var item2Qnt = berry;
            var item3Qnt = Apple;
            var netAmount = item1Qnt * item1Prize + item2Qnt * item2Prize + item3Qnt * item3Prize;
            var tax = netAmount * taxRate / 100;
            var netCost = netAmount + tax;

            var newOrder = new Order({
                name: name,
                phone: phone,
                mango: mango,
                berry: berry,
                Apple: Apple,
                grossAmt: netAmount,
                taxAmount: tax,
                totalCost: netCost,
            });

            newOrder
                .save()
                .then(function (savedOrder) {
                    console.log("New Order Created.");
                    res.render("reciept", { order: savedOrder });
                })
                .catch(function (error) {
                    console.log("Error saving order: ", error);
                    res.render("error", {
                        message: "Please try again!.",
                    });
                });
        }
    }
);

app.get("/allorders", function (req, res) {
    Order.find({})
        .then((orders) => {
            console.log("Collected Orders:", orders);
            res.render("allorders", { orders: orders });
        })
        .catch((error) => {
            console.error("Error fetching data:", error);
            res.status(500).render("error", { message: "Error fetching data from the database." });
        });
});

//start the server
app.listen(port, () => {
    console.log(`Click the link to open App in Browser http://localhost:${port}`);
});
