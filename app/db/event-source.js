import Dexie from "dexie";

const getNextRank = (function () {
  let current = 0;
  return () => ++current;
})();

function create(store) {

  const eventSource = {};

  eventSource.addEvent = function (cid, data) {
    return store
      .add({ cid: cid, rank: getNextRank(), data: data });
  };

  eventSource.getEvents = function (cid) {
    return store
      .where("cid")
      .equals(cid)
      .sortBy("rank")
      .then(x => x.map(y => y.data));
  };

  eventSource.removeEvents = function (cid) {
    return store
      .where("cid").equals(cid)
      .toArray()
      .then(items => Promise.all(items.map(item => store.delete(item.id))));
  };

  eventSource.reduce = function (cid, build) {
    return eventSource.getEvents(cid)
      .then(events => build(events))
      .then(projection => {
        return eventSource.removeEvents(cid)
          .then(() => eventSource.addEvent(cid, projection));
      });
  };

  return eventSource;
}

export default { create };
