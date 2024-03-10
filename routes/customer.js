const express = require('express');
const router = express.Router();
const customerController = require("../controller/customer");

router.route("/")
    .post(customerController.createCustomer)
    .get(customerController.getAllCustomer);

router.route("/:id").get(customerController.getCustomerById);

router.route("/create-multiple").post(customerController.createMultipleCustomer);

router.get("/get-city-customer-count",customerController.getCityAndCustomersCount);

module.exports = router;