'use srict'

let trim = (x) => {
  let value = String(x)
  return value.replace(/^\s+|\s+$/gm, '')
}
// trim and check isEmpty
let isEmpty = (value) => {
  if (value === null || value === undefined || trim(value) === '' || trim(value).length === 0) {
    return true
  } else {
    return false
  }
}

//check lenght
let isLongString = (value) => {
  if(value.length > 255){
    return true
  }else{
    return false
  }
}

let isObjectEmpty = (value) => {
  return (
    Object.prototype.toString.call(value) === '[object Object]' &&
    JSON.stringify(value) === '{}'
  );
}

module.exports = {
  isEmpty: isEmpty,
  isLongString : isLongString,
  isObjectEmpty : isObjectEmpty
}
