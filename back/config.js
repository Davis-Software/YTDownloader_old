const path = require("path")


exports.platform = process.platform === "win32" ? "win32" : "unix"
exports.icon_path = path.join(__dirname, "..", "static", "logo", "512x512" + (exports.platform === "win32" ? ".ico" : ".png"))

exports.dev_mode = true
