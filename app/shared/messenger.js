const defer = require('tiny-defer');
const uuid = require('uuid');

const REQUEST = 'ELECTRON-MESSENGER-REQUEST';
const RESPONSE = 'ELECTRON-MESSENGER-RESPONSE';

module.exports = class Messenger {

  constructor(sender, receiver) {
    this.sender = sender;
    this.receiver = receiver;
    this.listenersByTopic = new Map();
    this.deferredsToSettleAfterWeGotAResponseById = new Map();

    receiver.on(REQUEST, (event, args) => {
      const id = args.id;
      const topic = args.topic;
      const requestData = args.data;

      Promise.resolve(this.listenersByTopic.get(topic))
        .then(listener => {
          if (!listener) throw new Error(`No listener for topic '${topic}' available`);
          return listener(requestData);
        })
        .then(responseData => {
          event.sender.send(RESPONSE, {
            id: id,
            topic: topic,
            data: responseData
          });
        })
        .catch(error => {
          event.sender.send(RESPONSE, {
            id: id,
            topic: topic,
            error: error.message || error
          });          
        });
    });

    receiver.on(RESPONSE, (event, args) => {
      const id = args.id;
      const topic = args.topic;
      const responseData = args.data;
      const responseError = args.error;
      const deferred = this.deferredsToSettleAfterWeGotAResponseById.get(id);
      this.deferredsToSettleAfterWeGotAResponseById.delete(id);
      if (responseError) {
        deferred.reject(responseError);
      } else {
        deferred.resolve(responseData);
      }
    });
  }

  on(topic, callback) {
    if (this.listenersByTopic.has(topic)) {
      throw new Error(`Listener for topic '${topic}' is already registered.`);
    }

    this.listenersByTopic.set(topic, callback);
  }

  off(topic, callback) {
    if (this.listenersByTopic.has(topic)) {
      this.listenersByTopic.delete(topic, callback);
    }
  }

  send(topic, data) {
    const id = uuid.v4();
    const deferred = defer();
    this.deferredsToSettleAfterWeGotAResponseById.set(id, deferred);
    this.sender.send(REQUEST, {
      id: id,
      topic: topic,
      data: data
    });
    return deferred.promise;
  }

}
