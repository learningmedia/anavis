const getNextRank = (function () {
  let current = 0;
  return () => ++current;
}());

const db = new Map();

function create(name) {
  const eventSource = {};

  eventSource.addEvent = function (cid, data) {
    if (!db.has(name)) {
      db.set(name, []);
    }
    db.get(name).push({ eventId: Date.now(), cid: cid, rank: getNextRank(), data: data });
    return Promise.resolve();
  };

  eventSource.getEvents = function (cid) {
    if (!db.has(name)) {
      db.set(name, []);
    }
    return Promise.resolve(db.get(name).filter(x => x.cid === cid).map(x => x.data));
  };

  eventSource.removeEvents = function (cid) {
    const events = db.get(name) || [];
    db.set(name, events.filter(x => x.cid !== cid));
    return Promise.resolve();
  };

  return eventSource;
}

export default { create };
