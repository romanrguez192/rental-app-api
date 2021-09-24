const mongoose = require("mongoose");
const auth = require("../../../src/middlewares/auth");
const { Customer } = require("../../../src/models/Customer");
const { Studio } = require("../../../src/models/Studio");

describe("auth middleware", () => {
  it("should add the user to the request object if it's a customer", () => {
    const customer = new Customer({
      name: "My customer",
      phone: "1234567890",
      user: {
        _id: new mongoose.Types.ObjectId(),
        email: "email@mail.com",
      },
    });

    const token = customer.generateAuthToken();
    const req = { header: jest.fn().mockReturnValue(token) };
    const res = {};
    const next = jest.fn();

    auth(req, res, next);

    const user = {
      _id: customer.user._id,
      role: "Customer",
      customer: {
        _id: customer._id,
      },
    };

    expect(req.user).toMatchObject(user);
  });

  it("should add the user to the request object if it's a studio", () => {
    const studio = new Studio({
      name: "My studio",
      phone: "1234567890",
      user: {
        _id: new mongoose.Types.ObjectId(),
        email: "email@mail.com",
      },
    });

    const token = studio.generateAuthToken();
    const req = { header: jest.fn().mockReturnValue(token) };
    const res = {};
    const next = jest.fn();

    auth(req, res, next);

    const user = {
      _id: studio.user._id,
      role: "Studio",
      studio: {
        _id: studio._id,
      },
    };

    expect(req.user).toMatchObject(user);
  });
});
