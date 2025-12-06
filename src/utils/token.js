const jwt = require("jsonwebtoken");
require("dotenv").config();

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

function signAccess(user) {
  return jwt.sign(
    {
      id: user.id,
      role: user.role,
    },
    JWT_ACCESS_SECRET,
    {
      expiresIn: "15m",
    }
  );
}

function signRefresh(user){
    return jwt.sign(
        {
            id:user.id,
            role: user.role
        },
        JWT_REFRESH_SECRET,
        {
            expiresIn:'30d'
        }
    )
}

module.exports = {signAccess,signRefresh}
