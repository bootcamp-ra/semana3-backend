import joi from "joi";
import dayjs from "dayjs";

import mongo from "../db/db.js";

const participantSchema = joi.object({
    name: joi.string().min(1).required(),
  });

  let db = await mongo()
  
const create = async (req, res) => {
    const participant = req.body;
  
    const validation = participantSchema.validate(participant, {
      abortEarly: false,
    });
    if (validation.error) {
      const errors = validation.error.details.map((detail) => detail.message);
      res.status(422).send(errors);
      return;
    }
  
    try {
      const participantExists = await db
        .collection("participants")
        .findOne({ name: participant.name });
  
      if (participantExists) {
        res.send(409);
        return;
      }
  
      await db.collection("participants").insertOne({
        name: participant.name,
        lastStatus: Date.now(),
      });
  
      await db.collection("messages").insertOne({
        from: participant.name,
        to: "Todos",
        text: "entra na sala...",
        type: "status",
        time: dayjs().format("HH:mm:ss"),
      });
  
      res.send(201);
    } catch (error) {
      res.status(500).send(error.message);
    }
  }


  const list = async (req, res) => {
    try {
      const participants = await db.collection("participants").find().toArray();
      if (!participants) {
        res.status(404).send("Nenhum participante foi encontrado!");
        return;
      }
      res.send(participants);
    } catch (error) {
      res.status(500).send(error.message);
    }
  }

  export {
    create,
    list,
  }