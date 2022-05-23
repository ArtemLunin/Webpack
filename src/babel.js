let start = new Promise(function (resolve) {
  resolve("async is working")
});
start.then(console.log)

const unused = 42;
console.log(unused);