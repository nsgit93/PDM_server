import dataStore from 'nedb-promise';

export class ParticipantIdStore {
  constructor({ filename, autoload }) {
    this.store = dataStore({ filename, autoload });
  }
  
  async findCurrentId(props) {
    console.log("ID store: find current id");
    // return this.store.find(props).then(res => {
    //   return res;})
    return this.store.find(props);
  }
  
  
  async incrementCurrentId(props) {
    console.log("ID store: increment");
    var new_id = parseInt(props.currentId);
    new_id = new_id + 1;
    // console.log("New id:")
    // console.log(new_id);
    var new_props = {_id: "1", currentId: new_id.toString()}
    //console.log("New id:");
    // console.log(new_props);
    return this.store.update({_id:"1"}, new_props);
  }
}

export default new ParticipantIdStore({ filename: './db/current_id.json', autoload: true });