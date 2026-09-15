import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config("../");
export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ msg: "Authentication required" }); 
    }

    const token = authHeader.split(" ")[1];
    if(!token){
        return res.status(401).json({msg:"Authentication required"});
    }
    const decode = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decode;
    next();
  } catch (err) {
    if(err.name === "TokenExpiredError"){
        return res.status(401).json({
            msg:"Token expired"
        });
    }
    if(err.name === "JsonWebTokenError"){
        return res.status(401).json({
            msg:"Invalid Token"
        });
    }
     
    return res.status(500).json({
      msg: "Internal Server Error",
      err: err,
    });
  }
};
