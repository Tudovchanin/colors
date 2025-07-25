export class DataApi {
  constructor(api, options = {}) {
    this.api = api;
    this.options = options
  }
  async getData() {
    try {
      const response = await fetch(this.api, this.options);

      if (response.ok) {
        const result = await response.json();
        return result;
      } else {
        if (response.status === 404) throw new Error("404, Not found");
        if (response.status === 500)
          throw new Error("500, internal server error");
        throw new Error(response.status);
      }
    } catch (error) {
      console.error("Fetch", error);
    }
  }
}
