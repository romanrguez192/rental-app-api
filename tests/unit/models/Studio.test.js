const { Studio } = require("../../../src/models/Studio");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const config = require("config");

describe("Studio.generateAuthToken", () => {
  it("should return a valid JWT", () => {
    const studio = new Studio({
      name: "My studio",
      user: {
        _id: new mongoose.Types.ObjectId(),
        email: "email@mail.com",
      },
    });

    const token = studio.generateAuthToken();
    const jwtSecretKey = config.get("jwtSecretKey");
    const payload = jwt.verify(token, jwtSecretKey);

    const expectedPayload = {
      userId: studio.user._id,
      studioId: studio._id,
      role: "Studio",
    };

    expect(payload).toMatchObject(expectedPayload);
  });
});
