const { Customer } = require("../../../src/models/Customer");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const config = require("config");

describe("Customer.generateAuthToken", () => {
  it("should return a valid JWT", () => {
    const customer = new Customer({
      name: "My customer",
      phone: "1234567890",
      user: {
        _id: new mongoose.Types.ObjectId(),
        email: "email@mail.com",
      },
    });

    const token = customer.generateAuthToken();
    const jwtSecretKey = config.get("jwtSecretKey");
    const payload = jwt.verify(token, jwtSecretKey);

    const expectedPayload = {
      userId: customer.user._id,
      customerId: customer._id,
      role: "Customer",
    };

    expect(payload).toMatchObject(expectedPayload);
  });
});
