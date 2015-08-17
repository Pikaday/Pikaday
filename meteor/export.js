// Pickaday.js makes `Pickaday` global object, while Meteor expects a file-scoped global variable
Pikaday = this.Pikaday;
try {
    delete this.Pikaday;
} catch (e) {
}
