const { Router } = require("express");
const router = Router();

const CalendarDAO = require('../daos/calendars');

router.post("/", async (req, res, next) => {
  const { name } = req.body;
  if (!name) {
    res.status(400).send('body parameter "name" is required"');
  } else {
    const calendar = await CalendarDAO.create(name);
    res.json(calendar);
  }
});

router.get("/:id", async (req, res, next) => {
  const calendar = await CalendarDAO.getById(req.params.id);
  if (calendar) {
    res.json(calendar);
  } else {
    res.sendStatus(404);
  }
});

router.get("/", async (req, res, next) => {
  const calendar = await CalendarDAO.getAll();
  if (calendar) {
    res.json(calendar);
  } else {
    res.sendStatus(404);
  }
});

//put passes at this point
router.put("/:id", async (req, res, next) => {
  const calendarId = req.params.id;
  const calendar = req.body;
  if (!calendar) {
    res.status(404).send('calendar is required"');
  } else {
    const updatedCalendar = await CalendarDAO.updateById(calendarId, calendar);
    res.json(updatedCalendar);
  }
})

//delete passes at this point
router.delete("/:id", async (req, res, next) => {
  const calendarId = req.params.id;
    try {
      await CalendarDAO.deleteById(calendarId);
      res.sendStatus(200);
    } catch(e) {
      res.status(500).send(e.message);
    }
})

module.exports = router;