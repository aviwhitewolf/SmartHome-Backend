const jwt       = require('jsonwebtoken')
const shortid   = require('shortid')
const secretKey = 'askofj348@I$UED(XWXM29red2209(S@X@(ngnkdfg785eytwajszfb83i4e2dwnG@&RJD#*$39r%#(RI@)MDThatNobocmekjf23fje43g';

let generateToken = (data, cb) => {

  try {
    let claims = {
      jwtid : shortid.generate(),
      iat   : Date.now(),
      exp   : Math.floor(Date.now() / 1000) + (60 * 60 * 84),
      sub   : 'authToken',
      iss   : 'uncia',
      data  : data
    }
    // token details
    let tokenDetails = {
      token: jwt.sign(claims, secretKey),
      tokenSecret : secretKey
    }
    //callback function
    cb(null, tokenDetails)
  } catch (err) {
    cb(err, null)
  }
}// end generate token 

let verifyClaim = (token, secretKey, cb) => {
  // verify a token symmetric
  jwt.verify(token, secretKey, function (err, decoded) {
    if(err){
      cb(err,null)
    }
    else{
      cb(null,decoded);
    }  
 
 
  });


}// end verify claim 

let verifyClaimWithoutSecret = (token,cb) => {
  // verify a token symmetric
  jwt.verify(token, secretKey, function (err, decoded) {
    if(err){
      cb(err)
    }
    else{
      cb (null, decoded)
    }  
 
 
  });


}// end verify claim 

module.exports = {
  generateToken: generateToken,
  verifyToken :verifyClaim,
  verifyClaimWithoutSecret: verifyClaimWithoutSecret
}
