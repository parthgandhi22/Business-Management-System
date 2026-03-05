const Message = require("../models/Message");

async function createMessage({ sender, receiver, type, message }) {

  await Message.create({
    sender,
    receiver,
    type,
    message
  });

}

module.exports = createMessage;