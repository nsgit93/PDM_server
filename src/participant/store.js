import dataStore from 'nedb-promise';

export class ParticipantStore {
  constructor({ filename, autoload }) {
    this.store = dataStore({ filename, autoload });
  }
  
  async find(props) {
    return this.store.find(props);
  }
  
  async findOne(props) {
    return this.store.findOne(props);
  }
  
  async insert(participant) {
    console.log("Participant store: create");
    participant._id = participant._id.toString();
    console.log(participant)
    let name = participant.name;
    if (!name) { // validation
      throw new Error('Missing text property')
    }
    let age = participant.age
    if (age < 6 || age > 15){
      throw new Error('Age must be at least 6 y.o. and maximum 15 y.o.')
    }
    return this.store.insert(participant);
  };
  
  async update(props, participant) {
    console.log("Participant store: update");
    console.log(props)
    participant._id = participant._id.toString();
    console.log(participant)
    return this.store.update(props, participant);
  }
  
  async remove(props) {
    return this.store.remove(props);
  }
}

export default new ParticipantStore({ filename: './db/participants.json', autoload: true });