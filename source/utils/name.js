
var names = {
  format: function (user) {
    return user.lastName ? user.firstName + ' ' + user.lastName : user.firstName
  }
};

module.exports = names;