const { Router } = require("express");
const router = Router();

const EventDAO = require('../daos/events');

router.post("/", async (req, res, next) => {
    const { name, date } = req.body;
    if (!name || !date ) {
      res.status(400).send('body parameters "name" and "date" are required');
    } else {
      const event = await EventDAO.create(name, date);
      res.json(event);
    }
});

router.get("/:eventId", async (req, res, next) => {
    const event = await EventDAO.getById(req.params.eventId);
    if (event) {
      res.json(event);
    } else {
      res.sendStatus(404);
    }
});

router.get("/", async (req, res, next) => {
    const event = await EventDAO.getAll();
    if (event) {
      res.json(event);
    } else {
      res.sendStatus(404);
    }
});

router.put("/:eventId", async (req, res, next) => {
    const eventId = req.params.eventId;
    const event = req.body;
    if (!event) {
      res.status(404).send('event is required"');
    } else {
      const updatedEvent = await EventDAO.updateById(eventId, event);
      res.json(updatedEvent);
    }
})

router.delete("/:eventId", async (req, res, next) => {
    const eventId = req.params.eventId;
    try {
        await EventDAO.deleteById(eventId);
        res.sendStatus(200);
    } catch(e) {
        res.status(500).send(e.message);
    }
})

module.exports = router;