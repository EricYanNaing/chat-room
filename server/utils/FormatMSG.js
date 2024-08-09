module.exports = format = (username, message) => {
  return { username, message, send_at: Date.now() };
};
