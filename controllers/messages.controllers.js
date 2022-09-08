import joi from "joi";
import dayjs from "dayjs";

import mongo from "../db/db.js";

const messageSchema = joi.object({
    from: joi.string().required(),
    to: joi.string().min(1).required(),
    text: joi.string().min(1).required(),
    type: joi.string().valid("message", "private_message").required(),
    time: joi.string(),
  });
  
  let db = await mongo()


const create = async (req, res) => {
    const { to, text, type } = req.body;
    const { user } = req.headers;
  
    try {
      const message = {
        from: user,
        to,
        text,
        type,
        time: dayjs().format("HH:mm:ss"),
      };
  
      const validation = messageSchema.validate(message, {
        abortEarly: false,
      });
  
      if (validation.error) {
        const errors = validation.error.details.map((detail) => detail.message);
        res.status(422).send(errors);
        return;
      }
  
      const participantIsExist = await db
        .collection("participants")
        .findOne({ name: user });
  
      if (!participantIsExist) {
        res.send(409);
        return;
      }
  
      await db.collection("messages").insertOne(message);
  
      res.send(201);
    } catch (error) {
      res.status(500).send(error.message);
    }
  }

  const list = async (req, res) => {
    const limit = parseInt(req.query.limit);
    const { user } = req.headers;
    try {
      const messages = await db.collection("messages").find().toArray();
      const filteredMessages = messages.filter((message) => {
        const { from, to, type } = message;
        const toUser = to === "Todos" || to === user || from === user;
        const isPublic = type === "message";
  
        return toUser || isPublic; // true/false
      });
  
      if (limit && limit !== NaN) {
        return res.send(filteredMessages.slice(-limit));
      }
  
      res.send(filteredMessages);
    } catch (error) {
      res.status(500).send(error.message);
    }
  }

  export {
    create,
    list
  }