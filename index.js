import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import dayjs from "dayjs";

import * as participantController from './controllers/participants.controller.js';
import * as messagesController from './controllers/messages.controllers.js';
import mongo from "./db/db.js";

let db = await mongo();

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Participants
app.post("/participants", participantController.create);

app.get("/participants", participantController.list);

// Messages
app.post("/messages", messagesController.create);

app.get("/messages", messagesController.list);

app.post("/status", async (req, res) => {
  const { user } = req.headers;

  try {
    const existingParticipant = await db
      .collection("participants")
      .findOne({ name: user });

    if (!existingParticipant) {
      res.sendStatus(404);
      return;
    }

    await db
      .collection("participants")
      .updateOne({ name: user }, { $set: { lastStatus: Date.now() } });

    res.sendStatus(200);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

setInterval(async () => {
  console.log("removendo geral!");
  // O método Date.now() retorna o número de milisegundos decorridos desde 1 de janeiro de 1970 00:00:00 UTC.
  const seconds = Date.now() - 10 * 1000; // 10s
  console.log(seconds);

  try {
    const inactiveParticipants = await db
      .collection("participants")
      .find({ lastStatus: { $lte: seconds } }) // Apaga se o ultimo status for menor ou igual a 10 segundos atrás do horario de agora
      .toArray();

    if (inactiveParticipants.length > 0) {
      const inativeMessages = inactiveParticipants.map(
        (inactivesParticipant) => {
          return {
            from: inactivesParticipant.name,
            to: "Todos",
            text: "sai da sala...",
            type: "status",
            time: dayjs().format("HH:mm:ss"),
          };
        }
      );

      await db.collection("messages").insertMany(inativeMessages);
      await db
        .collection("participants")
        .deleteMany({ lastStatus: { $lte: seconds } });
    }
  } catch (error) {
    console.error(error)
  }
}, 15000);


app.listen(5000, () => console.log(`App running in port: 5000`));