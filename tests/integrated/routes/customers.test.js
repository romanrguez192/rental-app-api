const request = require("supertest");
const mongoose = require("mongoose");
const server = require("../../../src/");
const { Customer } = require("../../../src/models/Customer");
const { User } = require("../../../src/models/User");
const { Studio } = require("../../../src/models/Studio");

describe("/api/customers", () => {
  afterEach(async () => {
    server.close();
    await User.deleteMany();
    await Customer.deleteMany();
  });

  describe("GET /", () => {
    it("should return all customers", async () => {
      const customers = [
        {
          name: "customer1",
          phone: "1234567890",
          user: {
            _id: mongoose.Types.ObjectId(),
            email: "email@mail.com",
          },
        },
        {
          name: "customer2",
          phone: "1234567890",
          user: {
            _id: mongoose.Types.ObjectId(),
            email: "email@mail.com",
          },
        },
      ];

      await Customer.insertMany(customers);

      const res = await request(server).get("/api/customers");

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body.some((s) => s.name === customers[0].name && s.phone === customers[0].phone)).toBe(true);
      expect(res.body.some((s) => s.name === customers[1].name && s.phone === customers[1].phone)).toBe(true);
    });
  });

  describe("GET /:id", () => {
    it("should return 400 if an invalid id is passed", async () => {
      const res = await request(server).get("/api/customers/1");

      expect(res.status).toBe(400);
    });

    it("should return 404 if no customer with the given id exists", async () => {
      const id = mongoose.Types.ObjectId();
      const res = await request(server).get("/api/customers/" + id);

      expect(res.status).toBe(404);
    });

    it("should return a customer if a valid id is passed and the customer exists", async () => {
      const customer = new Customer({
        name: "customer",
        phone: "1234567890",
        user: {
          _id: mongoose.Types.ObjectId(),
          email: "email@mail.com",
        },
      });

      await customer.save();

      const res = await request(server).get("/api/customers/" + customer._id);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("name", customer.name);
      expect(res.body).toHaveProperty("phone", customer.phone);
      expect(res.body).toHaveProperty("user._id", customer.user._id.toString());
      expect(res.body).toHaveProperty("user.email", customer.user.email);
    });
  });

  describe("POST /", () => {
    let body;

    const sendRequest = () => {
      return request(server).post("/api/customers").send(body);
    };

    beforeEach(() => {
      body = {
        customer: {
          name: "customer",
          phone: "1234567890",
        },
        user: {
          email: "email@mail.com",
          password: "123456",
        },
      };
    });

    it("should return 400 if the user email is missing", async () => {
      body.user.email = undefined;
      const res = await sendRequest();

      expect(res.status).toBe(400);
    });

    it("should return 400 if the user email is not a valid email", async () => {
      body.user.email = "12345";
      const res = await sendRequest();

      expect(res.status).toBe(400);
    });

    it("should return 400 if the user password is missing", async () => {
      body.user.password = undefined;
      const res = await sendRequest();

      expect(res.status).toBe(400);
    });

    it("should return 400 if the user password has less than 6 characters", async () => {
      body.user.password = "12345";
      const res = await sendRequest();

      expect(res.status).toBe(400);
    });

    it("should return 400 if the user password has more than 255 characters", async () => {
      body.user.password = new Array(257).join("a");
      const res = await sendRequest();

      expect(res.status).toBe(400);
    });

    it("should return 400 if the user already exists", async () => {
      await sendRequest();
      const res = await sendRequest();

      expect(res.status).toBe(400);
    });

    it("should return 400 if the customer name is missing", async () => {
      body.customer.name = undefined;
      const res = await sendRequest();

      expect(res.status).toBe(400);
    });

    it("should return 400 if the customer name has less than 5 characters", async () => {
      body.customer.name = "1234";
      const res = await sendRequest();

      expect(res.status).toBe(400);
    });

    it("should return 400 if the customer name has more than 60 characters", async () => {
      body.customer.name = new Array(62).join("a");
      const res = await sendRequest();

      expect(res.status).toBe(400);
    });

    it("should return 400 if the customer phone is missing", async () => {
      body.customer.phone = undefined;
      const res = await sendRequest();

      expect(res.status).toBe(400);
    });

    it("should return 400 if the customer phone has less than 10 characters", async () => {
      body.customer.phone = "123456789";
      const res = await sendRequest();

      expect(res.status).toBe(400);
    });

    it("should return 400 if the customer phone has more than 20 characters", async () => {
      body.customer.phone = new Array(22).join("a");
      const res = await sendRequest();

      expect(res.status).toBe(400);
    });

    it("should save the user if it's valid", async () => {
      await sendRequest();
      const user = await User.find({ email: body.user.email });

      expect(user).not.toBeNull();
    });

    it("should save the customer if it's valid", async () => {
      await sendRequest();
      const customer = await Customer.find(body.customer);

      expect(customer).not.toBeNull();
    });

    it("should return 201 if the user and customer were created", async () => {
      const res = await sendRequest();

      expect(res.status).toBe(201);
    });

    it("should return the customer if it's valid", async () => {
      const res = await sendRequest();

      expect(res.body).toHaveProperty("_id");
      expect(res.body).toHaveProperty("name", body.customer.name);
      expect(res.body).toHaveProperty("phone", body.customer.phone);
      expect(res.body).toHaveProperty("user._id");
      expect(res.body).toHaveProperty("user.email", body.user.email);
    });

    // TODO: El Token
  });

  describe("PUT /:id", () => {
    let token;
    let customer;
    let id;

    const sendRequest = async () => {
      return request(server)
        .put("/api/customers/" + id)
        .set("x-auth-token", token)
        .send(customer);
    };

    beforeEach(async () => {
      // Before each test we need to create a customer and
      // put it in the database.
      oldCustomer = new Customer({
        name: "customer",
        phone: "1234567890",
        user: {
          _id: mongoose.Types.ObjectId(),
          email: "email@mail.com",
        },
      });

      await oldCustomer.save();

      token = oldCustomer.generateAuthToken();
      id = oldCustomer._id;
      customer = { name: "new name", phone: "new phone number" };
    });

    it("should return 401 if the user is not logged in", async () => {
      token = "";
      const res = await sendRequest();

      expect(res.status).toBe(401);
    });

    it("should return 401 if the token is invalid", async () => {
      token = "a";
      const res = await sendRequest();

      expect(res.status).toBe(401);
    });

    it("should return 403 if the user is not a customer", async () => {
      token = new Studio({ user: {} }).generateAuthToken();
      const res = await sendRequest();

      expect(res.status).toBe(403);
    });

    it("should return 400 if the id is invalid", async () => {
      id = 1;
      const res = await sendRequest();

      expect(res.status).toBe(400);
    });

    it("should return 403 if the customer is a different customer", async () => {
      token = new Customer({ user: {} }).generateAuthToken();
      const res = await sendRequest();

      expect(res.status).toBe(403);
    });

    it("should return 404 if the customer with the given id was not found", async () => {
      const customer = new Customer({ user: {} });
      token = customer.generateAuthToken();
      id = customer._id;
      const res = await sendRequest();

      expect(res.status).toBe(404);
    });

    it("should return 400 if the name is missing", async () => {
      customer.name = undefined;
      const res = await sendRequest();

      expect(res.status).toBe(400);
    });

    it("should return 400 if the name has less than 5 characters", async () => {
      customer.name = "1234";
      const res = await sendRequest();

      expect(res.status).toBe(400);
    });

    it("should return 400 if the customer name has more than 60 characters", async () => {
      customer.name = new Array(62).join("a");
      const res = await sendRequest();

      expect(res.status).toBe(400);
    });

    it("should return 400 if the phone is missing", async () => {
      customer.phone = undefined;
      const res = await sendRequest();

      expect(res.status).toBe(400);
    });

    it("should return 400 if the phone has less than 10 characters", async () => {
      customer.phone = "123456789";
      const res = await sendRequest();

      expect(res.status).toBe(400);
    });

    it("should return 400 if the customer phone has more than 20 characters", async () => {
      customer.phone = new Array(22).join("a");
      const res = await sendRequest();

      expect(res.status).toBe(400);
    });

    it("should update the customer if the input is valid", async () => {
      await sendRequest();
      const updatedCustomer = await Customer.findById(id);

      expect(updatedCustomer.name).toBe(customer.name);
      expect(updatedCustomer.phone).toBe(customer.phone);
    });

    it("should return 200 if the customer was updated", async () => {
      const res = await sendRequest();

      expect(res.status).toBe(200);
    });

    it("should return the updated customer if it's valid", async () => {
      const res = await sendRequest();

      expect(res.body).toHaveProperty("_id");
      expect(res.body).toHaveProperty("name", customer.name);
      expect(res.body).toHaveProperty("phone", customer.phone);
    });
  });

  describe("DELETE /:id", () => {
    let token;
    let id;

    const sendRequest = async () => {
      return await request(server)
        .delete("/api/customers/" + id)
        .set("x-auth-token", token)
        .send();
    };

    beforeEach(async () => {
      // Before each test we need to create a customer and
      // put it in the database.
      const customer = new Customer({
        name: "customer",
        phone: "1234567890",
        user: {
          _id: mongoose.Types.ObjectId(),
          email: "email@mail.com",
        },
      });

      await customer.save();

      id = customer._id;
      token = customer.generateAuthToken();
    });

    it("should return 401 if the user is not logged in", async () => {
      token = "";
      const res = await sendRequest();

      expect(res.status).toBe(401);
    });

    it("should return 401 if the token is invalid", async () => {
      token = "a";
      const res = await sendRequest();

      expect(res.status).toBe(401);
    });

    it("should return 403 if the user is not a customer", async () => {
      token = new Studio({ user: {} }).generateAuthToken();
      const res = await sendRequest();

      expect(res.status).toBe(403);
    });

    it("should return 400 if the id is invalid", async () => {
      id = 1;
      const res = await sendRequest();

      expect(res.status).toBe(400);
    });

    it("should return 403 if the customer is a different customer", async () => {
      token = new Customer({ user: {} }).generateAuthToken();
      const res = await sendRequest();

      expect(res.status).toBe(403);
    });

    it("should return 404 if the customer with the given id was not found", async () => {
      const customer = new Customer({ user: {} });
      token = customer.generateAuthToken();
      id = customer._id;
      const res = await sendRequest();

      expect(res.status).toBe(404);
    });

    it("should delete the customer if it exists", async () => {
      await sendRequest();
      const customer = await Customer.findById(id);

      expect(customer).toBeNull();
    });

    it("should return 200 if the customer was deleted", async () => {
      const res = await sendRequest();

      expect(res.status).toBe(200);
    });
  });
});
