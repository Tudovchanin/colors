export class DataStore {
  _data = [];

  constructor(data = []) {
    this._data = data;
  }

  get data() {
    return this._data;
  }

  set data(value) {
    this._data = value;
  }
}
