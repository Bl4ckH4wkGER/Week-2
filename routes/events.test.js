const request = require("supertest");

const server = require("../server");
const testUtils = require('../test-utils');

describe("/events", () => {
  beforeAll(testUtils.connectDB);
  afterAll(testUtils.stopDB);  
  
  afterEach(testUtils.clearDB)
  
  describe("GET /:eventId", () => {
    let calendar1;

    beforeEach(async () => {
      calendar1 = (await request(server).post("/calendars").send({ name: 'calendar1' })).body;
    });

    it("should return 404 if no matching eventId", async () => {
      const res = await request(server).get("/calendars/" + calendar1._id + "/events/notAnEventId");
      expect(res.statusCode).toEqual(404);
    });
  });
  
  describe('POST /', () => {
    let calendar1;

    beforeEach(async () => {
      calendar1 = (await request(server).post("/calendars").send({ name: 'calendar1' })).body;
    });

    it('should return a 400 without a provided name', async () => {
      const res = await request(server).post("/calendars/" + calendar1._id + "/events/").send({ date: '2020-02-02' });
      expect(res.statusCode).toEqual(400);    
    });

    it('should return a 400 without a provided date', async () => {
      const res = await request(server).post("/calendars/" + calendar1._id + "/events/").send({ name: 'event1' });
      expect(res.statusCode).toEqual(400);    
    });
  });
  
  describe('GET /:eventId after multiple POST /', () => {
    let calendar1, calendar2, event1, event2;

    beforeEach(async () => {
      calendar1 = (await request(server).post("/calendars").send({ name: 'calendar1' })).body;
      event1 = (await request(server).post("/calendars/" + calendar1._id + "/events/").send({
        name: 'event1',
        date: '2020-01-01'
      })).body; 
      calendar2 = (await request(server).post("/calendars").send({ name: 'calendar2' })).body;
      event2 = (await request(server).post("/calendars/" + calendar2._id + "/events/").send({
        name: 'event2',
        date: '2020-02-02'
      })).body; 
    });

    it('should return event1 nested under calendar1', async () => {
      const res = await request(server).get("/calendars/" + calendar1._id + "/events/" + event1._id);
      expect(res.statusCode).toEqual(200);    
      const storedEvent = res.body;
      expect(storedEvent).toMatchObject({ 
        name: 'event1',
        date: '2020-01-01T00:00:00.000Z', 
        _id: event1._id 
      });
    });

    it('should return event2 nested under calendar2', async () => {
      const res = await request(server).get("/calendars/" + calendar2._id + "/events/" + event2._id);
      expect(res.statusCode).toEqual(200);    
      const storedEvent = res.body;
      expect(storedEvent).toMatchObject({ 
        name: 'event2',
        date: '2020-02-02T00:00:00.000Z', 
        _id: event2._id 
      });
    });
  });
  
  describe('GET / after multiple POST /', () => {
    let calendar1, calendar2, event1, event2;

    beforeEach(async () => {
      calendar1 = (await request(server).post("/calendars").send({ name: 'calendar1' })).body;
      event1 = (await request(server).post("/calendars/" + calendar1._id + "/events/").send({
        name: 'event1',
        date: '2020-01-01'
      })).body; 
      calendar2 = (await request(server).post("/calendars").send({ name: 'calendar2' })).body;
      event2 = (await request(server).post("/calendars/" + calendar2._id + "/events/").send({
        name: 'event2',
        date: '2020-02-02'
      })).body; 
    });

    it('should return all events', async () => {
      const res = await request(server).get("/calendars/" + calendar1._id + "/events/");
      expect(res.statusCode).toEqual(200);    
      const storedCalendars = res.body;
      expect(storedCalendars).toMatchObject([event1, event2]);
    });
  });
  
  describe('PUT /:eventId after POST /', () => {
    let calendar1, event1;

    beforeEach(async () => {
      calendar1 = (await request(server).post("/calendars").send({ name: 'calendar1' })).body;
      event1 = (await request(server).post("/calendars/" + calendar1._id + "/events/").send({
        name: 'event1',
        date: '2020-01-01'
      })).body;
    });

    it('should store and return event1 with new name and new date', async () => {
      const res = await request(server)
        .put("/calendars/" + calendar1._id + "/events/" + event1._id)
        .send({ name: 'event1New', date: '2020-03-03'});
      expect(res.statusCode).toEqual(200); 

      const storedEvent = (await request(server).get("/calendars/" + calendar1._id + "/events/" + event1._id)).body;
      expect(storedEvent).toMatchObject({ 
        name: 'event1New',
        date: '2020-03-03T00:00:00.000Z', 
        _id: event1._id 
      });
    });
  });
  
  describe('DELETE /:eventId after POST /', () => {    
    let calendar1, event1, event2;

    beforeEach(async () => {
      calendar1 = (await request(server).post("/calendars").send({ name: 'calendar1' })).body;
      event1 = (await request(server).post("/calendars/" + calendar1._id + "/events/").send({
        name: 'event1',
        date: '2020-01-01'
      })).body;
      event2 = (await request(server).post("/calendars/" + calendar1._id + "/events/").send({
        name: 'event2',
        date: '2020-02-02'
      })).body;
    });

    it('should delete event2', async () => {
      const res = await request(server).delete("/calendars/" + calendar1._id + "/events/" + event2._id);
      expect(res.statusCode).toEqual(200);
      const storedEventResponse = (await request(server).get("/calendars/" + calendar1._id + "/events/" + event2._id));
      expect(storedEventResponse.status).toEqual(404);
    });
  });
});